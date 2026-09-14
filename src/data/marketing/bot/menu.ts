import type { BotConfig } from "@/lib/bot/schema";

/**
 * =============================================================================
 *  WhatsApp assistant — menu tree and actions
 * =============================================================================
 *
 *  Nodes are a flat map so any node can appear in more than one menu (Talk to
 *  an Expert sits in the main menu and under Grow My Business) and so the
 *  studio can validate references by id.
 *
 *  Length limits that WhatsApp enforces, and that these titles respect:
 *    • list row title   24 characters (an emoji counts as 2, some as 5)
 *    • button title     20 characters
 *    • list row description 72 characters
 *
 *  Service explainers follow the same five parts — what it does, who needs it,
 *  business benefits, example use cases, next step — and make no claims about
 *  clients, figures or guaranteed results. English is written here; for other
 *  languages the assistant translates the English explainer faithfully rather
 *  than writing its own.
 * =============================================================================
 */

type Nodes = BotConfig["menu"]["nodes"];

const SERVICE_ACTIONS = ["book_consultation", "get_quote", "talk_to_expert"];
const MARKETING_ACTIONS = ["get_quote", "book_strategy_call", "talk_to_expert"];
const BUILD_ACTIONS = ["plan_project", "book_consultation", "talk_to_expert"];

/** The five-part explainer, assembled so every service reads the same way. */
function explain(parts: {
  title: string;
  does: string;
  who: string;
  benefits: string[];
  uses: string[];
  next: string;
}): { en: string } {
  return {
    en: [
      `*${parts.title}*`,
      "",
      `*What it does*\n${parts.does}`,
      "",
      `*Who needs it*\n${parts.who}`,
      "",
      `*Business benefits*\n${parts.benefits.map((line) => `• ${line}`).join("\n")}`,
      "",
      `*Example use cases*\n${parts.uses.map((line) => `• ${line}`).join("\n")}`,
      "",
      `*Next step*\n${parts.next}`,
    ].join("\n"),
  };
}

// --------------------------------------------------------------- Main menu --

const MAIN: Nodes = {
  root: {
    kind: "menu",
    title: { en: "🏠 Main Menu", ur_roman: "🏠 Main Menu", ur: "🏠 مین مینو" },
    body: {
      en: "How can we help you today? Pick an option — or just tell me what you need.",
      ur_roman: "Aaj hum aap ki kya madad kar sakte hain? Koi option chunein — ya seedha apni zaroorat likh dein.",
      ur: "آج ہم آپ کی کیا مدد کر سکتے ہیں؟ کوئی آپشن چنیں — یا سیدھا اپنی ضرورت لکھ دیں۔",
    },
    children: ["grow", "ai", "whatsapp", "marketing", "web", "work", "quote", "expert", "support"],
  },

  grow: {
    kind: "menu",
    title: { en: "🚀 Grow My Business", ur_roman: "🚀 Business Barhayein", ur: "🚀 کاروبار بڑھائیں" },
    description: {
      en: "Leads, sales, ads, traffic and strategy",
      ur_roman: "Leads, sales, ads, traffic aur strategy",
      ur: "لیڈز، سیلز، اشتہارات، ٹریفک اور حکمتِ عملی",
    },
    body: {
      en: "🚀 Let's identify the right growth system for your business.\n\nWhat are you looking to achieve?",
      ur_roman: "🚀 Aaiye aap ke business ke liye sahi growth system dhoondte hain.\n\nAap kya haasil karna chahte hain?",
      ur: "🚀 آئیے آپ کے کاروبار کے لیے درست گروتھ سسٹم تلاش کرتے ہیں۔\n\nآپ کیا حاصل کرنا چاہتے ہیں؟",
    },
    children: [
      "grow_leads",
      "grow_sales",
      "grow_ads",
      "grow_google",
      "grow_social",
      "grow_automate",
      "grow_website",
      "grow_strategy",
      "expert",
    ],
    intent: "LEAD_GENERATION",
    team: "MARKETING",
  },

  ai: {
    kind: "menu",
    title: { en: "🤖 AI & Automation", ur_roman: "🤖 AI & Automation", ur: "🤖 اے آئی اور آٹومیشن" },
    description: {
      en: "AI agents, chatbots, n8n and CRM automation",
      ur_roman: "AI agents, chatbots, n8n aur CRM automation",
      ur: "اے آئی ایجنٹس، چیٹ بوٹس، n8n اور سی آر ایم آٹومیشن",
    },
    body: {
      en: "🤖 AI that answers, qualifies, follows up and runs processes around the clock.\n\nPick an area to see what it does and where it fits your business.",
      ur_roman:
        "🤖 AI jo din raat jawab deta hai, leads qualify karta hai, follow up karta hai aur processes chalata hai.\n\nKoi area chunein aur dekhein ye aap ke business mein kahan fit hota hai.",
      ur: "🤖 اے آئی جو دن رات جواب دیتا ہے، لیڈز پرکھتا ہے، فالو اپ کرتا ہے اور کام چلاتا ہے۔\n\nکوئی شعبہ چنیں اور دیکھیں یہ آپ کے کاروبار میں کہاں فٹ ہوتا ہے۔",
    },
    children: [
      "ai_agents",
      "ai_chatbots",
      "business_automation",
      "n8n_automation",
      "crm_automation",
      "ai_sales_agent",
      "ai_customer_support",
      "ai_receptionist",
      "workflow_automation",
      "custom_ai",
    ],
    intent: "AI_AUTOMATION",
    team: "AI_AUTOMATION",
  },

  whatsapp: {
    kind: "menu",
    title: { en: "📱 WhatsApp Solutions", ur_roman: "📱 WhatsApp Solutions", ur: "📱 واٹس ایپ سلوشنز" },
    description: {
      en: "AI chatbot, team inbox, broadcasts, WhatBot Pro",
      ur_roman: "AI chatbot, team inbox, broadcasts, WhatBot Pro",
      ur: "اے آئی چیٹ بوٹ، ٹیم ان باکس، براڈکاسٹ، WhatBot Pro",
    },
    body: {
      en: "📱 Turn WhatsApp into an intelligent sales, support and automation platform.",
      ur_roman: "📱 WhatsApp ko ek smart sales, support aur automation platform mein badlein.",
      ur: "📱 واٹس ایپ کو ایک ذہین سیلز، سپورٹ اور آٹومیشن پلیٹ فارم میں بدلیں۔",
    },
    children: [
      "wa_chatbot",
      "whatbot",
      "wa_team_inbox",
      "wa_lead_management",
      "wa_broadcasts",
      "wa_automation",
      "wa_analytics",
      "wa_crm",
      "wa_cloud_api",
      "wa_demo",
      "wa_pricing",
      "wa_sales",
    ],
    intent: "WHATSAPP_CHATBOT",
    team: "WHATSAPP",
  },

  marketing: {
    kind: "menu",
    title: { en: "📈 Digital Marketing", ur_roman: "📈 Digital Marketing", ur: "📈 ڈیجیٹل مارکیٹنگ" },
    description: {
      en: "SEO, Meta, Google, TikTok and LinkedIn",
      ur_roman: "SEO, Meta, Google, TikTok aur LinkedIn",
      ur: "ایس ای او، میٹا، گوگل، ٹک ٹاک اور لنکڈ اِن",
    },
    body: {
      en: "📈 Performance marketing built around one thing: qualified customers.\n\nWhich channel would you like to explore?",
      ur_roman: "📈 Performance marketing jis ka maqsad ek hai: qualified customers.\n\nAap kaunsa channel dekhna chahenge?",
      ur: "📈 پرفارمنس مارکیٹنگ جس کا ایک ہی مقصد ہے: سنجیدہ کسٹمرز۔\n\nآپ کون سا چینل دیکھنا چاہیں گے؟",
    },
    children: [
      "seo",
      "meta_ads",
      "google_ads",
      "tiktok_marketing",
      "linkedin_marketing",
      "social_media",
      "content_marketing",
      "mk_lead_generation",
      "remarketing",
      "marketing_analytics",
      "conversion_optimization",
    ],
    intent: "LEAD_GENERATION",
    team: "MARKETING",
  },

  web: {
    kind: "menu",
    title: { en: "🌐 Website & Software", ur_roman: "🌐 Website & Software", ur: "🌐 ویب سائٹ و سافٹ ویئر" },
    description: {
      en: "Websites, e-commerce, apps, CRM, AI software",
      ur_roman: "Websites, e-commerce, apps, CRM, AI software",
      ur: "ویب سائٹس، ای کامرس، ایپس، سی آر ایم، اے آئی سافٹ ویئر",
    },
    body: {
      en: "🌐 From a high-converting website to an enterprise platform — what would you like to build?",
      ur_roman: "🌐 High-converting website se le kar enterprise platform tak — aap kya banwana chahte hain?",
      ur: "🌐 بہترین ویب سائٹ سے لے کر انٹرپرائز پلیٹ فارم تک — آپ کیا بنوانا چاہتے ہیں؟",
    },
    children: [
      "business_website",
      "ecommerce",
      "web_application",
      "mobile_app",
      "ai_website",
      "enterprise_platform",
      "crm_development",
      "ai_software",
      "custom_software",
      "api_integration",
    ],
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
  },

  work: {
    kind: "menu",
    title: { en: "💼 Our Work & Results", ur_roman: "💼 Hamara Kaam", ur: "💼 ہمارا کام" },
    description: {
      en: "Case studies, projects and client reviews",
      ur_roman: "Case studies, projects aur client reviews",
      ur: "کیس اسٹڈیز، پراجیکٹس اور کلائنٹ ریویوز",
    },
    body: {
      en: "💼 What would you like to see?",
      ur_roman: "💼 Aap kya dekhna chahenge?",
      ur: "💼 آپ کیا دیکھنا چاہیں گے؟",
    },
    children: [
      "work_case_studies",
      "work_results",
      "work_websites",
      "work_ai",
      "work_whatsapp",
      "work_campaigns",
      "work_reviews",
      "work_industries",
    ],
    team: "SALES",
  },

  quote: {
    kind: "action",
    title: { en: "💰 Get a Quote", ur_roman: "💰 Quote Lein", ur: "💰 کوٹیشن لیں" },
    description: {
      en: "Share your requirements — we'll prepare the right solution",
      ur_roman: "Apni zaroorat batayein — hum sahi solution tayyar karenge",
      ur: "اپنی ضرورت بتائیں — ہم درست حل تیار کریں گے",
    },
    do: { type: "flow", flow: "quote" },
    intent: "QUOTE",
    team: "SALES",
  },

  expert: {
    kind: "menu",
    title: { en: "👨‍💻 Talk to an Expert", ur_roman: "👨‍💻 Expert Se Baat", ur: "👨‍💻 ماہر سے بات" },
    description: {
      en: "Sales, marketing, AI, WhatsApp, web or enterprise",
      ur_roman: "Sales, marketing, AI, WhatsApp, web ya enterprise",
      ur: "سیلز، مارکیٹنگ، اے آئی، واٹس ایپ، ویب یا انٹرپرائز",
    },
    body: {
      en: "Who would you like to speak with?",
      ur_roman: "Aap kis team se baat karna chahenge?",
      ur: "آپ کس ٹیم سے بات کرنا چاہیں گے؟",
    },
    children: [
      "expert_sales",
      "expert_marketing",
      "expert_ai",
      "expert_whatsapp",
      "expert_web",
      "expert_enterprise",
      "expert_support",
    ],
    intent: "HUMAN_HANDOVER",
  },

  support: {
    kind: "menu",
    title: { en: "🆘 Customer Support", ur_roman: "🆘 Customer Support", ur: "🆘 کسٹمر سپورٹ" },
    description: {
      en: "Existing projects, WhatBot, billing and tickets",
      ur_roman: "Maujooda projects, WhatBot, billing aur tickets",
      ur: "موجودہ پراجیکٹس، WhatBot، بلنگ اور ٹکٹس",
    },
    body: {
      en: "🆘 We're here to help. What do you need support with?",
      ur_roman: "🆘 Hum madad ke liye haazir hain. Aap ko kis cheez mein support chahiye?",
      ur: "🆘 ہم مدد کے لیے حاضر ہیں۔ آپ کو کس چیز میں سپورٹ چاہیے؟",
    },
    children: [
      "support_whatsapp",
      "support_project",
      "support_technical",
      "support_campaign",
      "support_whatbot",
      "support_billing",
      "support_ticket",
      "support_talk",
    ],
    intent: "SUPPORT",
    team: "SUPPORT",
  },
};

