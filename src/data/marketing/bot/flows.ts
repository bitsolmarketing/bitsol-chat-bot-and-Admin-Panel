import type { BotConfig } from "@/lib/bot/schema";

/**
 * =============================================================================
 *  WhatsApp assistant — qualification flows
 * =============================================================================
 *
 *  A flow is a short, ordered set of questions that ends in something the team
 *  can act on: a lead, a quote request, a project brief, a ticket, a meeting.
 *
 *  They are deliberately not forms. The engine:
 *    • asks one question per message,
 *    • skips any question whose answer the customer already gave — in an
 *      earlier message, in another flow, or in the middle of a sentence
 *      ("I'm Sara from Nova Clinics in Dubai" answers three at once),
 *    • accepts free text for every question, taps being a shortcut,
 *    • answers a question the customer asks mid-flow, then carries on.
 *
 *  `goals` narrows a step to the Grow My Business goal that opened the flow, so
 *  "Improve Advertising" asks about ad spend and "Automate My Business" asks
 *  about team size, without a separate flow for each.
 * =============================================================================
 */

type Flows = BotConfig["flows"];
type Step = Flows[keyof Flows] extends infer F ? (F extends { steps: Array<infer S> } ? S : never) : never;

// ------------------------------------------------------------ Shared steps --

const NAME: Step = {
  field: "name",
  kind: "text",
  ask: { en: "May I have your name?", ur_roman: "Aap ka naam kya hai?", ur: "آپ کا نام کیا ہے؟" },
};

const COMPANY: Step = {
  field: "company",
  kind: "text",
  ask: {
    en: "What's the name of your business?",
    ur_roman: "Aap ke business ka naam kya hai?",
    ur: "آپ کے کاروبار کا نام کیا ہے؟",
  },
};

const NO_WEBSITE = {
  value: "No website yet",
  title: { en: "🚫 No website yet", ur_roman: "🚫 Website nahi hai", ur: "🚫 ویب سائٹ نہیں ہے" },
};

const WEBSITE: Step = {
  field: "website",
  kind: "text",
  ask: {
    en: "Do you have a website? Please share the link.",
    ur_roman: "Kya aap ki website hai? Link share kar dein.",
    ur: "کیا آپ کی ویب سائٹ ہے؟ لنک شیئر کر دیں۔",
  },
  quickAnswers: [NO_WEBSITE],
};

const COUNTRY: Step = {
  field: "country",
  kind: "choice",
  optionsFrom: "countries",
  ask: {
    en: "Which country is your business based in?",
    ur_roman: "Aap ka business kis mulk mein hai?",
    ur: "آپ کا کاروبار کس ملک میں ہے؟",
  },
};

const INDUSTRY: Step = {
  field: "businessType",
  kind: "text",
  ask: {
    en: "What industry is your business in? (e.g. real estate, healthcare, e-commerce)",
    ur_roman: "Aap ka business kis industry mein hai? (maslan real estate, healthcare, e-commerce)",
    ur: "آپ کا کاروبار کس انڈسٹری میں ہے؟ (مثلاً رئیل اسٹیٹ، ہیلتھ کیئر، ای کامرس)",
  },
};

const SERVICE: Step = {
  field: "service",
  kind: "choice",
  optionsFrom: "services",
  ask: {
    en: "Which service do you need?",
    ur_roman: "Aap ko kaunsi service chahiye?",
    ur: "آپ کو کون سی سروس چاہیے؟",
  },
};

const GOAL: Step = {
  field: "businessGoal",
  kind: "text",
  ask: {
    en: "What's the main business goal you want to achieve?",
    ur_roman: "Aap ka sab se bara business goal kya hai?",
    ur: "آپ کا سب سے بڑا کاروباری ہدف کیا ہے؟",
  },
};

const CHALLENGE: Step = {
  field: "challenge",
  kind: "text",
  ask: {
    en: "What's the biggest challenge you're facing right now?",
    ur_roman: "Is waqt aap ko sab se bara challenge kya hai?",
    ur: "اس وقت آپ کو سب سے بڑا چیلنج کیا درپیش ہے؟",
  },
};

const TIMELINE: Step = {
  field: "timeline",
  kind: "choice",
  optionsFrom: "timelines",
  ask: {
    en: "When would you like to get started?",
    ur_roman: "Aap kab tak shuru karna chahte hain?",
    ur: "آپ کب تک شروع کرنا چاہتے ہیں؟",
  },
};

