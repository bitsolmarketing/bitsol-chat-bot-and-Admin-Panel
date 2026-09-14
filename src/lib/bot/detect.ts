import type { BotConfig } from "./schema";
import { hasPhrase, normalise, wordCount } from "./text";
import { BOT_INTENTS, SERVICE_INTENTS, type BotIntent } from "./types";

/**
 * =============================================================================
 *  Deterministic detection
 * =============================================================================
 *
 *  Everything the router has to decide *before* a model is involved: which
 *  intent a message expresses, whether the customer is upset, wants a person,
 *  wants to stop receiving messages, or is describing an enterprise.
 *
 *  Keyword work on purpose. It is instant, free, testable and predictable —
 *  the model still writes every open-ended reply and reads the details back
 *  out afterwards, but it never decides whether a ticket gets opened.
 *
 *  Keywords cover English, Roman Urdu and Urdu script, and administrators can
 *  add more per intent from the studio.
 * =============================================================================
 */

type Weighted = Array<[phrase: string, weight: number]>;

/** Service intents: what the customer is interested in. */
const SERVICE_KEYWORDS: Partial<Record<BotIntent, Weighted>> = {
  WHATBOT_PRO: [["whatbot", 6], ["what bot", 5], ["whatbot pro", 6]],
  WHATSAPP_CHATBOT: [
    ["whatsapp chatbot", 5], ["whatsapp chat bot", 5], ["whatsapp bot", 5], ["whatsapp ai", 5],
    ["whatsapp automation", 5], ["whatsapp api", 5], ["whatsapp business api", 5], ["cloud api", 3],
    ["team inbox", 3], ["shared inbox", 3], ["whatsapp broadcast", 4], ["bulk whatsapp", 4],
    ["whatsapp marketing", 3], ["whatsapp", 2], ["watsapp", 2], ["whatsap", 2], ["واٹس ایپ", 2],
  ],
  AI_SALES_AGENT: [["ai sales agent", 6], ["sales agent", 3], ["ai sales", 4], ["sales bot", 4], ["ai sdr", 5]],
  AI_CUSTOMER_SUPPORT: [
    ["ai customer support", 6], ["customer support bot", 5], ["support bot", 4], ["ai support", 4],
    ["chatbot", 2], ["chat bot", 2], ["website chatbot", 4], ["live chat", 2], ["چیٹ بوٹ", 2],
  ],
  AI_AGENT: [
    ["ai agent", 5], ["ai agents", 5], ["autonomous agent", 5], ["agentic", 4], ["ai employee", 4],
    ["ai receptionist", 5], ["virtual receptionist", 5], ["receptionist", 2],
  ],
  N8N_AUTOMATION: [["n8n", 6], ["make.com", 5], ["zapier", 4], ["integromat", 4]],
  CRM: [["crm", 4], ["hubspot", 4], ["zoho", 3], ["salesforce", 4], ["lead management system", 4], ["سی آر ایم", 4]],
  AI_AUTOMATION: [
    ["automation", 3], ["automate", 3], ["automated", 2], ["workflow", 2], ["ai solution", 3],
    ["artificial intelligence", 2], ["ai integration", 3], ["ai", 1], ["آٹومیشن", 3], ["khudkar", 2],
  ],
  SEO: [
    ["seo", 5], ["search engine", 4], ["rank on google", 5], ["google ranking", 5], ["first page", 3],
    ["google maps", 3], ["local seo", 6], ["organic traffic", 4], ["backlinks", 4], ["ranking", 2],
    ["google traffic", 4], ["ایس ای او", 5],
  ],
  META_ADS: [
    ["meta ads", 6], ["facebook ads", 6], ["instagram ads", 6], ["fb ads", 6], ["boost post", 4],
    ["facebook marketing", 3], ["instagram marketing", 3], ["retargeting", 3], ["remarketing", 3],
  ],
  GOOGLE_ADS: [
    ["google ads", 6], ["adwords", 6], ["ppc", 5], ["youtube ads", 5], ["search ads", 4],
    ["performance max", 5], ["google shopping", 4],
  ],
  TIKTOK_ADS: [["tiktok ads", 6], ["tiktok marketing", 5], ["tiktok", 3], ["tik tok", 3], ["ٹک ٹاک", 3]],
  SOCIAL_MEDIA: [
    ["social media", 4], ["smm", 4], ["linkedin", 3], ["page management", 3], ["followers", 2],
    ["instagram page", 3], ["facebook page", 3], ["سوشل میڈیا", 4],
  ],
  LEAD_GENERATION: [
    ["lead generation", 5], ["leads", 3], ["more customers", 4], ["more clients", 4], ["new customers", 3],
    ["customers chahiye", 4], ["clients chahiye", 4], ["increase sales", 3], ["grow my business", 3],
    ["enquiries", 2], ["inquiries", 2], ["marketing", 1], ["لیڈز", 3], ["گاہک", 2],
  ],
  CONTENT: [["content marketing", 5], ["content writing", 5], ["copywriting", 4], ["blog", 3], ["articles", 2]],
  BRANDING: [["branding", 5], ["logo", 4], ["brand identity", 5], ["rebrand", 5], ["برانڈنگ", 5]],
  WEBSITE: [
    ["website", 4], ["web site", 4], ["landing page", 4], ["wordpress", 4], ["webpage", 3],
    ["web page", 3], ["ویب سائٹ", 4], ["site", 1],
  ],
  E_COMMERCE: [
    ["ecommerce", 5], ["e-commerce", 5], ["e commerce", 5], ["online store", 5], ["shopify", 5],
    ["woocommerce", 5], ["online shop", 5],
  ],
  MOBILE_APP: [
    ["mobile app", 5], ["android app", 5], ["ios app", 5], ["iphone app", 5], ["app development", 5],
    ["app", 2], ["ایپ", 3],
  ],
  SOFTWARE: [
    ["software", 4], ["web app", 4], ["web application", 5], ["portal", 3], ["dashboard", 2],
    ["saas", 4], ["erp", 3], ["api integration", 4], ["سافٹ ویئر", 4],
  ],
};

