import type { BotConfig } from "@/lib/bot/schema";

/**
 * =============================================================================
 *  WhatsApp assistant — routing, pricing, scoring and automation defaults
 * =============================================================================
 *
 *  PRICING: only what is listed in `DEFAULT_PRICING` is ever quoted to a
 *  customer. Every other service is quoted by the team after scoping, and the
 *  assistant says so. Change or add prices from Admin → Chatbot Studio.
 *
 *  PROOF: empty on purpose. Case studies, results and reviews reach customers
 *  only once someone at BITSOL enters verified work in the studio — until then
 *  the Our Work menu offers a strategy call instead of inventing examples.
 * =============================================================================
 */

const MARKETING = ["get_quote", "book_strategy_call", "talk_to_expert"];
const AUTOMATION = ["book_consultation", "get_quote", "talk_to_expert"];
const BUILD = ["plan_project", "get_quote", "book_consultation"];

export const DEFAULT_INTENTS: BotConfig["intents"] = {
  LEAD_GENERATION: { team: "MARKETING", serviceSlug: "digital-marketing", node: "mk_lead_generation", actions: MARKETING, keywords: [] },
  SEO: { team: "MARKETING", serviceSlug: "seo", node: "seo", actions: MARKETING, keywords: [] },
  META_ADS: { team: "MARKETING", serviceSlug: "digital-marketing", subService: "Meta Ads", node: "meta_ads", actions: MARKETING, keywords: [] },
  GOOGLE_ADS: { team: "MARKETING", serviceSlug: "digital-marketing", subService: "Google Ads", node: "google_ads", actions: MARKETING, keywords: [] },
  TIKTOK_ADS: { team: "MARKETING", serviceSlug: "digital-marketing", subService: "TikTok Ads", node: "tiktok_marketing", actions: MARKETING, keywords: [] },
  SOCIAL_MEDIA: { team: "MARKETING", serviceSlug: "social-media-marketing", node: "social_media", actions: MARKETING, keywords: [] },
  WHATSAPP_CHATBOT: {
    team: "WHATSAPP",
    serviceSlug: "whatsapp-automation",
    subService: "WhatsApp AI Chatbot",
    node: "wa_chatbot",
    actions: ["see_demo", "get_pricing", "build_my_chatbot", "talk_to_sales"],
    keywords: [],
  },
  WHATBOT_PRO: {
    team: "WHATSAPP",
    serviceSlug: "whatsapp-automation",
    subService: "WhatBot Pro",
    node: "whatbot",
    actions: ["book_demo", "view_pricing", "request_setup", "talk_to_sales"],
    keywords: [],
  },
  AI_AUTOMATION: { team: "AI_AUTOMATION", node: "business_automation", actions: AUTOMATION, keywords: [] },
  AI_AGENT: { team: "AI_AUTOMATION", serviceSlug: "ai-agents", node: "ai_agents", actions: AUTOMATION, keywords: [] },
  AI_SALES_AGENT: { team: "AI_AUTOMATION", serviceSlug: "ai-agents", subService: "AI Sales Agent", node: "ai_sales_agent", actions: AUTOMATION, keywords: [] },
  AI_CUSTOMER_SUPPORT: { team: "AI_AUTOMATION", serviceSlug: "ai-chatbots", node: "ai_customer_support", actions: AUTOMATION, keywords: [] },
  N8N_AUTOMATION: { team: "AI_AUTOMATION", subService: "n8n Automation", node: "n8n_automation", actions: AUTOMATION, keywords: [] },
  CRM: { team: "AI_AUTOMATION", serviceSlug: "software-development", subService: "CRM", node: "crm_automation", actions: AUTOMATION, keywords: [] },
  WEBSITE: { team: "WEB_SOFTWARE", serviceSlug: "website-development", node: "business_website", actions: BUILD, keywords: [] },
  E_COMMERCE: { team: "WEB_SOFTWARE", serviceSlug: "website-development", subService: "E-commerce", node: "ecommerce", actions: BUILD, keywords: [] },
  SOFTWARE: { team: "WEB_SOFTWARE", serviceSlug: "software-development", node: "custom_software", actions: BUILD, keywords: [] },
  MOBILE_APP: { team: "WEB_SOFTWARE", serviceSlug: "mobile-apps", node: "mobile_app", actions: BUILD, keywords: [] },
  BRANDING: { team: "MARKETING", serviceSlug: "branding", actions: MARKETING, keywords: [] },
  CONTENT: { team: "MARKETING", serviceSlug: "digital-marketing", subService: "Content Marketing", node: "content_marketing", actions: MARKETING, keywords: [] },
  PRICING: { team: "SALES", actions: ["get_quote", "book_strategy_call", "talk_to_expert"], keywords: [] },
  QUOTE: { team: "SALES", actions: ["get_quote"], keywords: [] },
  DEMO: { team: "WHATSAPP", actions: ["book_demo"], keywords: [] },
  SUPPORT: { team: "SUPPORT", node: "support", actions: ["main_menu"], keywords: [] },
  BILLING: { team: "BILLING", actions: ["main_menu"], keywords: [] },
  PARTNERSHIP: { team: "SALES", actions: ["talk_to_sales", "book_strategy_call"], keywords: [] },
  CAREER: { team: "SALES", actions: ["main_menu"], keywords: [] },
  GENERAL_INQUIRY: { team: "SALES", actions: ["get_quote", "book_strategy_call", "talk_to_expert"], keywords: [] },
  HUMAN_HANDOVER: { team: "SALES", node: "expert", actions: ["talk_to_expert"], keywords: [] },
  ENTERPRISE: {
    team: "ENTERPRISE",
    actions: ["book_strategy_call", "submit_requirements", "enterprise_expert"],
    keywords: [],
  },
};