const BUDGET: Step = {
  field: "budget",
  kind: "choice",
  optionsFrom: "budgets",
  ask: {
    en: "What budget range do you have in mind?",
    ur_roman: "Aap ke zehan mein budget kitna hai?",
    ur: "آپ کے ذہن میں بجٹ کتنا ہے؟",
  },
};

const MEETING_SLOT: Step = {
  field: "meetingSlot",
  kind: "text",
  ask: {
    en: "What day and time suit you for a 30-minute call? (e.g. *tomorrow 3pm* — add your time zone if you're outside Pakistan)",
    ur_roman: "30 minute ki call ke liye kaunsa din aur waqt munasib hai? (maslan *kal 3 baje*)",
    ur: "30 منٹ کی کال کے لیے کون سا دن اور وقت مناسب ہے؟ (مثلاً *کل تین بجے*)",
  },
};

const MEETING_MODE: Step = {
  field: "meetingMode",
  kind: "choice",
  optional: true,
  ask: {
    en: "How would you like to meet?",
    ur_roman: "Aap kis tarah milna pasand karenge?",
    ur: "آپ کس طرح ملنا پسند کریں گے؟",
  },
  options: [
    { value: "ZOOM", title: { en: "💻 Zoom" } },
    { value: "GOOGLE_MEET", title: { en: "📹 Google Meet" } },
    { value: "WHATSAPP", title: { en: "📱 WhatsApp call", ur_roman: "📱 WhatsApp call", ur: "📱 واٹس ایپ کال" } },
  ],
};

const EMAIL_OPTIONAL: Step = {
  field: "email",
  kind: "text",
  optional: true,
  ask: {
    en: "Which email should we send the details to?",
    ur_roman: "Details kis email par bhejein?",
    ur: "تفصیلات کس ای میل پر بھیجیں؟",
  },
};

// ------------------------------------------------------------------- Flows --