/** Request intents: what the customer wants to happen. */
const REQUEST_KEYWORDS: Partial<Record<BotIntent, Weighted>> = {
  QUOTE: [
    ["quote", 5], ["quotation", 5], ["estimate", 3], ["proposal", 3], ["کوٹیشن", 5],
  ],
  DEMO: [["demo", 5], ["demonstration", 5], ["free trial", 4], ["trial", 2], ["ڈیمو", 5]],
  PRICING: [
    ["price", 4], ["pricing", 4], ["cost", 4], ["costs", 4], ["how much", 4], ["rate", 2], ["rates", 3],
    ["charges", 4], ["fee", 3], ["fees", 3], ["package", 2], ["packages", 3], ["kitne ka", 5],
    ["kitna", 3], ["kitne", 3], ["qeemat", 5], ["qeemat kya", 5], ["charges kya", 5], ["قیمت", 5],
    ["کتنے کا", 5], ["خرچہ", 4],
  ],
  SUPPORT: [
    ["not working", 4], ["stopped working", 4], ["existing client", 4], ["support ticket", 5],
    ["kaam nahi kar", 4], ["band ho gaya", 3], ["error", 3], ["bug", 3], ["crashed", 3], ["is down", 3],
    ["technical issue", 4], ["help with my project", 4], ["my project", 2], ["support", 2],
    ["issue", 1], ["problem", 1], ["masla", 1], ["خراب", 3], ["مسئلہ", 1],
  ],
  BILLING: [
    ["invoice", 5], ["billing", 5], ["payment", 3], ["refund", 5], ["charged", 4], ["receipt", 3],
    ["bill", 3], ["بل", 3], ["ادائیگی", 4],
  ],
  PARTNERSHIP: [
    ["partnership", 5], ["partner with", 5], ["reseller", 5], ["white label", 5], ["white-label", 5],
    ["affiliate", 4], ["collaborate", 3], ["collaboration", 3],
  ],
  CAREER: [
    ["job", 3], ["jobs", 3], ["career", 4], ["careers", 4], ["hiring", 3], ["vacancy", 5], ["internship", 5],
    ["my cv", 5], ["resume", 3], ["naukri", 5], ["نوکری", 5],
  ],
};

