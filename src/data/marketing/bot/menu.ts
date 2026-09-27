import type { BotConfig } from "@/lib/bot/schema";

/**
 * =============================================================================
 *  WhatsApp assistant — menu tree and actions
 * =============================================================================
 *
 *  The service menus mirror bitsolmarketing.com: Digital Marketing, Software
 *  Development and Creative Services from its Services menu, AI Automation and
 *  Enterprise & Data from its Solutions menu, with the site's item names. When
 *  the website's services change, change them here too.
 *
 *  Nodes are a flat map so any node can appear in more than one menu (Talk to
 *  an Expert sits in the main menu and under Grow My Business; Cloud Solutions
 *  under both Software Development and Enterprise & Data) and so the studio can
 *  validate references by id.
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
    // The service groups follow bitsolmarketing.com's Services and Solutions
    // menus. Ten rows is WhatsApp's list limit, so WhatsApp chatbots sit inside
    // AI Automation — which is also where the website lists them.
    children: ["grow", "ai", "marketing", "web", "creative", "enterprise_data", "work", "quote", "expert", "support"],
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
    title: { en: "🤖 AI Automation", ur_roman: "🤖 AI Automation", ur: "🤖 اے آئی آٹومیشن" },
    description: {
      en: "AI agents, WhatsApp chatbots, voice agents, CRM",
      ur_roman: "AI agents, WhatsApp chatbots, voice agents, CRM",
      ur: "اے آئی ایجنٹس، واٹس ایپ چیٹ بوٹس، وائس ایجنٹس، سی آر ایم",
    },
    body: {
      en: "🤖 AI that answers, qualifies, follows up and runs processes around the clock.\n\nPick an area to see what it does and where it fits your business.",
      ur_roman:
        "🤖 AI jo din raat jawab deta hai, leads qualify karta hai, follow up karta hai aur processes chalata hai.\n\nKoi area chunein aur dekhein ye aap ke business mein kahan fit hota hai.",
      ur: "🤖 اے آئی جو دن رات جواب دیتا ہے، لیڈز پرکھتا ہے، فالو اپ کرتا ہے اور کام چلاتا ہے۔\n\nکوئی شعبہ چنیں اور دیکھیں یہ آپ کے کاروبار میں کہاں فٹ ہوتا ہے۔",
    },
    children: [
      "ai_agents",
      "business_automation",
      "whatsapp",
      "lead_systems",
      "ai_voice_agents",
      "crm_automation",
      "workflow_automation",
    ],
    intent: "AI_AUTOMATION",
    team: "AI_AUTOMATION",
  },

  whatsapp: {
    kind: "menu",
    title: { en: "💬 WhatsApp AI Chatbots", ur_roman: "💬 WhatsApp AI Chatbots", ur: "💬 واٹس ایپ چیٹ بوٹس" },
    description: {
      en: "AI chatbot, WhatBot Pro, broadcasts and team inbox",
      ur_roman: "AI chatbot, WhatBot Pro, broadcasts aur team inbox",
      ur: "اے آئی چیٹ بوٹ، WhatBot Pro، براڈکاسٹ اور ٹیم ان باکس",
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
      en: "SEO, social media, Google & Meta Ads, TikTok, email",
      ur_roman: "SEO, social media, Google & Meta Ads, TikTok, email",
      ur: "ایس ای او، سوشل میڈیا، گوگل و میٹا ایڈز، ٹک ٹاک، ای میل",
    },
    body: {
      en: "📈 Performance marketing built around one thing: qualified customers.\n\nWhich channel would you like to explore?",
      ur_roman: "📈 Performance marketing jis ka maqsad ek hai: qualified customers.\n\nAap kaunsa channel dekhna chahenge?",
      ur: "📈 پرفارمنس مارکیٹنگ جس کا ایک ہی مقصد ہے: سنجیدہ کسٹمرز۔\n\nآپ کون سا چینل دیکھنا چاہیں گے؟",
    },
    children: [
      "seo",
      "social_media",
      "google_ads",
      "meta_ads",
      "tiktok_marketing",
      "email_marketing",
      "influencer_marketing",
      "content_marketing",
    ],
    intent: "LEAD_GENERATION",
    team: "MARKETING",
  },

  web: {
    kind: "menu",
    title: { en: "💻 Software Development", ur_roman: "💻 Software Development", ur: "💻 سافٹ ویئر ڈویلپمنٹ" },
    description: {
      en: "Websites, e-commerce, CRM, ERP, apps and cloud",
      ur_roman: "Websites, e-commerce, CRM, ERP, apps aur cloud",
      ur: "ویب سائٹس، ای کامرس، سی آر ایم، ای آر پی، ایپس اور کلاؤڈ",
    },
    body: {
      en: "💻 From a high-converting website to ERP and cloud platforms — what would you like to build?",
      ur_roman: "💻 High-converting website se le kar ERP aur cloud platforms tak — aap kya banwana chahte hain?",
      ur: "💻 بہترین ویب سائٹ سے لے کر ای آر پی اور کلاؤڈ پلیٹ فارمز تک — آپ کیا بنوانا چاہتے ہیں؟",
    },
    children: [
      "business_website",
      "ecommerce",
      "crm_development",
      "erp_solutions",
      "web_application",
      "mobile_app",
      "cloud_solutions",
      "api_integration",
    ],
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
  },

  creative: {
    kind: "menu",
    title: { en: "🎨 Creative Services", ur_roman: "🎨 Creative Services", ur: "🎨 تخلیقی خدمات" },
    description: {
      en: "Branding, logo, UI/UX, graphics, video and 3D",
      ur_roman: "Branding, logo, UI/UX, graphics, video aur 3D",
      ur: "برانڈنگ، لوگو، UI/UX، گرافکس، ویڈیو اور تھری ڈی",
    },
    body: {
      en: "🎨 Design and visual content that make your business look as good as the work you do.\n\nWhat do you need?",
      ur_roman:
        "🎨 Design aur visual content jo aap ke business ko utna hi behtar dikhaye jitna aap ka kaam hai.\n\nAap ko kya chahiye?",
      ur: "🎨 ڈیزائن اور بصری مواد جو آپ کے کاروبار کو اتنا ہی بہتر دکھائے جتنا آپ کا کام ہے۔\n\nآپ کو کیا چاہیے؟",
    },
    children: [
      "brand_identity",
      "logo_design",
      "ui_ux_design",
      "graphic_design",
      "video_editing",
      "motion_graphics",
      "animation_3d",
      "photography",
    ],
    intent: "BRANDING",
    team: "MARKETING",
  },

  enterprise_data: {
    kind: "menu",
    title: { en: "🏢 Enterprise & Data", ur_roman: "🏢 Enterprise & Data", ur: "🏢 انٹرپرائز اور ڈیٹا" },
    description: {
      en: "BI, dashboards, cloud, security and trading tech",
      ur_roman: "BI, dashboards, cloud, security aur trading tech",
      ur: "بی آئی، ڈیش بورڈز، کلاؤڈ، سیکیورٹی اور ٹریڈنگ ٹیک",
    },
    body: {
      en: "🏢 Technology for organisations that run on data — from business intelligence and secure cloud infrastructure to algorithmic trading.\n\nWhat would you like to explore?",
      ur_roman:
        "🏢 Data par chalne wale idaron ke liye technology — business intelligence aur mehfooz cloud infrastructure se le kar algorithmic trading tak.\n\nAap kya dekhna chahenge?",
      ur: "🏢 ڈیٹا پر چلنے والے اداروں کے لیے ٹیکنالوجی — بزنس انٹیلیجنس اور محفوظ کلاؤڈ انفراسٹرکچر سے لے کر الگورتھمک ٹریڈنگ تک۔\n\nآپ کیا دیکھنا چاہیں گے؟",
    },
    children: [
      "business_intelligence",
      "analytics_dashboards",
      "cloud_solutions",
      "cyber_security",
      "enterprise_platform",
      "trading_tech",
    ],
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

// --------------------------------------------------------- AI Automation ----

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
    title: { en: "🔗 CRM Integration" },
    description: { en: "Connect AI and automation to your CRM" },
    intent: "CRM",
    team: "AI_AUTOMATION",
    subService: "CRM Integration",
    body: explain({
      title: "🔗 CRM Integration",
      does: "We connect AI and automation to your CRM — or set one up — so every lead from WhatsApp, your website, ads and calls is captured, scored, assigned and followed up automatically.",
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
  lead_systems: {
    kind: "service",
    title: { en: "🎯 Lead Gen Systems" },
    description: { en: "Automated pipelines that find and qualify buyers" },
    intent: "LEAD_GENERATION",
    team: "AI_AUTOMATION",
    subService: "Lead Generation Systems",
    body: explain({
      title: "🎯 Lead Generation Systems",
      does: "An automated pipeline that captures enquiries from your ads, website and WhatsApp, asks your qualifying questions, scores each lead and routes the serious ones to your sales team — with follow-ups sent automatically.",
      who: "Businesses that get plenty of enquiries but lose time on unqualified ones, or lose good leads to slow follow-up.",
      benefits: [
        "Every enquiry answered and qualified",
        "Sales time spent on serious buyers",
        "Automatic follow-up so leads don't go cold",
        "Each lead traced back to its source",
      ],
      uses: [
        "Qualifying click-to-WhatsApp ad leads",
        "Scoring website enquiries into your CRM",
        "Booking sales calls with qualified prospects",
      ],
      next: "Book a consultation and we'll map how leads reach you today.",
    }),
    actions: SERVICE_ACTIONS,
  },
  ai_voice_agents: {
    kind: "service",
    title: { en: "🎙️ AI Voice Agents" },
    description: { en: "Natural-sounding voice automation for your calls" },
    intent: "AI_VOICE_AGENT",
    team: "AI_AUTOMATION",
    serviceSlug: "ai-agents",
    subService: "AI Voice Agents",
    body: explain({
      title: "🎙️ AI Voice Agents",
      does: "AI agents that speak with your customers on the phone — answering inbound calls, making follow-up and reminder calls, qualifying leads and booking appointments — and transferring to a person when needed.",
      who: "Businesses that handle a high volume of calls, miss calls after hours, or spend staff time on routine phone follow-ups.",
      benefits: [
        "Calls answered day and night",
        "Routine calls handled without extra staff",
        "Consistent script and qualification",
        "Call summaries saved to your CRM",
      ],
      uses: [
        "Answering and routing inbound enquiries",
        "Appointment booking and reminder calls",
        "Following up on new leads by phone",
      ],
      next: "Book a consultation and we'll review which calls an agent can take on first.",
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
};

// ------------------------------------ WhatsApp AI Chatbots (in AI Automation) --

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
    serviceSlug: "content-marketing",
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
  email_marketing: {
    kind: "service",
    title: { en: "📧 Email Marketing" },
    description: { en: "Automated sequences that nurture and sell" },
    intent: "EMAIL_MARKETING",
    team: "MARKETING",
    serviceSlug: "digital-marketing",
    subService: "Email Marketing",
    body: explain({
      title: "📧 Email Marketing",
      does: "Email campaigns and automated sequences — welcome series, nurture flows, offers and newsletters — written, designed and set up on your email platform, connected to your CRM or store.",
      who: "Businesses with a customer or lead list they aren't using, or buyers who need several touches before they decide.",
      benefits: [
        "Stay in touch with leads automatically",
        "Repeat sales from existing customers",
        "Messages triggered by what customers do",
        "Open, click and sales reporting",
      ],
      uses: [
        "Welcome and nurture sequences for new leads",
        "Abandoned cart and re-order emails",
        "Monthly newsletters and offers",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  influencer_marketing: {
    kind: "service",
    title: { en: "🤝 Influencer Marketing" },
    description: { en: "Creator partnerships that build trust at scale" },
    intent: "INFLUENCER_MARKETING",
    team: "MARKETING",
    serviceSlug: "social-media-marketing",
    subService: "Influencer Marketing",
    body: explain({
      title: "🤝 Influencer Marketing",
      does: "We find creators whose audience matches your customers, agree the brief and terms, manage the content and track the results of each collaboration.",
      who: "Consumer brands, product launches and online stores that want trusted recommendations to reach new buyers.",
      benefits: [
        "Creators matched to your audience",
        "Briefs and approvals handled for you",
        "Content you can reuse in ads",
        "Results tracked per creator",
      ],
      uses: [
        "Product launches and seeding",
        "User-generated content for ads",
        "Campaigns with local creators in your city",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
};

// ---------------------------------------------------- Software Development --

const WEB: Nodes = {
  business_website: {
    kind: "service",
    title: { en: "🌐 Website Development" },
    description: { en: "Fast, SEO-ready sites built to convert" },
    intent: "WEBSITE",
    team: "WEB_SOFTWARE",
    serviceSlug: "website-development",
    subService: "Website Development",
    body: explain({
      title: "🌐 Website Development",
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
    title: { en: "💻 Web Applications" },
    description: { en: "Portals, dashboards and SaaS products" },
    intent: "SOFTWARE",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Web Application",
    body: explain({
      title: "💻 Web Applications",
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
    title: { en: "📱 Mobile Apps" },
    description: { en: "Native and cross-platform iOS and Android apps" },
    intent: "MOBILE_APP",
    team: "WEB_SOFTWARE",
    serviceSlug: "mobile-apps",
    subService: "Mobile App",
    body: explain({
      title: "📱 Mobile Apps",
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
  enterprise_platform: {
    kind: "service",
    title: { en: "🏢 Enterprise Software" },
    description: { en: "Custom platforms for complex operations" },
    intent: "ENTERPRISE",
    team: "ENTERPRISE",
    serviceSlug: "software-development",
    subService: "Enterprise Software",
    body: explain({
      title: "🏢 Enterprise Software",
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
  erp_solutions: {
    kind: "service",
    title: { en: "🏭 ERP Solutions" },
    description: { en: "Unify operations across your entire business" },
    intent: "ERP",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "ERP Solutions",
    body: explain({
      title: "🏭 ERP Solutions",
      does: "ERP systems that bring inventory, purchasing, sales, accounts, HR and production into one platform — custom-built around your process, or set up and customised on an established ERP.",
      who: "Growing businesses running departments on separate spreadsheets and tools that don't talk to each other.",
      benefits: [
        "One source of truth for the whole business",
        "Stock, orders and accounts kept in sync",
        "Role-based access for each department",
        "Reports management can act on",
      ],
      uses: [
        "Manufacturing and production planning",
        "Distribution, wholesale and multi-warehouse stock",
        "Retail chains with several branches",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  cloud_solutions: {
    kind: "service",
    title: { en: "☁️ Cloud Solutions" },
    description: { en: "Cloud infrastructure that scales with you" },
    intent: "CLOUD",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Cloud Solutions",
    body: explain({
      title: "☁️ Cloud Solutions",
      does: "Cloud setup, migration and management on AWS, Azure or Google Cloud — servers, databases, backups, monitoring and deployment pipelines designed for reliability and cost control.",
      who: "Businesses moving off shared hosting or office servers, or whose applications need to serve more users reliably.",
      benefits: [
        "Infrastructure that scales with demand",
        "Automated backups and monitoring",
        "Security configured from the start",
        "Hosting costs reviewed and kept in check",
      ],
      uses: [
        "Migrating applications and data to the cloud",
        "Hosting for web apps, APIs and databases",
        "Deployment pipelines for faster releases",
      ],
      next: "Book a consultation and we'll review your current setup.",
    }),
    actions: SERVICE_ACTIONS,
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
    title: { en: "🔗 API Development" },
    description: { en: "APIs and integrations that connect your stack" },
    intent: "SOFTWARE",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "API Development",
    body: explain({
      title: "🔗 API Development",
      does: "APIs for your own products, and reliable integrations with third-party platforms — payment gateways, couriers, WhatsApp, CRMs, ERPs and AI APIs — with monitoring and error handling.",
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

// ------------------------------------------------------- Creative Services --

const CREATIVE: Nodes = {
  brand_identity: {
    kind: "service",
    title: { en: "✨ Brand Identity" },
    description: { en: "Strategic positioning and visual systems" },
    intent: "BRANDING",
    team: "MARKETING",
    serviceSlug: "branding",
    subService: "Brand Identity",
    body: explain({
      title: "✨ Brand Identity",
      does: "Brand strategy, positioning and a complete visual identity — logo, colours, typography and brand guidelines — so your business looks consistent and credible everywhere it appears.",
      who: "New businesses launching a brand, and established ones whose image no longer matches the quality of their work.",
      benefits: [
        "Consistent look across every touchpoint",
        "Clear positioning against competitors",
        "Guidelines your team and vendors can follow",
        "A professional first impression",
      ],
      uses: [
        "New brand launches",
        "Rebranding an established business",
        "Sub-brands for a new product or service",
      ],
      next: "Get a quote or book a strategy call to discuss your brand.",
    }),
    actions: MARKETING_ACTIONS,
  },
  logo_design: {
    kind: "service",
    title: { en: "✒️ Logo Design" },
    description: { en: "Distinct marks that command recognition" },
    intent: "BRANDING",
    team: "MARKETING",
    serviceSlug: "branding",
    subService: "Logo Design",
    body: explain({
      title: "✒️ Logo Design",
      does: "A logo designed from a short brand brief — concepts, refinement and final files in every format you need for print, signage, social media and the web.",
      who: "Businesses starting out, or those whose current logo looks dated, unclear or hard to use.",
      benefits: [
        "A mark that is distinct and memorable",
        "Works at every size, from app icon to billboard",
        "Vector files for print and digital",
        "Colour and usage guidance included",
      ],
      uses: [
        "Logos for new businesses and products",
        "Refreshing an existing logo",
        "Logo variations for social media and apps",
      ],
      next: "Get a quote and tell us about your business.",
    }),
    actions: MARKETING_ACTIONS,
  },
  ui_ux_design: {
    kind: "service",
    title: { en: "🧩 UI/UX Design" },
    description: { en: "Interfaces designed for clarity and conversion" },
    intent: "UI_UX_DESIGN",
    team: "WEB_SOFTWARE",
    serviceSlug: "ui-ux",
    subService: "UI/UX Design",
    body: explain({
      title: "🧩 UI/UX Design",
      does: "User research, wireframes, prototypes and polished interface design for websites, web apps and mobile apps — tested with real users before development begins.",
      who: "Teams building a new product, or businesses whose website or app confuses users and loses them.",
      benefits: [
        "Screens that are easy to understand",
        "Problems caught before code is written",
        "A design system that keeps things consistent",
        "Developer-ready files in Figma",
      ],
      uses: [
        "App and SaaS product design",
        "Website redesigns focused on conversion",
        "Dashboard and portal interfaces",
      ],
      next: "Plan your project — a few questions and we'll prepare a brief.",
    }),
    actions: BUILD_ACTIONS,
  },
  graphic_design: {
    kind: "service",
    title: { en: "🎨 Graphic Design" },
    description: { en: "Visuals that elevate every touchpoint" },
    intent: "GRAPHIC_DESIGN",
    team: "MARKETING",
    serviceSlug: "branding",
    subService: "Graphic Design",
    body: explain({
      title: "🎨 Graphic Design",
      does: "Design for everything your brand puts in front of customers — social media posts, ad creatives, brochures, flyers, packaging, presentations and signage.",
      who: "Businesses that need a steady supply of on-brand visuals without hiring an in-house designer.",
      benefits: [
        "Consistent, on-brand visuals",
        "Creatives sized for every platform",
        "Quick turnaround for campaigns",
        "Print-ready and digital files",
      ],
      uses: [
        "Monthly social media and ad creatives",
        "Brochures, catalogues and company profiles",
        "Packaging and product labels",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  video_editing: {
    kind: "service",
    title: { en: "🎬 Video Editing" },
    description: { en: "Polished edits for ads, reels and campaigns" },
    intent: "VIDEO",
    team: "MARKETING",
    serviceSlug: "content-marketing",
    subService: "Video Editing",
    body: explain({
      title: "🎬 Video Editing",
      does: "Professional editing of your footage into ads, reels, YouTube videos and brand films — with captions, sound, colour and formats sized for each platform.",
      who: "Businesses with footage to publish, or brands that need regular video for social media and ads.",
      benefits: [
        "Videos cut for how each platform is watched",
        "Captions for sound-off viewing",
        "A consistent style across your videos",
        "Versions for every ad placement",
      ],
      uses: [
        "Short-form reels and TikToks",
        "Video ads for Meta, TikTok and YouTube",
        "Testimonial and company profile videos",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  motion_graphics: {
    kind: "service",
    title: { en: "🌀 Motion Graphics" },
    description: { en: "Animated storytelling that grabs attention" },
    intent: "VIDEO",
    team: "MARKETING",
    serviceSlug: "content-marketing",
    subService: "Motion Graphics",
    body: explain({
      title: "🌀 Motion Graphics",
      does: "Animated graphics, kinetic text and explainer videos that make your product, service or message easy to understand in seconds.",
      who: "Businesses with a product or process that is hard to show on camera, and brands that want scroll-stopping ad creatives.",
      benefits: [
        "Complex ideas explained simply",
        "Eye-catching ads and social posts",
        "Animated logo and brand elements",
        "No filming required",
      ],
      uses: [
        "Explainer videos for products and services",
        "Animated ads and social media posts",
        "Logo animations and video intros",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  animation_3d: {
    kind: "service",
    title: { en: "🧊 3D Animation" },
    description: { en: "Immersive visuals for standout campaigns" },
    intent: "VIDEO",
    team: "MARKETING",
    serviceSlug: "content-marketing",
    subService: "3D Animation",
    body: explain({
      title: "🧊 3D Animation",
      does: "3D models, product renders and animations that show your product, property or concept in detail — even before it physically exists.",
      who: "Product brands, real estate developers and manufacturers that need visuals a camera can't capture.",
      benefits: [
        "Show products from every angle",
        "Visualise projects before they are built",
        "Premium visuals for ads and launches",
        "3D assets you can reuse",
      ],
      uses: [
        "Product renders and 360° showcases",
        "Architectural and real estate walkthroughs",
        "3D animated ads and launch videos",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
  photography: {
    kind: "service",
    title: { en: "📸 Photography" },
    description: { en: "Professional imagery for brand and product" },
    intent: "PHOTOGRAPHY",
    team: "MARKETING",
    serviceSlug: "branding",
    subService: "Photography",
    body: explain({
      title: "📸 Photography",
      does: "Product, food, corporate and lifestyle photography — planned around where the images will be used, then edited and delivered ready for your website, ads and social media.",
      who: "Businesses selling online, launching products, or relying on phone photos that undersell their quality.",
      benefits: [
        "Images that build trust and sell",
        "A consistent style across your catalogue",
        "Edited and sized for each platform",
        "Usable across web, ads and print",
      ],
      uses: [
        "E-commerce product photography",
        "Team, office and corporate shoots",
        "Food and menu photography",
      ],
      next: "Get a quote or book a strategy call.",
    }),
    actions: MARKETING_ACTIONS,
  },
};

// ------------------------------------------------------- Enterprise & Data --

const DATA: Nodes = {
  business_intelligence: {
    kind: "service",
    title: { en: "📊 Business Intelligence" },
    description: { en: "Turn raw data into decisive action" },
    intent: "DATA_ANALYTICS",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Business Intelligence",
    body: explain({
      title: "📊 Business Intelligence",
      does: "We bring data from your sales, finance, operations and marketing systems into one place, clean it and model it — so management can answer questions with numbers instead of guesswork.",
      who: "Businesses with data spread across spreadsheets, software and branches, and no single view of performance.",
      benefits: [
        "One trusted view of the business",
        "Reports that update themselves",
        "Trends and problems spotted early",
        "Decisions backed by data",
      ],
      uses: [
        "Sales and profitability analysis across branches",
        "Inventory and supply chain reporting",
        "Forecasting demand from historical data",
      ],
      next: "Book a consultation and tell us which decisions you'd like better data for.",
    }),
    actions: SERVICE_ACTIONS,
  },
  analytics_dashboards: {
    kind: "service",
    title: { en: "📈 Analytics Dashboards" },
    description: { en: "Real-time visibility into what matters" },
    intent: "DATA_ANALYTICS",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Analytics Dashboards",
    body: explain({
      title: "📈 Analytics Dashboards",
      does: "Live dashboards — in Power BI, Looker Studio or built into your own software — showing the numbers each team needs, updated automatically from your systems.",
      who: "Owners and managers who wait for weekly reports, or build them by hand.",
      benefits: [
        "Key numbers visible at a glance",
        "Data refreshed automatically",
        "A view for each role and team",
        "Available on desktop and mobile",
      ],
      uses: [
        "Sales and marketing performance dashboards",
        "Operations and branch KPI dashboards",
        "Financial and cash-flow overviews",
      ],
      next: "Book a consultation and we'll outline your first dashboard.",
    }),
    actions: SERVICE_ACTIONS,
  },
  cyber_security: {
    kind: "service",
    title: { en: "🛡️ Cyber Security" },
    description: { en: "Protect systems, data and customer trust" },
    intent: "CYBER_SECURITY",
    team: "WEB_SOFTWARE",
    serviceSlug: "software-development",
    subService: "Cyber Security",
    body: explain({
      title: "🛡️ Cyber Security",
      does: "Security reviews of your websites, applications and cloud setup, followed by fixes and hardening — access controls, backups, updates, SSL and monitoring — to reduce the risk of breaches and downtime.",
      who: "Businesses that store customer data, take payments online, or have had a scare with hacking or malware.",
      benefits: [
        "Weaknesses found and fixed early",
        "Customer data better protected",
        "Backups and recovery you can rely on",
        "A clear list of risks and fixes",
      ],
      uses: [
        "Website and application security reviews",
        "Recovering and securing a hacked website",
        "Access control and backup policies for teams",
      ],
      next: "Book a consultation and we'll discuss what you need to protect.",
    }),
    actions: SERVICE_ACTIONS,
  },
  trading_tech: {
    kind: "service",
    title: { en: "💹 Trading Tech" },
    description: { en: "Algorithmic trading systems for PSX, PMEX and crypto" },
    intent: "TRADING_TECH",
    team: "WEB_SOFTWARE",
    serviceSlug: "trading-tech",
    subService: "Trading Tech",
    body: explain({
      title: "💹 Trading Tech",
      does: "Custom algorithmic trading systems for the Pakistan Stock Exchange (PSX), PMEX and crypto exchanges — trading bots, backtesting, execution engines and real-time risk dashboards, built around your own strategy.",
      who: "Traders, investors, proprietary desks and asset managers who want to automate a strategy and run it with discipline.",
      benefits: [
        "Your rules executed consistently, without emotion",
        "Strategies backtested on historical data first",
        "Real-time risk and drawdown alerts",
        "Dashboards to monitor, adjust or pause strategies",
      ],
      uses: [
        "Signal and execution bots for PSX equities",
        "Crypto bots for major exchanges",
        "Backtesting and paper-trading a new strategy",
      ],
      next: "Book a consultation and walk us through your strategy.",
    }),
    actions: SERVICE_ACTIONS,
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
  nodes: {
    ...MAIN,
    ...GROW,
    ...AI,
    ...WHATSAPP,
    ...MARKETING,
    ...WEB,
    ...CREATIVE,
    ...DATA,
    ...WORK,
    ...EXPERT,
    ...SUPPORT,
  },
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