export const DEFAULT_FLOWS: Flows = {
  lead_generation: {
    title: { en: "Lead generation", ur_roman: "Lead generation", ur: "لیڈ جنریشن" },
    intro: {
      en: "🎯 Let's plan how to bring you more qualified leads. A few quick questions:",
      ur_roman: "🎯 Aaiye aap ke liye zyada qualified leads ka plan banate hain. Chand sawal:",
      ur: "🎯 آئیے آپ کے لیے زیادہ سنجیدہ لیڈز کا پلان بناتے ہیں۔ چند سوالات:",
    },
    intent: "LEAD_GENERATION",
    team: "MARKETING",
    completion: "lead",
    nextAction: "Recommend a lead generation system and share a growth plan",
    steps: [
      {
        field: "customerType",
        kind: "choice",
        ask: {
          en: "What type of customers are you trying to attract?",
          ur_roman: "Aap kis qisam ke customers attract karna chahte hain?",
          ur: "آپ کس قسم کے کسٹمرز حاصل کرنا چاہتے ہیں؟",
        },
        options: [
          { value: "Local customers", title: { en: "📍 Local Customers", ur_roman: "📍 Local Customers", ur: "📍 مقامی کسٹمرز" } },
          { value: "Online customers", title: { en: "🌐 Online Customers", ur_roman: "🌐 Online Customers", ur: "🌐 آن لائن کسٹمرز" } },
          { value: "B2B leads", title: { en: "🏢 B2B Leads", ur_roman: "🏢 B2B Leads", ur: "🏢 بی ٹو بی لیڈز" } },
          { value: "E-commerce customers", title: { en: "🛒 E-commerce Customers", ur_roman: "🛒 E-commerce", ur: "🛒 ای کامرس کسٹمرز" } },
          { value: "International customers", title: { en: "🌍 International", ur_roman: "🌍 International", ur: "🌍 بین الاقوامی" } },
          { value: "Not sure", title: { en: "🤔 Not Sure", ur_roman: "🤔 Pata nahi", ur: "🤔 معلوم نہیں" } },
        ],
      },
      {
        field: "leadChannel",
        kind: "choice",
        ask: {
          en: "What is your current primary lead source?",
          ur_roman: "Abhi aap ki leads zyada tar kahan se aati hain?",
          ur: "ابھی آپ کی لیڈز زیادہ تر کہاں سے آتی ہیں؟",
        },
        options: [
          { value: "Facebook / Instagram", title: { en: "📘 Facebook / Instagram" } },
          { value: "Google", title: { en: "🔎 Google" } },
          { value: "WhatsApp", title: { en: "💬 WhatsApp" } },
          { value: "Website", title: { en: "🌐 Website", ur_roman: "🌐 Website", ur: "🌐 ویب سائٹ" } },
          { value: "TikTok", title: { en: "🎵 TikTok" } },
          { value: "Referrals", title: { en: "🤝 Referrals", ur_roman: "🤝 Referrals", ur: "🤝 ریفرل" } },
          { value: "Other", title: { en: "➕ Other", ur_roman: "➕ Kuch aur", ur: "➕ کچھ اور" } },
        ],
      },
      NAME,
      COMPANY,
      WEBSITE,
      COUNTRY,
      INDUSTRY,
      {
        field: "monthlyLeads",
        kind: "choice",
        ask: {
          en: "Roughly how many leads a month would you like?",
          ur_roman: "Aap ko mahana taqreeban kitni leads chahiye?",
          ur: "آپ کو ماہانہ تقریباً کتنی لیڈز چاہییں؟",
        },
        options: [
          { value: "Under 50 a month", title: { en: "Under 50", ur_roman: "50 se kam", ur: "50 سے کم" } },
          { value: "50–200 a month", title: { en: "50 – 200" } },
          { value: "200–500 a month", title: { en: "200 – 500" } },
          { value: "500+ a month", title: { en: "500+" } },
          { value: "Not sure", title: { en: "🤔 Not Sure", ur_roman: "🤔 Pata nahi", ur: "🤔 معلوم نہیں" } },
        ],
      },
      {
        field: "currentMarketing",
        kind: "text",
        optional: true,
        ask: {
          en: "And how are you marketing the business today?",
          ur_roman: "Aur abhi aap business ki marketing kaise karte hain?",
          ur: "اور ابھی آپ کاروبار کی مارکیٹنگ کیسے کرتے ہیں؟",
        },
        quickAnswers: [
          { value: "No marketing yet", title: { en: "Nothing yet", ur_roman: "Abhi kuch nahi", ur: "ابھی کچھ نہیں" } },
        ],
      },
    ],
    done: {
      body: {
        en: "✅ Thank you[[, {name}]] — that gives our growth team a clear picture of your business.\n\nWhat would you like to do next?",
        ur_roman: "✅ Shukriya[[ {name}]] — is se hamari growth team ko aap ke business ki wazeh tasveer mil gayi hai.\n\nAb aap kya karna chahenge?",
        ur: "✅ شکریہ[[ {name}]] — اس سے ہماری گروتھ ٹیم کو آپ کے کاروبار کی واضح تصویر مل گئی ہے۔\n\nاب آپ کیا کرنا چاہیں گے؟",
      },
      actions: ["growth_plan", "get_quote", "book_strategy_call", "talk_to_expert"],
    },
  },

  growth: {
    title: { en: "Growth plan", ur_roman: "Growth plan", ur: "گروتھ پلان" },
    intro: {
      en: "Great — a few quick questions so we recommend the right system, not a generic package.",
      ur_roman: "Zabardast — chand sawal taake hum aap ko sahi system recommend karein, generic package nahi.",
      ur: "زبردست — چند سوالات تاکہ ہم آپ کو درست سسٹم تجویز کریں، عام پیکج نہیں۔",
    },
    team: "MARKETING",
    completion: "lead",
    nextAction: "Review the business and recommend a growth system",
    steps: [
      INDUSTRY,
      {
        field: "currentMarketing",
        kind: "text",
        goals: ["sales"],
        ask: {
          en: "How are you getting sales today — walk-ins, online, referrals, ads?",
          ur_roman: "Abhi sales kahan se aati hain — walk-in, online, referrals ya ads?",
          ur: "ابھی سیلز کہاں سے آتی ہیں — براہِ راست، آن لائن، ریفرل یا اشتہارات؟",
        },
      },
      {
        field: "currentMarketing",
        kind: "text",
        goals: ["advertising"],
        ask: {
          en: "Which platforms are you advertising on right now?",
          ur_roman: "Abhi aap kin platforms par ads chala rahe hain?",
          ur: "ابھی آپ کن پلیٹ فارمز پر اشتہارات چلا رہے ہیں؟",
        },
        quickAnswers: [
          { value: "Not running ads yet", title: { en: "Not running ads", ur_roman: "Ads nahi chal rahe", ur: "اشتہارات نہیں چل رہے" } },
        ],
      },
      {
        field: "monthlyAdSpend",
        kind: "text",
        goals: ["advertising"],
        optional: true,
        ask: {
          en: "Roughly what do you spend on ads each month?",
          ur_roman: "Mahana ads par taqreeban kitna kharch karte hain?",
          ur: "ماہانہ اشتہارات پر تقریباً کتنا خرچ کرتے ہیں؟",
        },
      },
      {
        field: "currentMarketing",
        kind: "text",
        goals: ["social"],
        ask: {
          en: "Which social platforms is your business active on?",
          ur_roman: "Aap ka business kin social platforms par active hai?",
          ur: "آپ کا کاروبار کن سوشل پلیٹ فارمز پر فعال ہے؟",
        },
      },
      { ...WEBSITE, goals: ["sales", "google", "website", "strategy", "advertising"] },
      {
        field: "challenge",
        kind: "text",
        goals: ["automation"],
        ask: {
          en: "Which tasks or processes take up most of your team's time?",
          ur_roman: "Kaunse kaam ya processes aap ki team ka sab se zyada waqt lete hain?",
          ur: "کون سے کام یا طریقہ کار آپ کی ٹیم کا سب سے زیادہ وقت لیتے ہیں؟",
        },
      },
      {
        field: "companySize",
        kind: "choice",
        goals: ["automation"],
        ask: {
          en: "How big is your team?",
          ur_roman: "Aap ki team kitni bari hai?",
          ur: "آپ کی ٹیم کتنی بڑی ہے؟",
        },
        options: [
          { value: "1–10 people", title: { en: "1 – 10" } },
          { value: "11–50 people", title: { en: "11 – 50" } },
          { value: "51–200 people", title: { en: "51 – 200" } },
          { value: "200+ people", title: { en: "200+" } },
        ],
      },
      { ...CHALLENGE, goals: ["sales", "advertising", "google", "social", "website", "strategy"] },
      NAME,
      COMPANY,
      COUNTRY,
    ],
    done: {
      body: {
        en: "✅ Got it[[, {name}]]. Our team will look at where your business is today and recommend the right growth system.\n\nHow would you like to continue?",
        ur_roman: "✅ Samajh gaya[[ {name}]]. Hamari team dekhegi ke aap ka business abhi kahan hai aur sahi growth system recommend karegi.\n\nAb aage kya karein?",
        ur: "✅ سمجھ گیا[[ {name}]]۔ ہماری ٹیم دیکھے گی کہ آپ کا کاروبار ابھی کہاں ہے اور درست گروتھ سسٹم تجویز کرے گی۔\n\nاب آگے کیا کریں؟",
      },
      actions: ["book_strategy_call", "get_quote", "talk_to_expert"],
    },
  },

  quote: {
    title: { en: "Quote request", ur_roman: "Quote request", ur: "کوٹیشن کی درخواست" },
    intro: {
      en: "💰 Let's understand your requirements and prepare the right solution.",
      ur_roman: "💰 Aaiye aap ki zaroorat samajh kar sahi solution tayyar karte hain.",
      ur: "💰 آئیے آپ کی ضرورت سمجھ کر درست حل تیار کرتے ہیں۔",
    },
    intent: "QUOTE",
    team: "SALES",
    completion: "quote",
    event: "QUOTE_REQUESTED",
    nextAction: "Prepare and send a quotation",
    steps: [NAME, COMPANY, WEBSITE, COUNTRY, INDUSTRY, SERVICE, GOAL, CHALLENGE, TIMELINE, BUDGET],
    done: {
      body: {
        en: "✅ Thank you. Your requirements have been received.\n\nOur team will review your project and recommend the most suitable solution.[[\n\nReference: *{reference}*]]",
        ur_roman:
          "✅ Shukriya. Aap ki requirements mil gayi hain.\n\nHamari team aap ka project review kar ke sab se munasib solution recommend karegi.[[\n\nReference: *{reference}*]]",
        ur: "✅ شکریہ۔ آپ کی ضروریات موصول ہو گئی ہیں۔\n\nہماری ٹیم آپ کا پراجیکٹ دیکھ کر سب سے موزوں حل تجویز کرے گی۔[[\n\nریفرنس: *{reference}*]]",
      },
      actions: ["book_strategy_call", "talk_to_expert", "main_menu"],
    },
  },

  project_brief: {
    title: { en: "Project brief", ur_roman: "Project brief", ur: "پراجیکٹ بریف" },
    intro: {
      en: "📋 Let's put your project brief together — a few quick questions.",
      ur_roman: "📋 Aaiye aap ka project brief tayyar karte hain — chand sawal.",
      ur: "📋 آئیے آپ کا پراجیکٹ بریف تیار کرتے ہیں — چند سوالات۔",
    },
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
    completion: "brief",
    event: "QUOTE_REQUESTED",
    nextAction: "Review the project brief, scope the build and send an estimate",
    steps: [
      COMPANY,
      WEBSITE,
      {
        field: "platform",
        kind: "choice",
        ask: {
          en: "What would you like us to build?",
          ur_roman: "Aap kya banwana chahte hain?",
          ur: "آپ کیا بنوانا چاہتے ہیں؟",
        },
        options: [
          { value: "Business website", title: { en: "🌐 Website", ur_roman: "🌐 Website", ur: "🌐 ویب سائٹ" } },
          { value: "E-commerce store", title: { en: "🛒 Online Store", ur_roman: "🛒 Online Store", ur: "🛒 آن لائن اسٹور" } },
          { value: "Web application", title: { en: "💻 Web App", ur_roman: "💻 Web App", ur: "💻 ویب ایپ" } },
          { value: "iOS and Android app", title: { en: "📱 Mobile App", ur_roman: "📱 Mobile App", ur: "📱 موبائل ایپ" } },
          { value: "CRM or custom software", title: { en: "⚙️ CRM / Software", ur_roman: "⚙️ CRM / Software", ur: "⚙️ سی آر ایم / سافٹ ویئر" } },
          { value: "Not sure yet", title: { en: "🤔 Not Sure", ur_roman: "🤔 Pata nahi", ur: "🤔 معلوم نہیں" } },
        ],
      },
      {
        ...GOAL,
        ask: {
          en: "What's the main objective of this project?",
          ur_roman: "Is project ka asal maqsad kya hai?",
          ur: "اس پراجیکٹ کا اصل مقصد کیا ہے؟",
        },
      },
      {
        field: "features",
        kind: "text",
        ask: {
          en: "Which features do you need? A short list is perfect.",
          ur_roman: "Kaunse features chahiye? Mukhtasar list kaafi hai.",
          ur: "کون سے فیچرز چاہییں؟ مختصر فہرست کافی ہے۔",
        },
      },
      {
        ...TIMELINE,
        ask: {
          en: "Do you have a deadline in mind?",
          ur_roman: "Kya koi deadline hai?",
          ur: "کیا کوئی ڈیڈ لائن ہے؟",
        },
      },
      BUDGET,
      COUNTRY,
      NAME,
    ],
    done: {
      body: {
        en: "{brief}\n\nOur team will review this brief and come back to you with the best approach and an estimate.[[\n\nReference: *{reference}*]]",
        ur_roman:
          "{brief}\n\nHamari team ye brief review kar ke aap ko behtareen approach aur estimate batayegi.[[\n\nReference: *{reference}*]]",
        ur: "{brief}\n\nہماری ٹیم یہ بریف دیکھ کر آپ کو بہترین طریقہ اور تخمینہ بتائے گی۔[[\n\nریفرنس: *{reference}*]]",
      },
      actions: ["book_strategy_call", "talk_to_expert", "main_menu"],
    },
  },

  support: {
    title: { en: "Support request", ur_roman: "Support request", ur: "سپورٹ کی درخواست" },
    intro: {
      en: "🆘 I'll get this to our support team right away. A few quick details:",
      ur_roman: "🆘 Main ye foran hamari support team tak pohanchata hoon. Chand details:",
      ur: "🆘 میں یہ فوراً ہماری سپورٹ ٹیم تک پہنچاتا ہوں۔ چند تفصیلات:",
    },
    intent: "SUPPORT",
    team: "SUPPORT",
    completion: "ticket",
    nextAction: "Resolve the support ticket and update the customer",
    steps: [
      NAME,
      COMPANY,
      {
        field: "project",
        kind: "text",
        ask: {
          en: "Which project or service is this about?",
          ur_roman: "Ye kis project ya service ke baare mein hai?",
          ur: "یہ کس پراجیکٹ یا سروس کے بارے میں ہے؟",
        },
      },
      {
        field: "requirements",
        kind: "text",
        ask: {
          en: "Please describe the issue — what's happening, and since when?",
          ur_roman: "Masla bata dein — kya ho raha hai, aur kab se?",
          ur: "مسئلہ بتا دیں — کیا ہو رہا ہے، اور کب سے؟",
        },
      },
    ],
    done: {
      body: {
        en: "🎫 Your support request has been created.\n\nTicket: *#{reference}*\n\nOur team will review your request.",
        ur_roman: "🎫 Aap ki support request ban gayi hai.\n\nTicket: *#{reference}*\n\nHamari team aap ki request dekhegi.",
        ur: "🎫 آپ کی سپورٹ درخواست بن گئی ہے۔\n\nٹکٹ: *#{reference}*\n\nہماری ٹیم آپ کی درخواست دیکھے گی۔",
      },
      actions: ["main_menu"],
    },
  },

  demo: {
    title: { en: "Demo booking", ur_roman: "Demo booking", ur: "ڈیمو بکنگ" },
    intro: {
      en: "🎥 Let's book your demo — it takes about 30 minutes.",
      ur_roman: "🎥 Aaiye aap ka demo book karte hain — taqreeban 30 minute lagte hain.",
      ur: "🎥 آئیے آپ کا ڈیمو بک کرتے ہیں — تقریباً 30 منٹ لگتے ہیں۔",
    },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    completion: "meeting",
    event: "DEMO_REQUESTED",
    nextAction: "Confirm the demo slot and run the demo",
    steps: [NAME, COMPANY, INDUSTRY, MEETING_SLOT, MEETING_MODE],
    done: {
      body: {
        en: "📅 Demo request received[[, {name}]]. Our team will confirm the time with you here.[[\n\nReference: *{reference}*]]",
        ur_roman: "📅 Demo request mil gayi[[ {name}]]. Hamari team yahin aap se time confirm karegi.[[\n\nReference: *{reference}*]]",
        ur: "📅 ڈیمو کی درخواست موصول ہو گئی[[ {name}]]۔ ہماری ٹیم یہیں آپ سے وقت کی تصدیق کرے گی۔[[\n\nریفرنس: *{reference}*]]",
      },
      actions: ["view_pricing", "main_menu"],
    },
  },

  strategy_call: {
    title: { en: "Strategy call", ur_roman: "Strategy call", ur: "اسٹریٹجی کال" },
    intro: {
      en: "📅 Let's book your free strategy call.",
      ur_roman: "📅 Aaiye aap ki free strategy call book karte hain.",
      ur: "📅 آئیے آپ کی مفت اسٹریٹجی کال بک کرتے ہیں۔",
    },
    team: "SALES",
    completion: "meeting",
    event: "CALL_REQUESTED",
    nextAction: "Confirm the call slot and prepare for the strategy call",
    steps: [NAME, COMPANY, GOAL, MEETING_SLOT, MEETING_MODE],
    done: {
      body: {
        en: "📅 Call request received[[, {name}]]. Our team will confirm the time with you here.[[\n\nReference: *{reference}*]]",
        ur_roman: "📅 Call request mil gayi[[ {name}]]. Hamari team yahin aap se time confirm karegi.[[\n\nReference: *{reference}*]]",
        ur: "📅 کال کی درخواست موصول ہو گئی[[ {name}]]۔ ہماری ٹیم یہیں آپ سے وقت کی تصدیق کرے گی۔[[\n\nریفرنس: *{reference}*]]",
      },
      actions: ["get_quote", "main_menu"],
    },
  },

  whatbot_setup: {
    title: { en: "WhatBot Pro setup", ur_roman: "WhatBot Pro setup", ur: "WhatBot Pro سیٹ اپ" },
    intro: {
      en: "📋 Great choice — let's get WhatBot Pro set up for you.",
      ur_roman: "📋 Behtareen — aaiye aap ke liye WhatBot Pro setup karte hain.",
      ur: "📋 بہترین — آئیے آپ کے لیے WhatBot Pro سیٹ اپ کرتے ہیں۔",
    },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    completion: "lead",
    event: "SETUP_REQUESTED",
    nextAction: "Start WhatBot Pro onboarding",
    steps: [NAME, COMPANY, INDUSTRY, { ...WEBSITE, optional: true }, EMAIL_OPTIONAL],
    done: {
      body: {
        en: "✅ Setup request received. Our team will contact you here to start onboarding.[[\n\nReference: *{reference}*]]",
        ur_roman: "✅ Setup request mil gayi. Hamari team onboarding shuru karne ke liye yahin rabta karegi.[[\n\nReference: *{reference}*]]",
        ur: "✅ سیٹ اپ کی درخواست موصول ہو گئی۔ ہماری ٹیم آن بورڈنگ شروع کرنے کے لیے یہیں رابطہ کرے گی۔[[\n\nریفرنس: *{reference}*]]",
      },
      actions: ["book_demo", "main_menu"],
    },
  },

  enterprise_requirements: {
    title: { en: "Enterprise requirements", ur_roman: "Enterprise requirements", ur: "انٹرپرائز ضروریات" },
    intro: {
      en: "🏢 Let's capture your requirements for our enterprise team.",
      ur_roman: "🏢 Aaiye hamari enterprise team ke liye aap ki requirements note karte hain.",
      ur: "🏢 آئیے ہماری انٹرپرائز ٹیم کے لیے آپ کی ضروریات نوٹ کرتے ہیں۔",
    },
    intent: "ENTERPRISE",
    team: "ENTERPRISE",
    completion: "brief",
    escalate: true,
    nextAction: "Enterprise discovery: review requirements and schedule a call",
    steps: [
      COMPANY,
      {
        field: "companySize",
        kind: "choice",
        ask: {
          en: "How large is your organisation?",
          ur_roman: "Aap ki organization kitni bari hai?",
          ur: "آپ کا ادارہ کتنا بڑا ہے؟",
        },
        options: [
          { value: "50–200 employees", title: { en: "50 – 200" } },
          { value: "200–500 employees", title: { en: "200 – 500" } },
          { value: "500–1,000 employees", title: { en: "500 – 1,000" } },
          { value: "1,000+ employees", title: { en: "1,000+" } },
          { value: "Multiple branches", title: { en: "🏢 Multiple branches", ur_roman: "🏢 Kai branches", ur: "🏢 متعدد برانچز" } },
        ],
      },
      INDUSTRY,
      {
        field: "requirements",
        kind: "text",
        ask: {
          en: "What would you like BITSOL to help your organisation with?",
          ur_roman: "BITSOL aap ki organization ki kis cheez mein madad kare?",
          ur: "بِٹسول آپ کے ادارے کی کس چیز میں مدد کرے؟",
        },
      },
      TIMELINE,
      BUDGET,
      NAME,
      EMAIL_OPTIONAL,
    ],
    done: {
      body: {
        en: "{brief}\n\n🏢 Our enterprise team will review this and reach out to you personally.[[\n\nReference: *{reference}*]]",
        ur_roman: "{brief}\n\n🏢 Hamari enterprise team ye dekh kar khud aap se rabta karegi.[[\n\nReference: *{reference}*]]",
        ur: "{brief}\n\n🏢 ہماری انٹرپرائز ٹیم یہ دیکھ کر خود آپ سے رابطہ کرے گی۔[[\n\nریفرنس: *{reference}*]]",
      },
      actions: ["book_strategy_call", "enterprise_expert"],
    },
  },
};