/** Minimum weight for a request intent to steer the conversation. */
const REQUEST_THRESHOLD: Partial<Record<BotIntent, number>> = { SUPPORT: 4, CAREER: 4, PARTNERSHIP: 4 };

export interface Classification {
  /** The single best label for the message — what gets stored as the intent. */
  primary: BotIntent;
  /** The service mentioned, if any. */
  service?: BotIntent;
  /** The request expressed, if any. */
  request?: BotIntent;
}

function score(text: string, table: Partial<Record<BotIntent, Weighted>>, extra: BotConfig["intents"]) {
  const scores = new Map<BotIntent, number>();
  for (const intent of BOT_INTENTS) {
    let total = 0;
    for (const [phrase, weight] of table[intent] ?? []) {
      if (hasPhrase(text, phrase)) total += weight;
    }
    if (table === SERVICE_KEYWORDS ? SERVICE_INTENTS.includes(intent) : !SERVICE_INTENTS.includes(intent)) {
      for (const phrase of extra[intent]?.keywords ?? []) {
        if (hasPhrase(text, phrase)) total += 5;
      }
    }
    if (total > 0) scores.set(intent, total);
  }
  return scores;
}

function best(scores: Map<BotIntent, number>): BotIntent | undefined {
  let top: [BotIntent, number] | undefined;
  for (const entry of scores) {
    if (!top || entry[1] > top[1]) top = entry;
  }
  return top?.[0];
}

export function classify(message: string, config: Pick<BotConfig, "intents">): Classification {
  const text = normalise(message);
  const services = score(text, SERVICE_KEYWORDS, config.intents);
  const requests = score(text, REQUEST_KEYWORDS, config.intents);

  // "WhatsApp" alongside a chatbot word is a WhatsApp chatbot, not a generic one.
  if (services.has("WHATSAPP_CHATBOT") && services.has("AI_CUSTOMER_SUPPORT")) {
    services.set("WHATSAPP_CHATBOT", (services.get("WHATSAPP_CHATBOT") ?? 0) + (services.get("AI_CUSTOMER_SUPPORT") ?? 0));
    services.delete("AI_CUSTOMER_SUPPORT");
  }

  for (const [intent, value] of requests) {
    if (value < (REQUEST_THRESHOLD[intent] ?? 3)) requests.delete(intent);
  }

  const service = best(services);
  const request = best(requests);

  // A request that changes what happens next wins; asking about a price or a
  // demo *of something* keeps the something as the label.
  const primary =
    request && ["SUPPORT", "BILLING", "CAREER", "PARTNERSHIP", "QUOTE"].includes(request)
      ? request
      : service ?? request ?? "GENERAL_INQUIRY";

  return { primary, service, request };
}

// ------------------------------------------------------------ Conversation --

// Phrases, not single words: "I am the marketing manager" must not open a ticket.
const HUMAN_PHRASES = [
  "talk to a human", "speak to a human", "talk to human", "talk to someone", "speak to someone",
  "real person", "human agent", "live agent", "talk to a representative", "speak to a representative",
  "talk to a person", "speak to a person", "talk to your team", "speak to your team", "connect me with someone",
  "talk to your manager", "speak to your manager", "talk to the manager", "call me back",
  "insan se baat", "insaan se baat", "bande se baat", "baat karwao", "baat karwaen", "kisi se baat",
  "team se baat", "expert se baat", "manager se baat",
  "انسان سے بات", "نمائندے سے بات", "کسی سے بات",
];