// ------------------------------------------------------- Grow My Business ---

const GROW: Nodes = {
  grow_leads: {
    kind: "action",
    title: { en: "🎯 Generate More Leads", ur_roman: "🎯 Zyada Leads", ur: "🎯 زیادہ لیڈز" },
    do: {
      type: "flow",
      flow: "lead_generation",
      context: { intent: "LEAD_GENERATION", goal: "leads", subService: "Lead generation" },
    },
    intent: "LEAD_GENERATION",
    team: "MARKETING",
  },
  grow_sales: {
    kind: "action",
    title: { en: "💰 Increase Sales", ur_roman: "💰 Sales Barhayein", ur: "💰 سیلز بڑھائیں" },
    do: { type: "flow", flow: "growth", context: { intent: "LEAD_GENERATION", goal: "sales" } },
    intent: "LEAD_GENERATION",
    team: "SALES",
  },
  grow_ads: {
    kind: "action",
    title: { en: "📣 Improve Advertising", ur_roman: "📣 Behtar Advertising", ur: "📣 بہتر اشتہارات" },
    do: { type: "flow", flow: "growth", context: { intent: "META_ADS", goal: "advertising", subService: "Paid advertising" } },
    intent: "META_ADS",
    team: "MARKETING",
  },
  grow_google: {
    kind: "action",
    title: { en: "🔍 More Google Traffic", ur_roman: "🔍 Google Traffic", ur: "🔍 گوگل ٹریفک" },
    do: { type: "flow", flow: "growth", context: { intent: "SEO", goal: "google", serviceSlug: "seo" } },
    intent: "SEO",
    team: "MARKETING",
  },
  grow_social: {
    kind: "action",
    title: { en: "📱 Grow Social Media", ur_roman: "📱 Social Media Growth", ur: "📱 سوشل میڈیا گروتھ" },
    do: {
      type: "flow",
      flow: "growth",
      context: { intent: "SOCIAL_MEDIA", goal: "social", serviceSlug: "social-media-marketing" },
    },
    intent: "SOCIAL_MEDIA",
    team: "MARKETING",
  },
  grow_automate: {
    kind: "action",
    title: { en: "🤖 Automate My Business", ur_roman: "🤖 Business Automation", ur: "🤖 کاروبار خودکار کریں" },
    do: { type: "flow", flow: "growth", context: { intent: "AI_AUTOMATION", goal: "automation", team: "AI_AUTOMATION" } },
    intent: "AI_AUTOMATION",
    team: "AI_AUTOMATION",
  },
  grow_website: {
    kind: "action",
    title: { en: "🌐 Improve My Website", ur_roman: "🌐 Website Behtar Karein", ur: "🌐 ویب سائٹ بہتر کریں" },
    do: {
      type: "flow",
      flow: "growth",
      context: { intent: "WEBSITE", goal: "website", serviceSlug: "website-development", team: "WEB_SOFTWARE" },
    },
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
  },
  grow_strategy: {
    kind: "action",
    title: { en: "🧠 Growth Strategy", ur_roman: "🧠 Growth Strategy", ur: "🧠 گروتھ اسٹریٹجی" },
    do: { type: "flow", flow: "growth", context: { intent: "LEAD_GENERATION", goal: "strategy", subService: "Growth strategy" } },
    intent: "LEAD_GENERATION",
    team: "MARKETING",
  },
};

// ------------------------------------------------------- AI & Automation ----