// ----------------------------------------------------------------- Options --

const NOT_SURE = { en: "🤔 Not Sure", ur_roman: "🤔 Pata nahi", ur: "🤔 معلوم نہیں" };

export const DEFAULT_OPTIONS: BotConfig["options"] = {
  services: [
    { value: "SEO", title: { en: "🔍 SEO" }, serviceSlug: "seo", intent: "SEO" },
    { value: "Meta Ads", title: { en: "📣 Meta Ads" }, serviceSlug: "digital-marketing", intent: "META_ADS" },
    { value: "Google Ads", title: { en: "🔎 Google Ads" }, serviceSlug: "digital-marketing", intent: "GOOGLE_ADS" },
    { value: "Social Media", title: { en: "📱 Social Media" }, serviceSlug: "social-media-marketing", intent: "SOCIAL_MEDIA" },
    { value: "Lead Generation", title: { en: "🎯 Lead Generation" }, serviceSlug: "digital-marketing", intent: "LEAD_GENERATION" },
    { value: "WhatsApp Chatbot", title: { en: "🤖 WhatsApp Chatbot" }, serviceSlug: "whatsapp-automation", intent: "WHATSAPP_CHATBOT" },
    { value: "AI Automation", title: { en: "⚙️ AI Automation" }, intent: "AI_AUTOMATION" },
    { value: "AI Agents", title: { en: "🧠 AI Agents" }, serviceSlug: "ai-agents", intent: "AI_AGENT" },
    { value: "Website", title: { en: "🌐 Website" }, serviceSlug: "website-development", intent: "WEBSITE" },
    { value: "Software", title: { en: "💻 Software" }, serviceSlug: "software-development", intent: "SOFTWARE" },
    { value: "CRM", title: { en: "🧾 CRM" }, serviceSlug: "software-development", intent: "CRM" },
    { value: "Branding", title: { en: "🎨 Branding" }, serviceSlug: "branding", intent: "BRANDING" },
    {
      value: "Complete Growth System",
      title: { en: "🚀 Full Growth System", ur_roman: "🚀 Full Growth System", ur: "🚀 مکمل گروتھ سسٹم" },
      intent: "LEAD_GENERATION",
    },
    { value: "Other", title: { en: "➕ Other", ur_roman: "➕ Kuch aur", ur: "➕ کچھ اور" } },
  ],
  budgets: {
    USD: [
      { value: "Under $500", title: { en: "Under $500", ur_roman: "$500 se kam", ur: "$500 سے کم" } },
      { value: "$500–$1,000", title: { en: "$500 – $1,000" } },
      { value: "$1,000–$3,000", title: { en: "$1,000 – $3,000" } },
      { value: "$3,000–$10,000", title: { en: "$3,000 – $10,000" } },
      { value: "$10,000+", title: { en: "$10,000+" }, highValue: true },
      { value: "Not sure", title: NOT_SURE },
    ],
    PKR: [
      { value: "Under Rs 150,000", title: { en: "Under Rs 150,000", ur_roman: "Rs 150,000 se kam", ur: "150,000 روپے سے کم" } },
      { value: "Rs 150,000–300,000", title: { en: "Rs 150,000 – 300,000" } },
      { value: "Rs 300,000–850,000", title: { en: "Rs 300,000 – 850,000" } },
      { value: "Rs 850,000–2,800,000", title: { en: "Rs 850k – 2.8M" } },
      { value: "Rs 2,800,000+", title: { en: "Rs 2.8M+" }, highValue: true },
      { value: "Not sure", title: NOT_SURE },
    ],
  },
  timelines: [
    { value: "Immediately", title: { en: "⚡ Immediately", ur_roman: "⚡ Foran", ur: "⚡ فوراً" }, immediate: true },
    { value: "Within 2 weeks", title: { en: "Within 2 weeks", ur_roman: "2 hafton mein", ur: "2 ہفتوں میں" }, immediate: true },
    { value: "Within a month", title: { en: "Within a month", ur_roman: "Ek mahine mein", ur: "ایک مہینے میں" } },
    { value: "1–3 months", title: { en: "1 – 3 months", ur_roman: "1 – 3 mahine", ur: "1 – 3 مہینے" } },
    { value: "Just exploring", title: { en: "Just exploring", ur_roman: "Sirf maloomat", ur: "صرف معلومات" } },
  ],
};