export const DEFAULT_PRICING: BotConfig["pricing"] = [
  {
    id: "whatbot_pro",
    label: "WhatBot Pro",
    intents: ["WHATBOT_PRO", "WHATSAPP_CHATBOT", "DEMO"],
    summary: {
      en: "💰 *WhatBot Pro — standard pricing*\n\nRs. 5,000 one-time onboarding\n+ Rs. 2,250/month",
      ur_roman: "💰 *WhatBot Pro — standard pricing*\n\nRs. 5,000 one-time onboarding\n+ Rs. 2,250 mahana",
      ur: "💰 *WhatBot Pro — معیاری قیمت*\n\n5,000 روپے ایک بار آن بورڈنگ\n+ 2,250 روپے ماہانہ",
    },
    details: {
      en: "Custom WhatsApp AI builds and integrations beyond the platform are quoted separately after we understand your requirements.",
      ur_roman: "Platform se hat kar custom WhatsApp AI builds aur integrations ki quote aap ki requirements samajhne ke baad alag di jaati hai.",
      ur: "پلیٹ فارم سے ہٹ کر کسٹم واٹس ایپ اے آئی بلڈز اور انٹیگریشنز کی کوٹیشن آپ کی ضروریات سمجھنے کے بعد الگ دی جاتی ہے۔",
    },
    actions: ["book_demo", "request_setup", "talk_to_sales"],
  },
];

export const DEFAULT_TEAMS: BotConfig["teams"] = {
  SALES: { label: "Sales", emails: [], ownerEmails: [] },
  MARKETING: { label: "Marketing", emails: [], ownerEmails: [] },
  AI_AUTOMATION: { label: "AI & Automation", emails: [], ownerEmails: [] },
  WHATSAPP: { label: "WhatsApp Solutions", emails: [], ownerEmails: [] },
  WEB_SOFTWARE: { label: "Web & Software", emails: [], ownerEmails: [] },
  ENTERPRISE: { label: "Enterprise", emails: [], ownerEmails: [] },
  SUPPORT: { label: "Support", emails: [], ownerEmails: [] },
  BILLING: { label: "Billing", emails: [], ownerEmails: [] },
};