const AI: Nodes = {
  ai_agents: {
    kind: "service",
    title: { en: "🧠 AI Agents" },
    description: { en: "Autonomous agents that complete real tasks" },
    intent: "AI_AGENT",
    team: "AI_AUTOMATION",
    serviceSlug: "ai-agents",
    subService: "AI Agents",
    body: explain({
      title: "🧠 AI Agents",
      does: "AI agents take on multi-step work the way a trained team member would — reading requests, looking up your systems, deciding the next step and completing tasks, with a person approving anything important.",
      who: "Businesses where skilled people lose hours to repetitive research, data entry, follow-ups or reporting.",
      benefits: [
        "Work continues outside office hours",
        "Consistent handling of routine tasks",
        "Your team focuses on decisions and clients",
        "Every action logged and reviewable",
      ],
      uses: [
        "Qualifying inbound enquiries and updating the CRM",
        "Preparing reports from several data sources",
        "Processing orders, forms and documents",
      ],
      next: "Book a free consultation and we'll map where an agent fits your operations.",
    }),
    actions: SERVICE_ACTIONS,
  },
  ai_chatbots: {
    kind: "service",
    title: { en: "💬 AI Chatbots" },
    description: { en: "Trained on your business, live on every channel" },
    intent: "AI_CUSTOMER_SUPPORT",
    team: "AI_AUTOMATION",
    serviceSlug: "ai-chatbots",
    subService: "AI Chatbots",
    body: explain({
      title: "💬 AI Chatbots",
      does: "A chatbot trained on your own services, policies and FAQs that answers customers instantly on your website, WhatsApp, Instagram or Messenger — and hands the conversation to your team when it needs a person.",
      who: "Businesses that receive the same questions every day, or lose enquiries that arrive after hours.",
      benefits: [
        "Instant replies, day and night",
        "Leads captured into your CRM automatically",
        "Answers in English, Urdu and Roman Urdu",
        "Smooth handover to your team",
      ],
      uses: [
        "Answering product and pricing questions",
        "Booking appointments and consultations",
        "Collecting enquiry details before a sales call",
      ],
      next: "Book a consultation and we'll design the conversations your chatbot should handle.",
    }),
    actions: SERVICE_ACTIONS,
  },
  business_automation: {
    kind: "service",
    title: { en: "⚙️ Business Automation" },
    description: { en: "Remove the manual work between your tools" },
    intent: "AI_AUTOMATION",
    team: "AI_AUTOMATION",
    subService: "Business Automation",
    body: explain({
      title: "⚙️ Business Automation",
      does: "We connect the tools you already use — forms, sheets, CRM, WhatsApp, email, accounting — so data moves between them on its own and routine steps run without anyone copying and pasting.",
      who: "Growing teams whose processes still depend on spreadsheets, reminders and manual updates.",
      benefits: [
        "Fewer errors from re-typing data",
        "Faster response to customers",
        "Processes that scale without extra headcount",
        "Clear visibility of every step",
      ],
      uses: [
        "New enquiry → CRM record → WhatsApp welcome → sales alert",
        "Invoice and payment reminders",
        "Daily and weekly reports sent automatically",
      ],
      next: "Book a consultation and we'll identify the processes worth automating first.",
    }),
    actions: SERVICE_ACTIONS,
  },
  n8n_automation: {
    kind: "service",
    title: { en: "🔗 n8n Automation" },
    description: { en: "Flexible workflows you own and control" },
    intent: "N8N_AUTOMATION",
    team: "AI_AUTOMATION",
    subService: "n8n Automation",
    body: explain({
      title: "🔗 n8n Automation",
      does: "We design, build and host workflows on n8n — the open automation platform — connecting hundreds of apps and adding AI steps, with the workflows fully owned by your business.",
      who: "Businesses that have outgrown simple automation tools, or need self-hosted workflows and data control.",
      benefits: [
        "No per-task pricing lock-in",
        "Self-hosting option for data control",
        "AI steps inside your workflows",
        "Documented workflows your team can extend",
      ],
      uses: [
        "Lead routing across ads, CRM and WhatsApp",
        "AI summarising and tagging incoming emails",
        "Syncing orders between store, stock and accounting",
      ],
      next: "Book a consultation and tell us which workflow you'd like to automate first.",
    }),
    actions: SERVICE_ACTIONS,
  },
  crm_automation: {
    kind: "service",
    title: { en: "🧾 CRM Automation" },
    description: { en: "A CRM that updates and follows up on its own" },
    intent: "CRM",
    team: "AI_AUTOMATION",
    subService: "CRM Automation",
    body: explain({
      title: "🧾 CRM Automation",
      does: "We set up or upgrade your CRM so every lead is captured, scored, assigned and followed up automatically — from WhatsApp, your website, ads and calls.",
      who: "Sales teams losing track of leads, or managers without a clear view of the pipeline.",
      benefits: [
        "No lead left without a follow-up",
        "Clear pipeline and forecasting",
        "Automatic assignment to the right person",
        "Reminders and tasks created for your team",
      ],
      uses: [
        "Ad leads scored and assigned in seconds",
        "Automatic WhatsApp and email follow-up sequences",
        "Pipeline dashboards for management",
      ],
      next: "Book a consultation and we'll review how leads move through your business today.",
    }),
    actions: SERVICE_ACTIONS,
  },
  ai_sales_agent: {
    kind: "service",
    title: { en: "📞 AI Sales Agent" },
    description: { en: "Qualifies and follows up every lead instantly" },
    intent: "AI_SALES_AGENT",
    team: "AI_AUTOMATION",
    serviceSlug: "ai-agents",
    subService: "AI Sales Agent",
    body: explain({
      title: "📞 AI Sales Agent",
      does: "An AI sales assistant that responds to new leads within moments, asks your qualifying questions, recommends the right offer, books calls and passes serious buyers to your sales team with a full summary.",
      who: "Businesses running ads or receiving high enquiry volume where response speed decides who wins the customer.",
      benefits: [
        "Every lead contacted immediately",
        "Sales team spends time on qualified buyers",
        "Consistent qualification on every lead",
        "Full conversation history in your CRM",
      ],
      uses: [
        "Following up ad leads on WhatsApp",
        "Booking property viewings or consultations",
        "Re-engaging leads that went quiet",
      ],
      next: "Book a consultation and we'll design the qualification flow for your offer.",
    }),
    actions: SERVICE_ACTIONS,
  },
  ai_customer_support: {
    kind: "service",
    title: { en: "🎧 AI Customer Support" },
    description: { en: "Resolve routine questions, escalate the rest" },
    intent: "AI_CUSTOMER_SUPPORT",
    team: "AI_AUTOMATION",
    serviceSlug: "ai-chatbots",
    subService: "AI Customer Support",
    body: explain({
      title: "🎧 AI Customer Support",
      does: "AI support that answers routine questions from your own help content, tracks tickets, and hands complex or sensitive cases to your support team with the full context.",
      who: "Businesses whose support team is stretched by repetitive questions, or customers who wait too long for answers.",
      benefits: [
        "Customers get answers immediately",
        "Support team handles the cases that need people",
        "Tickets created with the full conversation",
        "Support available outside office hours",
      ],
      uses: [
        "Order status and delivery questions",
        "Account, booking and policy questions",
        "Triage and ticket creation for complaints",
      ],
      next: "Book a consultation and we'll review your most common support requests.",
    }),
    actions: SERVICE_ACTIONS,
  },
  ai_receptionist: {
    kind: "service",
    title: { en: "🧑‍💼 AI Receptionist" },
    description: { en: "Greets, answers, books and routes enquiries" },
    intent: "AI_AGENT",
    team: "AI_AUTOMATION",
    serviceSlug: "ai-agents",
    subService: "AI Receptionist",
    body: explain({
      title: "🧑‍💼 AI Receptionist",
      does: "A virtual front desk that greets every enquiry, answers common questions, books appointments into your calendar and routes each request to the right person.",
      who: "Clinics, agencies, real estate offices, salons and service businesses where missed enquiries mean missed revenue.",
      benefits: [
        "No enquiry goes unanswered",
        "Appointments booked without back-and-forth",
        "Front-desk staff freed for in-person customers",
        "Reminders reduce missed appointments",
      ],
      uses: [
        "Booking and rescheduling appointments",
        "Answering location, timing and service questions",
        "Routing urgent requests to the right staff member",
      ],
      next: "Book a consultation and we'll map your front-desk workflow.",
    }),
    actions: SERVICE_ACTIONS,
  },
  workflow_automation: {
    kind: "service",
    title: { en: "🔄 Workflow Automation" },
    description: { en: "Approvals, handoffs and reminders on autopilot" },
    intent: "AI_AUTOMATION",
    team: "AI_AUTOMATION",
    subService: "Workflow Automation",
    body: explain({
      title: "🔄 Workflow Automation",
      does: "We turn your internal processes — approvals, onboarding, handoffs between departments — into automated workflows with clear owners, deadlines and notifications.",
      who: "Organisations where work gets stuck between people, departments or tools.",
      benefits: [
        "Work moves forward without chasing",
        "Every step has an owner and a deadline",
        "Fewer dropped handoffs",
        "Management visibility on bottlenecks",
      ],
      uses: [
        "Client onboarding checklists",
        "Purchase and leave approvals",
        "Project handoff from sales to delivery",
      ],
      next: "Book a consultation and walk us through the workflow that slows you down most.",
    }),
    actions: SERVICE_ACTIONS,
  },
  custom_ai: {
    kind: "service",
    title: { en: "🛠️ Custom AI Solution" },
    description: { en: "AI designed around your specific problem" },
    intent: "AI_AUTOMATION",
    team: "AI_AUTOMATION",
    subService: "Custom AI Solution",
    body: explain({
      title: "🛠️ Custom AI Solution",
      does: "When an off-the-shelf tool doesn't fit, we design and build AI around your data and process — from document understanding and recommendations to internal copilots.",
      who: "Businesses with a clear problem, their own data, and a process no standard product handles well.",
      benefits: [
        "Built around your exact process",
        "Your data stays under your control",
        "Integrates with your existing systems",
        "Scoped in phases to prove value early",
      ],
      uses: [
        "Reading and extracting data from documents",
        "Internal knowledge assistants for staff",
        "Product or content recommendations",
      ],
      next: "Book a consultation and describe the problem you'd like AI to solve.",
    }),
    actions: SERVICE_ACTIONS,
  },
};