// --------------------------------------------------------------- Countries --

export const DEFAULT_COUNTRIES: BotConfig["countries"] = [
  {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    currency: "PKR",
    dialCodes: ["92"],
    tlds: [".pk"],
    keywords: ["pakistan", "lahore", "karachi", "islamabad", "faisalabad", "rawalpindi", "multan", "peshawar", "sialkot", "پاکستان"],
  },
  {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    currency: "AED",
    dialCodes: ["971"],
    tlds: [".ae"],
    keywords: ["uae", "united arab emirates", "dubai", "abu dhabi", "sharjah", "ajman", "emirates", "دبئی"],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    currency: "SAR",
    dialCodes: ["966"],
    tlds: [".sa"],
    keywords: ["saudi", "ksa", "riyadh", "jeddah", "dammam", "makkah", "madinah", "سعودی"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    dialCodes: ["44"],
    tlds: [".uk"],
    keywords: ["united kingdom", "uk", "england", "london", "manchester", "birmingham", "scotland", "wales", "britain"],
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    dialCodes: ["1"],
    tlds: [".us"],
    keywords: ["united states", "usa", "america", "new york", "california", "texas", "florida", "chicago"],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    dialCodes: ["1"],
    areaCodes: [
      "204", "226", "236", "249", "250", "263", "289", "306", "343", "354", "365", "367", "368", "382",
      "403", "416", "418", "428", "431", "437", "438", "450", "468", "474", "506", "514", "519", "548",
      "579", "581", "584", "587", "604", "613", "639", "647", "672", "683", "705", "709", "742", "753",
      "778", "780", "782", "807", "819", "825", "867", "873", "879", "902", "905",
    ],
    tlds: [".ca"],
    keywords: ["canada", "toronto", "vancouver", "montreal", "calgary", "ottawa", "mississauga"],
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    dialCodes: ["61"],
    tlds: [".au"],
    keywords: ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide"],
  },
];