export const DEFAULT_SCORING: BotConfig["scoring"] = {
  weights: {
    businessIdentified: 10,
    websiteProvided: 10,
    clearService: 10,
    budgetProvided: 10,
    immediateTimeline: 10,
    enterprise: 15,
    highBudget: 15,
    wantsStrategyCall: 10,
    wantsDemo: 10,
  },
  bands: { warm: 31, hot: 61, highPriority: 81 },
  highBudgetUsd: 10_000,
  pkrPerUsd: 280,
};

export const DEFAULT_ENTERPRISE: BotConfig["enterprise"] = {
  employeeThreshold: 200,
  branchThreshold: 3,
  keywords: [
    "enterprise",
    "enterprise automation",
    "enterprise solution",
    "ai transformation",
    "digital transformation",
    "large crm",
    "multiple branches",
    "multi-branch",
    "multi branch",
    "several branches",
    "nationwide",
    "group of companies",
    "head office",
    "erp integration",
    "multiple departments",
  ],
};

export const DEFAULT_HANDOVER: BotConfig["handover"] = {
  pauseBot: false,
  lowConfidenceTurns: 2,
  notifyTemperatures: ["HOT", "HIGH_PRIORITY"],
  dedupeHours: 12,
  frustrationKeywords: [],
};

export const DEFAULT_FOLLOW_UP: BotConfig["followUp"] = {
  enabled: true,
  // Both inside WhatsApp's 24-hour customer service window, so neither needs
  // an approved template. Add a step past 24 hours only with `template` set.
  steps: [{ afterHours: 4 }, { afterHours: 22 }],
  temperatures: ["WARM", "HOT", "HIGH_PRIORITY"],
  message: {
    en: "Hi[[ {name}]] 👋\n\nJust checking in regarding your {service} requirement.\n\nWould you like us to:",
    ur_roman: "Assalam o Alaikum[[ {name}]] 👋\n\nAap ki {service} requirement ke baare mein poochna tha.\n\nKya aap chahenge ke hum:",
    ur: "السلام علیکم[[ {name}]] 👋\n\nآپ کی {service} کی ضرورت کے بارے میں پوچھنا تھا۔\n\nکیا آپ چاہیں گے کہ ہم:",
  },
  actions: ["schedule_call", "get_quote", "continue_here"],
  template: null,
  onlyDuringBusinessHours: true,
};

export const DEFAULT_SOURCES: BotConfig["sources"] = {
  codes: [
    { code: "web", source: "WEBSITE" },
    { code: "site", source: "WEBSITE" },
    { code: "qr", source: "QR_CODE" },
    { code: "ig", source: "INSTAGRAM" },
    { code: "fb", source: "FACEBOOK" },
    { code: "tt", source: "TIKTOK" },
    { code: "meta", source: "META_ADS" },
    { code: "gads", source: "GOOGLE_ADS" },
    { code: "referral", source: "REFERRAL" },
  ],
  broadcastAttributionDays: 7,
};

export const DEFAULT_PROOF: BotConfig["proof"] = {
  caseStudies: [],
  results: [],
  websites: [],
  aiProjects: [],
  whatsappProjects: [],
  campaigns: [],
  reviews: [],
  industries: [],
};

export const DEFAULT_BROADCAST_CATEGORIES: BotConfig["broadcastCategories"] = [
  { key: "offers", label: "Offers & promotions", description: "Limited-time offers on BITSOL services." },
  { key: "whatbot-updates", label: "WhatBot Pro updates", description: "New WhatBot Pro features and release notes." },
  { key: "growth-insights", label: "Growth insights", description: "Practical marketing, AI and automation ideas." },
  { key: "announcements", label: "Announcements", description: "Company news and service announcements." },
  { key: "reminders", label: "Reminders", description: "Meeting, onboarding and renewal reminders." },
];