// --------------------------------------------------- WhatsApp Solutions -----

const WHATSAPP_ACTIONS = ["book_demo", "view_pricing", "talk_to_sales"];

const WHATSAPP: Nodes = {
  wa_chatbot: {
    kind: "service",
    title: { en: "🤖 WhatsApp AI Chatbot", ur_roman: "🤖 WhatsApp AI Chatbot", ur: "🤖 واٹس ایپ چیٹ بوٹ" },
    description: { en: "Answers, qualifies and follows up on WhatsApp" },
    intent: "WHATSAPP_CHATBOT",
    team: "WHATSAPP",
    serviceSlug: "whatsapp-automation",
    subService: "WhatsApp AI Chatbot",
    body: explain({
      title: "🤖 WhatsApp AI Chatbot",
      does: "An AI assistant on your WhatsApp number that answers enquiries, qualifies buyers, captures leads, follows up automatically and transfers hot prospects to your team.",
      who: "Any business whose customers already message on WhatsApp — real estate, clinics, e-commerce, hospitality, professional services and more.",
      benefits: [
        "Replies in seconds, 24/7",
        "Leads captured and qualified automatically",
        "Menus plus natural conversation",
        "Human handover with full context",
      ],
      uses: [
        "Qualifying property buyers before an agent calls",
        "Answering product questions and taking orders",
        "Booking appointments and sending reminders",
      ],
      next: "See a demo, or share your requirements and we'll plan your chatbot.",
    }),
    actions: ["book_demo", "build_my_chatbot", "talk_to_sales"],
  },
  whatbot: {
    kind: "service",
    title: { en: "🚀 WhatBot Pro", ur_roman: "🚀 WhatBot Pro", ur: "🚀 WhatBot Pro" },
    description: {
      en: "Our complete WhatsApp sales & support platform",
      ur_roman: "Hamara mukammal WhatsApp sales aur support platform",
      ur: "ہمارا مکمل واٹس ایپ سیلز اور سپورٹ پلیٹ فارم",
    },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    serviceSlug: "whatsapp-automation",
    subService: "WhatBot Pro",
    body: {
      en: "🚀 *WhatBot Pro* turns WhatsApp into a complete AI-powered customer communication and sales system.\n\n*What's inside*\n• WhatsApp Cloud API\n• AI chatbot\n• Team inbox\n• CRM and lead management\n• Broadcasts\n• Automation\n• Analytics\n• Multi-agent workflows\n• Human handover\n• Lead qualification\n\n🌐 {whatbotUrl}",
      ur_roman:
        "🚀 *WhatBot Pro* WhatsApp ko ek mukammal AI-powered customer communication aur sales system bana deta hai.\n\n*Is mein shamil hai*\n• WhatsApp Cloud API\n• AI chatbot\n• Team inbox\n• CRM aur lead management\n• Broadcasts\n• Automation\n• Analytics\n• Multi-agent workflows\n• Human handover\n• Lead qualification\n\n🌐 {whatbotUrl}",
    },
    actions: ["book_demo", "view_pricing", "request_setup", "talk_to_sales"],
  },
  wa_team_inbox: {
    kind: "service",
    title: { en: "👥 Team Inbox", ur_roman: "👥 Team Inbox", ur: "👥 ٹیم ان باکس" },
    description: { en: "One WhatsApp number, your whole team" },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    subService: "Team Inbox",
    body: explain({
      title: "👥 Team Inbox",
      does: "Your whole team works from one shared WhatsApp inbox — conversations assigned, tagged and handed between people, with notes and full history.",
      who: "Businesses where WhatsApp enquiries sit on one person's phone, or get lost between staff.",
      benefits: [
        "No conversation lost on a personal phone",
        "Clear ownership of every chat",
        "Managers see response times",
        "AI and people in the same inbox",
      ],
      uses: [
        "Sales and support sharing one business number",
        "Assigning chats by city, product or language",
        "Internal notes before a callback",
      ],
      next: "See the inbox in a live WhatBot Pro demo.",
    }),
    actions: WHATSAPP_ACTIONS,
  },
  wa_lead_management: {
    kind: "service",
    title: { en: "🧲 Lead Management", ur_roman: "🧲 Lead Management", ur: "🧲 لیڈ مینجمنٹ" },
    description: { en: "Capture, score and track every WhatsApp lead" },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    subService: "Lead Management",
    body: explain({
      title: "🧲 Lead Management",
      does: "Every WhatsApp conversation becomes a lead record — source, requirement, score and status — so your team knows exactly who to call first.",
      who: "Businesses running ads or campaigns into WhatsApp that need to know which leads are serious.",
      benefits: [
        "Leads captured without manual entry",
        "Scoring highlights the hottest prospects",
        "Source tracking per ad and campaign",
        "Pipeline stages from new to won",
      ],
      uses: [
        "Click-to-WhatsApp ad lead tracking",
        "Prioritising callbacks by lead score",
        "Follow-up reminders for quiet leads",
      ],
      next: "See lead management in a WhatBot Pro demo.",
    }),
    actions: WHATSAPP_ACTIONS,
  },
  wa_broadcasts: {
    kind: "service",
    title: { en: "📢 WhatsApp Broadcasts", ur_roman: "📢 WhatsApp Broadcasts", ur: "📢 واٹس ایپ براڈکاسٹ" },
    description: { en: "Approved campaigns to opted-in contacts" },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    subService: "WhatsApp Broadcasts",
    body: explain({
      title: "📢 WhatsApp Broadcasts",
      does: "Send Meta-approved template campaigns to opted-in contacts, segmented by interest or stage, with delivery and read tracking — through the official WhatsApp Cloud API.",
      who: "Businesses that want to reach customers where they actually read messages, without risking their number.",
      benefits: [
        "Official API — no grey-market tools",
        "Delivery and read tracking per campaign",
        "Opt-outs honoured automatically",
        "Replies flow straight into the inbox",
      ],
      uses: [
        "Offers and seasonal promotions",
        "Appointment and payment reminders",
        "Product launches and announcements",
      ],
      next: "See broadcasts in a WhatBot Pro demo.",
    }),
    actions: WHATSAPP_ACTIONS,
  },
  wa_automation: {
    kind: "service",
    title: { en: "🔄 WhatsApp Automation", ur_roman: "🔄 WhatsApp Automation", ur: "🔄 واٹس ایپ آٹومیشن" },
    description: { en: "Welcome, order, booking and reminder flows" },
    intent: "WHATSAPP_CHATBOT",
    team: "WHATSAPP",
    serviceSlug: "whatsapp-automation",
    subService: "WhatsApp Automation",
    body: explain({
      title: "🔄 WhatsApp Automation",
      does: "Automated WhatsApp journeys — welcome messages, catalogues, order and booking flows, reminders and feedback requests — connected to your CRM and systems.",
      who: "Businesses handling orders, bookings or repeat customers over WhatsApp.",
      benefits: [
        "Customers self-serve common requests",
        "Reminders sent on time, every time",
        "Orders and bookings recorded automatically",
        "Your team handles exceptions only",
      ],
      uses: [
        "Order confirmation and delivery updates",
        "Appointment booking and reminders",
        "Feedback requests after a purchase",
      ],
      next: "Share your requirements and we'll map the journeys to automate.",
    }),
    actions: ["book_demo", "get_quote", "talk_to_sales"],
  },
  wa_analytics: {
    kind: "service",
    title: { en: "📊 Analytics", ur_roman: "📊 Analytics", ur: "📊 تجزیات" },
    description: { en: "Conversations, leads and team performance" },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
    subService: "WhatsApp Analytics",
    body: explain({
      title: "📊 WhatsApp Analytics",
      does: "Dashboards for your WhatsApp channel: conversation volume, response times, lead sources, campaign results and team performance.",
      who: "Managers who need to know what WhatsApp is actually delivering for the business.",
      benefits: [
        "See which campaigns bring real leads",
        "Track response times by agent",
        "Spot drop-off in your chat flows",
        "Report results with confidence",
      ],
      uses: [
        "Comparing ad campaigns by qualified leads",
        "Weekly team performance reviews",
        "Measuring broadcast replies and conversions",
      ],
      next: "See the dashboards in a WhatBot Pro demo.",
    }),
    actions: WHATSAPP_ACTIONS,
  },
  wa_crm: {
    kind: "service",
    title: { en: "🔗 CRM Integration", ur_roman: "🔗 CRM Integration", ur: "🔗 سی آر ایم انٹیگریشن" },
    description: { en: "WhatsApp connected to your CRM and tools" },
    intent: "CRM",
    team: "WHATSAPP",
    subService: "WhatsApp CRM Integration",
    body: explain({
      title: "🔗 CRM Integration",
      does: "We connect WhatsApp to your CRM — HubSpot, Zoho, Salesforce, Google Sheets or a custom system — so contacts, conversations and deals stay in sync.",
      who: "Teams that already use a CRM but copy WhatsApp details into it by hand.",
      benefits: [
        "Contacts and chats synced automatically",
        "Deals updated from conversations",
        "Automations triggered by CRM stages",
        "One source of truth for sales",
      ],
      uses: [
        "Creating CRM leads from WhatsApp enquiries",
        "Sending WhatsApp messages when a deal stage changes",
        "Syncing opt-in status for broadcasts",
      ],
      next: "Share your requirements and tell us which CRM you use.",
    }),
    actions: ["get_quote", "book_consultation", "talk_to_sales"],
  },
  wa_cloud_api: {
    kind: "service",
    title: { en: "☁️ WhatsApp Cloud API", ur_roman: "☁️ WhatsApp Cloud API", ur: "☁️ واٹس ایپ کلاؤڈ API" },
    description: { en: "Official API setup, templates and verification" },
    intent: "WHATSAPP_CHATBOT",
    team: "WHATSAPP",
    subService: "WhatsApp Cloud API",
    body: explain({
      title: "☁️ WhatsApp Cloud API",
      does: "We set up the official WhatsApp Cloud API for your business — Meta Business verification, number connection, message templates and webhooks — ready for chatbots, inboxes and broadcasts.",
      who: "Businesses moving from the WhatsApp Business app to a scalable, multi-user, automated setup.",
      benefits: [
        "Official, compliant messaging from Meta",
        "Multiple team members on one number",
        "Automation and integrations unlocked",
        "Template messages approved for campaigns",
      ],
      uses: [
        "Connecting a chatbot to your business number",
        "Running approved broadcast campaigns",
        "Integrating WhatsApp with your software",
      ],
      next: "Book a demo or talk to our WhatsApp team about your setup.",
    }),
    actions: WHATSAPP_ACTIONS,
  },
  wa_demo: {
    kind: "action",
    title: { en: "🎥 Book a Demo", ur_roman: "🎥 Demo Book Karein", ur: "🎥 ڈیمو بک کریں" },
    do: { type: "flow", flow: "demo", context: { intent: "WHATBOT_PRO" } },
    intent: "DEMO",
    team: "WHATSAPP",
  },
  wa_pricing: {
    kind: "action",
    title: { en: "💰 Pricing", ur_roman: "💰 Pricing", ur: "💰 قیمت" },
    do: { type: "pricing" },
    intent: "WHATBOT_PRO",
    team: "WHATSAPP",
  },
  wa_sales: {
    kind: "action",
    title: { en: "👨‍💻 Talk to Sales", ur_roman: "👨‍💻 Sales Se Baat", ur: "👨‍💻 سیلز سے بات" },
    do: { type: "handover", team: "WHATSAPP" },
    intent: "HUMAN_HANDOVER",
    team: "WHATSAPP",
  },
};