const FRUSTRATION_PHRASES = [
  "complaint", "complain", "not happy", "unhappy", "disappointed", "not helpful", "useless", "frustrated",
  "angry", "worst", "pathetic", "scam", "fraud", "terrible", "ridiculous", "waste of time", "legal action",
  "bakwas", "bekar", "ghatiya", "fazool", "shikayat", "dhoka", "شکایت", "بکواس", "دھوکہ",
];

/** The customer explicitly asked for a person. */
export function wantsHuman(message: string): boolean {
  const text = normalise(message);
  return HUMAN_PHRASES.some((phrase) => hasPhrase(text, phrase));
}

/** The customer sounds upset — escalate rather than keep answering. */
export function isFrustrated(message: string, extra: string[] = []): boolean {
  const text = normalise(message);
  return [...FRUSTRATION_PHRASES, ...extra].some((phrase) => hasPhrase(text, phrase));
}

const OPT_OUT_PHRASES = [
  "stop", "unsubscribe", "opt out", "optout", "dont message", "do not message", "don't message",
  "remove me", "stop messaging", "stop sending", "stop messages", "no more messages",
  "band karo", "message mat karo", "messages mat bhejo", "mat bhejo", "پیغام نہ بھیجیں", "بند کرو",
];

const OPT_IN_PHRASES = ["start", "subscribe", "unstop", "resume messages"];

/**
 * An opt-out request. Only short messages count: "stop" on its own is a clear
 * instruction, while "don't stop the campaign" in a long message is not.
 */
export function isOptOut(message: string): boolean {
  if (wordCount(message) > 6) return false;
  const text = normalise(message);
  return OPT_OUT_PHRASES.some((phrase) => hasPhrase(text, phrase)) && !hasPhrase(text, "dont stop");
}

export function isOptIn(message: string): boolean {
  if (wordCount(message) > 3) return false;
  const text = normalise(message);
  return OPT_IN_PHRASES.some((phrase) => hasPhrase(text, phrase));
}

const MENU_PHRASES = ["menu", "main menu", "restart", "home", "start over", "مینو"];
const GREETINGS = [
  "hi", "hii", "hello", "hey", "hy", "hlo", "salam", "salaam", "aoa", "asalam o alaikum", "assalam o alaikum",
  "assalamualaikum", "assalamu alaikum", "as salam o alaikum", "good morning", "good afternoon",
  "good evening", "السلام علیکم", "سلام", "start",
];

/** "menu", "main menu" — always back to the top. */
export function isMenuRequest(message: string): boolean {
  if (wordCount(message) > 3) return false;
  const text = normalise(message);
  return MENU_PHRASES.some((phrase) => hasPhrase(text, phrase));
}

/** A message that is nothing but a greeting. */
export function isGreetingOnly(message: string): boolean {
  let text = normalise(message);
  for (const greeting of [...GREETINGS].sort((a, b) => b.length - a.length)) {
    text = text.replace(normalise(greeting), " ");
  }
  return text.replace(/\b(there|team|bitsol|sir|madam|ji|jee)\b/g, "").trim() === "";
}

const QUESTION_STARTS = [
  "what", "how", "why", "when", "where", "which", "who", "can", "could", "do", "does", "is", "are",
  "will", "would", "should", "kya", "kaise", "kesay", "kitna", "kitne", "kab", "kahan", "kaun", "konsa",
  "کیا", "کیسے", "کتنا", "کتنے", "کب", "کہاں", "کون",
];

/** A question rather than an answer — "Do you work with clinics?" */
export function isQuestion(message: string): boolean {
  const trimmed = message.trim();
  if (/[?؟]\s*$/.test(trimmed)) return true;
  const first = normalise(trimmed).trim().split(" ")[0];
  return wordCount(trimmed) >= 3 && QUESTION_STARTS.includes(first);
}