// ------------------------------------------------------- Digital Marketing --

const MARKETING: Nodes = {
  seo: {
    kind: "service",
    title: { en: "🔍 SEO" },
    description: { en: "Technical, local, international and AI search" },
    intent: "SEO",
    team: "MARKETING",
    serviceSlug: "seo",
    subService: "SEO",
    body: {
      en: "*🔍 SEO*\n\n*What it does*\nWe make your business easier to find on Google, Google Maps and AI search tools — so customers searching for what you sell find you first.\n\n*Who needs it*\nBusinesses that want steady, compounding traffic instead of paying for every click.\n\n*What we cover*\n• Technical SEO\n• Local SEO & Google Maps SEO\n• International SEO\n• E-commerce SEO\n• Enterprise SEO\n• Content SEO\n• AI Search Optimization\n\n*Business benefits*\n• Traffic that keeps working after the work is done\n• Visibility for high-intent searches\n• Transparent monthly reporting\n\n*Next step*\nShare your website and we'll review where you stand today.",
    },
    actions: MARKETING_ACTIONS,
  },
  meta_ads: {
    kind: "service",
    title: { en: "📣 Meta Ads" },
    description: { en: "Facebook & Instagram campaigns built for leads" },
    intent: "META_ADS",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Meta Ads",
    body: explain({
      title: "📣 Meta Ads",
      does: "Facebook and Instagram campaigns — strategy, creatives, audiences, lead forms and click-to-WhatsApp ads — optimised for qualified leads and sales, not just clicks.",
      who: "Businesses selling to consumers or local customers who want predictable enquiries from social platforms.",
      benefits: [
        "Campaigns structured around cost per qualified lead",
        "Creative testing to find what works",
        "Retargeting of people who showed interest",
        "Clear reporting on spend and results",
      ],
      uses: [
        "Click-to-WhatsApp lead campaigns",
        "E-commerce sales campaigns",
        "Event, launch and offer promotions",
      ],
      next: "Get a quote or book a strategy call to review your current campaigns.",
    }),
    actions: MARKETING_ACTIONS,
  },
  google_ads: {
    kind: "service",
    title: { en: "🔎 Google Ads" },
    description: { en: "Search, Performance Max and YouTube Ads" },
    intent: "GOOGLE_ADS",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Google Ads",
    body: explain({
      title: "🔎 Google Ads",
      does: "Search, Performance Max, Shopping and YouTube Ads campaigns that put you in front of people actively looking for what you offer — with conversion tracking set up properly.",
      who: "Businesses whose customers search on Google before they buy or call.",
      benefits: [
        "Reach buyers at the moment of intent",
        "Accurate conversion tracking",
        "Wasted spend cut with negative keywords",
        "YouTube Ads for awareness and retargeting",
      ],
      uses: [
        "Service businesses generating calls and enquiries",
        "E-commerce Shopping campaigns",
        "YouTube retargeting for website visitors",
      ],
      next: "Get a quote or book a strategy call to audit your account.",
    }),
    actions: MARKETING_ACTIONS,
  },
  tiktok_marketing: {
    kind: "service",
    title: { en: "🎵 TikTok Marketing" },
    description: { en: "TikTok Ads and content that reaches new buyers" },
    intent: "TIKTOK_ADS",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "TikTok Marketing",
    body: explain({
      title: "🎵 TikTok Marketing",
      does: "TikTok Ads and short-form content strategy — hooks, creatives, spark ads and targeting — built to reach new audiences and turn attention into enquiries.",
      who: "Brands targeting younger or mass-market audiences, and e-commerce stores looking for new customers.",
      benefits: [
        "Reach audiences other channels miss",
        "Creative built for how TikTok is watched",
        "Ads connected to WhatsApp or your store",
        "Testing framework for hooks and offers",
      ],
      uses: [
        "Product launches and viral-style promotions",
        "E-commerce sales campaigns",
        "Lead generation into WhatsApp",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  linkedin_marketing: {
    kind: "service",
    title: { en: "💼 LinkedIn Marketing" },
    description: { en: "B2B leads, LinkedIn Ads and thought leadership" },
    intent: "SOCIAL_MEDIA",
    team: "MARKETING",
    serviceSlug: "social-media-marketing",
    subService: "LinkedIn Marketing",
    body: explain({
      title: "💼 LinkedIn Marketing",
      does: "LinkedIn Ads, company page growth and founder thought leadership for B2B businesses that sell to decision-makers.",
      who: "B2B companies, consultancies, SaaS and professional services targeting specific industries or job titles.",
      benefits: [
        "Target by industry, company size and role",
        "Build authority with decision-makers",
        "Lead gen forms connected to your CRM",
        "Account-based campaigns for key prospects",
      ],
      uses: [
        "B2B lead generation campaigns",
        "Recruiting and employer branding",
        "Founder-led content programmes",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  social_media: {
    kind: "service",
    title: { en: "📱 Social Media" },
    description: { en: "Social media marketing and management" },
    intent: "SOCIAL_MEDIA",
    team: "MARKETING",
    serviceSlug: "social-media-marketing",
    subService: "Social Media Marketing",
    body: explain({
      title: "📱 Social Media Marketing",
      does: "Content planning, design, posting and community management across Instagram, Facebook, TikTok and LinkedIn — connected to your ads and lead generation.",
      who: "Businesses that want a consistent, professional presence without managing it in-house.",
      benefits: [
        "Consistent brand across platforms",
        "Content calendar planned in advance",
        "Community questions answered",
        "Monthly performance reporting",
      ],
      uses: [
        "Monthly content and design packages",
        "Launch campaigns for new products",
        "Profile setup and optimisation",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  content_marketing: {
    kind: "service",
    title: { en: "✍️ Content Marketing" },
    description: { en: "Content that builds trust and ranks" },
    intent: "CONTENT",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Content Marketing",
    body: explain({
      title: "✍️ Content Marketing",
      does: "Articles, landing pages, video scripts, email sequences and social content planned around what your customers search for and ask before they buy.",
      who: "Businesses with a considered purchase, where buyers research before contacting you.",
      benefits: [
        "Answers buyer questions before a sales call",
        "Supports SEO and AI search visibility",
        "Reusable across channels",
        "Positions your brand as the expert",
      ],
      uses: [
        "SEO blog and landing page programmes",
        "Email nurture sequences",
        "Video scripts for ads and social",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  mk_lead_generation: {
    kind: "service",
    title: { en: "🎯 Lead Generation" },
    description: { en: "Full-funnel systems that deliver qualified leads" },
    intent: "LEAD_GENERATION",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Lead Generation",
    body: explain({
      title: "🎯 Lead Generation",
      does: "A complete lead system — offer, ads, landing page or WhatsApp flow, qualification and CRM follow-up — built to deliver enquiries your sales team can actually close.",
      who: "Businesses that need a steady flow of qualified enquiries, locally or internationally.",
      benefits: [
        "Leads qualified before they reach sales",
        "Every lead tracked to its source",
        "Automatic follow-up so none go cold",
        "Clear cost per qualified lead",
      ],
      uses: [
        "Real estate buyer and investor leads",
        "B2B meetings for service companies",
        "Clinic and service appointment bookings",
      ],
      next: "Tell us about your business and we'll plan your lead system.",
    }),
    actions: ["get_quote", "book_strategy_call", "talk_to_expert"],
  },
  remarketing: {
    kind: "service",
    title: { en: "🔄 Remarketing" },
    description: { en: "Bring back people who showed interest" },
    intent: "META_ADS",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Remarketing",
    body: explain({
      title: "🔄 Remarketing",
      does: "Retargeting campaigns on Meta, Google, YouTube and TikTok that re-engage website visitors, video viewers and past enquiries with the right message.",
      who: "Businesses with website or social traffic that doesn't convert on the first visit.",
      benefits: [
        "Stay visible while buyers decide",
        "Messages matched to what they viewed",
        "Better return from existing traffic",
        "Audience lists built and maintained",
      ],
      uses: [
        "Abandoned cart recovery",
        "Following up on pricing page visitors",
        "Re-engaging past WhatsApp enquiries",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  marketing_analytics: {
    kind: "service",
    title: { en: "📊 Marketing Analytics" },
    description: { en: "Tracking, attribution and dashboards" },
    intent: "LEAD_GENERATION",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Marketing Analytics",
    body: explain({
      title: "📊 Marketing Analytics",
      does: "Google Analytics 4, Tag Manager, Meta Conversions API and CRM attribution set up correctly — with dashboards that show which channels bring revenue.",
      who: "Businesses spending on marketing without confidence in which campaigns actually work.",
      benefits: [
        "Accurate conversion tracking",
        "Spend decisions based on real data",
        "One dashboard for all channels",
        "Leads traced back to campaigns",
      ],
      uses: [
        "GA4 and Tag Manager setup",
        "Offline conversion import from your CRM",
        "Management reporting dashboards",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  conversion_optimization: {
    kind: "service",
    title: { en: "🧪 Conversion (CRO)" },
    description: { en: "Turn more of your visitors into customers" },
    intent: "WEBSITE",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Conversion Optimization",
    body: explain({
      title: "🧪 Conversion Optimization",
      does: "We study how visitors use your website and landing pages, then test changes to offers, layout, forms and speed so more of them become enquiries or sales.",
      who: "Businesses with traffic that isn't turning into enough leads or orders.",
      benefits: [
        "More results from the same ad spend",
        "Decisions backed by tests, not guesses",
        "Faster, clearer landing pages",
        "Fewer drop-offs in forms and checkout",
      ],
      uses: [
        "Landing page redesign and A/B tests",
        "Checkout and form optimisation",
        "Page speed improvements",
      ],
      next: "Share your website and we'll review it on a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
};

// ------------------------------------------------------ Website & Software --

const WEB: Nodes = {
  business_website: {
    kind: "service",
    title: { en: "🌐 Business Website" },
    description: { en: "Fast, premium sites built to convert" },
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
    serviceSlug: "website-development",
    subService: "Business Website",
    body: explain({
      title: "🌐 Business Website",
      does: "A fast, mobile-first website that presents your business with authority and turns visitors into enquiries — with SEO foundations, WhatsApp and CRM connections built in.",
      who: "Businesses whose website is outdated, slow, or not generating enquiries.",
      benefits: [
        "Premium design that builds trust",
        "Built for speed and SEO",
        "Lead capture connected to WhatsApp and CRM",
        "Easy for your team to update",
      ],
      uses: [
        "Company and service websites",
        "Landing pages for campaigns",
        "Multi-language websites for international markets",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  ecommerce: {
    kind: "service",
    title: { en: "🛒 E-commerce" },
    description: { en: "Online stores on Shopify, WooCommerce or custom" },
    intent: "E_COMMERCE",
    team: "WEB_SOFTWARE",
    serviceSlug: "website-development",
    subService: "E-commerce",
    body: explain({
      title: "🛒 E-commerce",
      does: "Online stores on Shopify, WooCommerce or a custom stack — product catalogue, payments, delivery, WhatsApp order updates and marketing integrations.",
      who: "Retailers and brands selling online, or moving from social-media selling to a proper store.",
      benefits: [
        "Smooth checkout on mobile",
        "Payment and courier integrations",
        "Order updates on WhatsApp",
        "Built ready for ads and SEO",
      ],
      uses: [
        "Fashion, beauty and lifestyle stores",
        "B2B ordering portals",
        "Marketplace and multi-vendor stores",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  web_application: {
    kind: "service",
    title: { en: "💻 Web Application" },
    description: { en: "Portals, dashboards and SaaS products" },
    intent: "SOFTWARE",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Web Application",
    body: explain({
      title: "💻 Web Application",
      does: "Custom web applications — customer portals, internal dashboards, booking systems and SaaS products — designed, built, tested and deployed by one team.",
      who: "Businesses with a process or product idea that off-the-shelf software doesn't cover.",
      benefits: [
        "Built around your exact workflow",
        "Secure, scalable architecture",
        "You own the code",
        "Delivered in phases you can review",
      ],
      uses: [
        "Customer and partner portals",
        "Internal operations dashboards",
        "SaaS product MVPs",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  mobile_app: {
    kind: "service",
    title: { en: "📱 Mobile App" },
    description: { en: "iOS and Android apps" },
    intent: "MOBILE_APP",
    team: "WEB_SOFTWARE",
    serviceSlug: "mobile-apps",
    subService: "Mobile App",
    body: explain({
      title: "📱 Mobile App",
      does: "iOS and Android apps built with modern cross-platform technology — from design and development to App Store and Play Store launch.",
      who: "Businesses whose customers or staff need a fast, dedicated experience on their phone.",
      benefits: [
        "One codebase for iOS and Android",
        "Push notifications to re-engage users",
        "Integrates with your backend and payments",
        "Store submission handled for you",
      ],
      uses: [
        "Customer ordering and loyalty apps",
        "Field staff and delivery apps",
        "Booking and membership apps",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  ai_website: {
    kind: "service",
    title: { en: "🧠 AI Website" },
    description: { en: "A website with an AI assistant built in" },
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
    serviceSlug: "website-development",
    subService: "AI Website",
    body: explain({
      title: "🧠 AI Website",
      does: "A modern website with AI built in — an assistant that answers visitors, qualifies leads and books calls, plus content structured for AI search engines.",
      who: "Businesses that want their website to work as a salesperson, not just a brochure.",
      benefits: [
        "Visitors get answers without waiting",
        "Leads qualified before they reach sales",
        "Structured for Google and AI search",
        "Conversations feed your CRM",
      ],
      uses: [
        "Service businesses with complex offerings",
        "Real estate and property listings",
        "Consultancies and professional firms",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  enterprise_platform: {
    kind: "service",
    title: { en: "🏢 Enterprise Platform" },
    description: { en: "Large-scale systems for complex organisations" },
    intent: "ENTERPRISE",
    team: "ENTERPRISE",
    serviceSlug: "software-development",
    subService: "Enterprise Platform",
    body: explain({
      title: "🏢 Enterprise Platform",
      does: "Enterprise-grade platforms — multi-branch operations, role-based access, integrations with ERP and CRM, reporting and AI — designed with your IT and business teams.",
      who: "Organisations with multiple departments, branches or systems that need to work as one.",
      benefits: [
        "Security and role-based access by design",
        "Integration with existing systems",
        "Scales with users and data",
        "Delivered with documentation and support",
      ],
      uses: [
        "Multi-branch operations platforms",
        "Enterprise CRM and customer data platforms",
        "AI-enabled internal tools",
      ],
      next: "Submit your requirements and our enterprise team will reach out.",
    }),
    actions: ["submit_requirements", "book_strategy_call", "enterprise_expert"],
  },
  crm_development: {
    kind: "service",
    title: { en: "🧾 CRM Development" },
    description: { en: "A CRM built around how you sell" },
    intent: "CRM",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "CRM Development",
    body: explain({
      title: "🧾 CRM Development",
      does: "A custom CRM built around your sales process — pipelines, lead scoring, WhatsApp and email integration, team roles and dashboards.",
      who: "Businesses whose sales process doesn't fit a generic CRM, or who pay for features they never use.",
      benefits: [
        "Your pipeline, your fields, your rules",
        "WhatsApp, calls and email in one place",
        "No per-user licence costs",
        "Automation built into every stage",
      ],
      uses: [
        "Real estate inventory and buyer CRM",
        "Agency and services sales pipeline",
        "Dealer and distributor management",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  ai_software: {
    kind: "service",
    title: { en: "🤖 AI Software" },
    description: { en: "Products and tools powered by AI" },
    intent: "SOFTWARE",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "AI Software",
    body: explain({
      title: "🤖 AI Software",
      does: "Software products with AI at the core — assistants, document processing, recommendations and analytics — integrated with leading AI models and your data.",
      who: "Businesses building an AI product, or adding AI features to an existing one.",
      benefits: [
        "Practical AI features users actually use",
        "Model choice matched to cost and quality",
        "Your data protected by design",
        "Built to evolve as models improve",
      ],
      uses: [
        "AI assistants inside SaaS products",
        "Document and invoice processing",
        "Search and recommendation features",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  custom_software: {
    kind: "service",
    title: { en: "⚙️ Custom Software" },
    description: { en: "Software for your exact process" },
    intent: "SOFTWARE",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Custom Software",
    body: explain({
      title: "⚙️ Custom Software",
      does: "Bespoke software for operations, inventory, billing, HR or anything your business runs on — scoped, designed and built by one accountable team.",
      who: "Businesses running critical processes on spreadsheets or tools that no longer fit.",
      benefits: [
        "Fits your process instead of the reverse",
        "You own the code and data",
        "Integrates with your existing tools",
        "Support and improvements after launch",
      ],
      uses: [
        "Inventory and order management",
        "Billing and invoicing systems",
        "Operations and field service tools",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  api_integration: {
    kind: "service",
    title: { en: "🔗 API Integration" },
    description: { en: "Connect your systems, payments and platforms" },
    intent: "SOFTWARE",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "API Integration",
    body: explain({
      title: "🔗 API Integration",
      does: "Reliable integrations between your software and third-party platforms — payment gateways, couriers, WhatsApp, CRMs, ERPs and AI APIs — with monitoring and error handling.",
      who: "Businesses whose systems don't talk to each other, or rely on fragile manual exports.",
      benefits: [
        "Data flows automatically and reliably",
        "Errors caught and retried",
        "Documented for future changes",
        "Secure handling of credentials",
      ],
      uses: [
        "Payment gateway and courier integration",
        "ERP and CRM synchronisation",
        "Connecting AI models to your systems",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
};

// ----------------------------------------------------------- Our Work -------

const WORK: Nodes = {
  work_case_studies: {
    kind: "action",
    title: { en: "🏆 Case Studies", ur_roman: "🏆 Case Studies", ur: "🏆 کیس اسٹڈیز" },
    do: { type: "proof", section: "caseStudies" },
  },
  work_results: {
    kind: "action",
    title: { en: "📈 Results", ur_roman: "📈 Results", ur: "📈 نتائج" },
    do: { type: "proof", section: "results" },
  },
  work_websites: {
    kind: "action",
    title: { en: "🌐 Websites", ur_roman: "🌐 Websites", ur: "🌐 ویب سائٹس" },
    do: { type: "proof", section: "websites" },
  },
  work_ai: {
    kind: "action",
    title: { en: "🤖 AI Projects", ur_roman: "🤖 AI Projects", ur: "🤖 اے آئی پراجیکٹس" },
    do: { type: "proof", section: "aiProjects" },
  },
  work_whatsapp: {
    kind: "action",
    title: { en: "📱 WhatsApp Projects", ur_roman: "📱 WhatsApp Projects", ur: "📱 واٹس ایپ پراجیکٹس" },
    do: { type: "proof", section: "whatsappProjects" },
  },
  work_campaigns: {
    kind: "action",
    title: { en: "📣 Marketing Campaigns", ur_roman: "📣 Campaigns", ur: "📣 مارکیٹنگ مہمات" },
    do: { type: "proof", section: "campaigns" },
  },
  work_reviews: {
    kind: "action",
    title: { en: "⭐ Client Reviews", ur_roman: "⭐ Client Reviews", ur: "⭐ کلائنٹ ریویوز" },
    do: { type: "proof", section: "reviews" },
  },
  work_industries: {
    kind: "action",
    title: { en: "🏢 Industries We Serve", ur_roman: "🏢 Industries", ur: "🏢 انڈسٹریز" },
    do: { type: "proof", section: "industries" },
  },
};

// ------------------------------------------------------ Talk to an Expert ---

const EXPERT: Nodes = {
  expert_sales: {
    kind: "action",
    title: { en: "💰 Sales", ur_roman: "💰 Sales", ur: "💰 سیلز" },
    do: { type: "handover", team: "SALES" },
    team: "SALES",
  },
  expert_marketing: {
    kind: "action",
    title: { en: "📈 Marketing", ur_roman: "📈 Marketing", ur: "📈 مارکیٹنگ" },
    do: { type: "handover", team: "MARKETING" },
    team: "MARKETING",
  },
  expert_ai: {
    kind: "action",
    title: { en: "🤖 AI & Automation", ur_roman: "🤖 AI & Automation", ur: "🤖 اے آئی اور آٹومیشن" },
    do: { type: "handover", team: "AI_AUTOMATION" },
    team: "AI_AUTOMATION",
  },
  expert_whatsapp: {
    kind: "action",
    title: { en: "📱 WhatsApp Solutions", ur_roman: "📱 WhatsApp Solutions", ur: "📱 واٹس ایپ سلوشنز" },
    do: { type: "handover", team: "WHATSAPP" },
    team: "WHATSAPP",
  },
  expert_web: {
    kind: "action",
    title: { en: "🌐 Web & Software", ur_roman: "🌐 Web & Software", ur: "🌐 ویب اور سافٹ ویئر" },
    do: { type: "handover", team: "WEB_SOFTWARE" },
    team: "WEB_SOFTWARE",
  },
  expert_enterprise: {
    kind: "action",
    title: { en: "🏢 Enterprise Solutions", ur_roman: "🏢 Enterprise", ur: "🏢 انٹرپرائز" },
    do: { type: "handover", team: "ENTERPRISE" },
    team: "ENTERPRISE",
  },
  expert_support: {
    kind: "action",
    title: { en: "🆘 Support", ur_roman: "🆘 Support", ur: "🆘 سپورٹ" },
    do: { type: "handover", team: "SUPPORT" },
    team: "SUPPORT",
  },
};

// --------------------------------------------------------- Customer Support --

const SUPPORT: Nodes = {
  support_whatsapp: {
    kind: "action",
    title: { en: "📱 WhatsApp Support", ur_roman: "📱 WhatsApp Support", ur: "📱 واٹس ایپ سپورٹ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "SUPPORT", supportCategory: "TECHNICAL", topicLabel: "WhatsApp support" },
    },
    team: "SUPPORT",
  },
  support_project: {
    kind: "action",
    title: { en: "🧾 Existing Project", ur_roman: "🧾 Maujooda Project", ur: "🧾 موجودہ پراجیکٹ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "SUPPORT", supportCategory: "GENERAL", topicLabel: "Existing project" },
    },
    team: "SUPPORT",
  },
  support_technical: {
    kind: "action",
    title: { en: "🔧 Technical Support", ur_roman: "🔧 Technical Support", ur: "🔧 تکنیکی سپورٹ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "SUPPORT", supportCategory: "TECHNICAL", topicLabel: "Technical support" },
    },
    team: "SUPPORT",
  },
  support_campaign: {
    kind: "action",
    title: { en: "📊 Campaign Support", ur_roman: "📊 Campaign Support", ur: "📊 مہم سپورٹ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "SUPPORT", supportCategory: "GENERAL", topicLabel: "Campaign support", team: "MARKETING" },
    },
    team: "SUPPORT",
  },
  support_whatbot: {
    kind: "action",
    title: { en: "🤖 WhatBot Support", ur_roman: "🤖 WhatBot Support", ur: "🤖 WhatBot سپورٹ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "SUPPORT", supportCategory: "TECHNICAL", topicLabel: "WhatBot Pro support", team: "WHATSAPP" },
    },
    team: "SUPPORT",
  },
  support_billing: {
    kind: "action",
    title: { en: "💳 Billing", ur_roman: "💳 Billing", ur: "💳 بلنگ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "BILLING", supportCategory: "BILLING", topicLabel: "Billing", team: "BILLING" },
    },
    team: "BILLING",
  },
  support_ticket: {
    kind: "action",
    title: { en: "🎫 Create Support Ticket", ur_roman: "🎫 Support Ticket", ur: "🎫 سپورٹ ٹکٹ" },
    do: {
      type: "flow",
      flow: "support",
      context: { intent: "SUPPORT", supportCategory: "GENERAL", topicLabel: "Support ticket" },
    },
    team: "SUPPORT",
  },
  support_talk: {
    kind: "action",
    title: { en: "👨‍💻 Talk to Support", ur_roman: "👨‍💻 Support Se Baat", ur: "👨‍💻 سپورٹ سے بات" },
    do: { type: "handover", team: "SUPPORT" },
    team: "SUPPORT",
  },
};

export const DEFAULT_MENU: BotConfig["menu"] = {
  root: "root",
  nodes: { ...MAIN, ...GROW, ...AI, ...WHATSAPP, ...MARKETING, ...WEB, ...WORK, ...EXPERT, ...SUPPORT },
};

// ----------------------------------------------------------------- Actions --

export const DEFAULT_ACTIONS: BotConfig["actions"] = {
  main_menu: {
    title: { en: "🏠 Main Menu", ur_roman: "🏠 Main Menu", ur: "🏠 مین مینو" },
    do: { type: "menu", node: "root" },
  },
  book_consultation: {
    title: { en: "📅 Book Consultation", ur_roman: "📅 Consultation", ur: "📅 مشاورت بک کریں" },
    do: { type: "flow", flow: "strategy_call" },
  },
  book_strategy_call: {
    title: { en: "📅 Strategy Call", ur_roman: "📅 Strategy Call", ur: "📅 اسٹریٹجی کال" },
    description: { en: "Free 30-minute call with our team" },
    do: { type: "flow", flow: "strategy_call" },
  },
  schedule_call: {
    title: { en: "📅 Schedule a Call", ur_roman: "📅 Call Schedule", ur: "📅 کال طے کریں" },
    do: { type: "flow", flow: "strategy_call" },
  },
  get_quote: {
    title: { en: "💰 Get a Quote", ur_roman: "💰 Quote Lein", ur: "💰 کوٹیشن لیں" },
    do: { type: "flow", flow: "quote" },
  },
  talk_to_expert: {
    title: { en: "👨‍💻 Talk to Expert", ur_roman: "👨‍💻 Expert Se Baat", ur: "👨‍💻 ماہر سے بات" },
    do: { type: "menu", node: "expert" },
  },
  talk_to_sales: {
    title: { en: "💬 Talk to Sales", ur_roman: "💬 Sales Se Baat", ur: "💬 سیلز سے بات" },
    do: { type: "handover" },
  },
  book_demo: {
    title: { en: "🎥 Book a Demo", ur_roman: "🎥 Demo Book Karein", ur: "🎥 ڈیمو بک کریں" },
    do: { type: "flow", flow: "demo" },
  },
  see_demo: {
    title: { en: "🎥 See a Demo", ur_roman: "🎥 Demo Dekhein", ur: "🎥 ڈیمو دیکھیں" },
    do: { type: "flow", flow: "demo" },
  },
  view_pricing: {
    title: { en: "💰 View Pricing", ur_roman: "💰 Pricing Dekhein", ur: "💰 قیمت دیکھیں" },
    do: { type: "pricing" },
  },
  get_pricing: {
    title: { en: "💰 Get Pricing", ur_roman: "💰 Pricing", ur: "💰 قیمت" },
    do: { type: "pricing" },
  },
  request_setup: {
    title: { en: "📋 Request Setup", ur_roman: "📋 Setup Karwayein", ur: "📋 سیٹ اپ کروائیں" },
    do: { type: "flow", flow: "whatbot_setup" },
  },
  build_my_chatbot: {
    title: { en: "📋 Build My Chatbot", ur_roman: "📋 Chatbot Banwayein", ur: "📋 چیٹ بوٹ بنوائیں" },
    do: {
      type: "flow",
      flow: "quote",
      context: {
        intent: "WHATSAPP_CHATBOT",
        serviceSlug: "whatsapp-automation",
        subService: "WhatsApp AI Chatbot",
        team: "WHATSAPP",
      },
    },
  },
  plan_project: {
    title: { en: "📋 Plan My Project", ur_roman: "📋 Project Plan", ur: "📋 پراجیکٹ پلان" },
    description: { en: "A few questions, then a project brief" },
    do: { type: "flow", flow: "project_brief" },
  },
  growth_plan: {
    title: { en: "📋 Get Growth Plan", ur_roman: "📋 Growth Plan Lein", ur: "📋 گروتھ پلان لیں" },
    do: {
      type: "request",
      event: "GROWTH_PLAN_REQUESTED",
      nextAction: "Prepare and send a growth plan",
      body: {
        en: "✅ Done — our growth strategists will prepare a plan based on what you've shared and send it to you right here.\n\nWant to talk it through live as well?",
        ur_roman:
          "✅ Ho gaya — hamare growth strategists aap ki batayi hui details par plan tayyar kar ke yahin bhej denge.\n\nKya aap is par live baat bhi karna chahenge?",
        ur: "✅ ہو گیا — ہمارے گروتھ اسٹریٹجسٹ آپ کی بتائی ہوئی تفصیلات پر پلان تیار کر کے یہیں بھیج دیں گے۔\n\nکیا آپ اس پر براہِ راست بات بھی کرنا چاہیں گے؟",
      },
      actions: ["book_strategy_call", "main_menu"],
    },
  },
  submit_requirements: {
    title: { en: "📋 Requirements", ur_roman: "📋 Requirements", ur: "📋 ضروریات بتائیں" },
    description: { en: "Share your organisation's requirements" },
    do: { type: "flow", flow: "enterprise_requirements" },
  },
  enterprise_expert: {
    title: { en: "🏢 Enterprise Team", ur_roman: "🏢 Enterprise Team", ur: "🏢 انٹرپرائز ٹیم" },
    do: { type: "handover", team: "ENTERPRISE" },
  },
  continue_here: {
    title: { en: "💬 Continue Here", ur_roman: "💬 Yahin Baat Karein", ur: "💬 یہیں بات کریں" },
    do: {
      type: "say",
      body: {
        en: "Of course — tell me what's on your mind and I'll pick up right where we left off.",
        ur_roman: "Bilkul — batayein kya soch rahe hain, main wahin se aage barhta hoon.",
        ur: "بالکل — بتائیں کیا سوچ رہے ہیں، میں وہیں سے آگے بڑھتا ہوں۔",
      },
    },
  },
};