// ---------------------------------------------------------------- Industry --

const INDUSTRIES: Array<[label: string, phrases: string[]]> = [
  ["Real estate", ["real estate", "realtor", "realtors", "property", "properties", "housing society", "builders", "developers", "plots", "رئیل اسٹیٹ", "پراپرٹی"]],
  ["Healthcare", ["clinic", "clinics", "hospital", "doctor", "dental", "dentist", "healthcare", "medical", "pharmacy", "physiotherapy", "کلینک", "ہسپتال"]],
  ["E-commerce", ["ecommerce", "e-commerce", "online store", "shopify store", "online shop"]],
  ["Retail", ["retail", "shop", "boutique", "showroom", "store"]],
  ["Restaurants & food", ["restaurant", "cafe", "bakery", "food", "catering", "cloud kitchen", "ریسٹورنٹ"]],
  ["Hospitality & travel", ["hotel", "travel", "tour", "tourism", "travel agency", "umrah", "hajj", "resort"]],
  ["Automotive", ["car", "cars", "automotive", "showroom cars", "dealership", "rent a car", "auto parts"]],
  ["Beauty & wellness", ["salon", "spa", "beauty", "cosmetics", "skincare", "gym", "fitness"]],
  ["Construction", ["construction", "contractor", "interior design", "architecture", "renovation"]],
  ["Manufacturing", ["manufacturing", "factory", "textile", "garments", "exporter", "export"]],
  ["Logistics", ["logistics", "courier", "cargo", "transport", "freight", "shipping company"]],
  ["Finance & insurance", ["finance", "insurance", "bank", "fintech", "accounting firm", "loan"]],
  ["Legal", ["law firm", "lawyer", "legal services", "advocate"]],
  ["Technology & SaaS", ["saas", "software company", "tech startup", "it company", "startup"]],
  ["Agency & services", ["agency", "consultancy", "consulting firm", "recruitment"]],
];

/** A best-effort industry label from what the customer wrote. */
export function detectIndustry(message: string): string | undefined {
  const text = normalise(message);
  return INDUSTRIES.find(([, phrases]) => phrases.some((phrase) => hasPhrase(text, phrase)))?.[0];
}

// -------------------------------------------------------------- Enterprise --

export interface EnterpriseSignal {
  enterprise: boolean;
  reason?: string;
}

function parseCount(raw: string, suffix?: string): number {
  const value = Number(raw.replace(/,/g, ""));
  return suffix?.toLowerCase() === "k" ? value * 1000 : value;
}

/**
 * Whether the customer is describing an enterprise: a headcount or branch
 * count over the configured thresholds, or one of the enterprise phrases.
 */
export function detectEnterprise(
  message: string,
  companySize: string | undefined,
  config: BotConfig["enterprise"]
): EnterpriseSignal {
  const source = `${message}\n${companySize ?? ""}`;

  const people = source.match(
    /(\d[\d,]*(?:\.\d+)?)\s*(k)?\s*\+?\s*(?:employees|employee|staff|people|team members|workers|mulazim|mulazimeen|ملازمین)/i
  );
  if (people && parseCount(people[1], people[2]) >= config.employeeThreshold) {
    return { enterprise: true, reason: `${people[0].trim()}` };
  }

  const branches = source.match(/(\d+)\s*\+?\s*(?:branches|branch|locations|offices|outlets|stores|campuses|برانچز)/i);
  if (branches && Number(branches[1]) >= config.branchThreshold) {
    return { enterprise: true, reason: `${branches[0].trim()}` };
  }

  const text = normalise(message);
  const phrase = config.keywords.find((keyword) => hasPhrase(text, keyword));
  if (phrase) return { enterprise: true, reason: `mentioned "${phrase}"` };

  return { enterprise: false };
}
