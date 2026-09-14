import type { ServiceItem } from "@/types";

/**
 * =============================================================================
 *  BITSOL Marketing — service catalogue
 * =============================================================================
 *
 *  Every service carries the full structure the brief asks for:
 *    Overview · Benefits · Features · Process · Pricing placeholder ·
 *    Portfolio · FAQ  (+ "Book Meeting" and "Request Quote" are wired as chat
 *    actions rather than data, so they stay consistent across all services).
 *
 *  PORTFOLIO IS EMPTY ON PURPOSE. The assistant never names clients or results
 *  it cannot verify; verified work is entered in Admin → Chatbot Studio → Proof.
 *
 *  PRICING IS A PLACEHOLDER. `pricing.note` is rendered verbatim by the
 *  assistant and the UI so a figure is never presented as a final quotation.
 *  Update these records from Admin → Services once the rate card is signed off;
 *  the seed script mirrors this file into `marketing_services`.
 * =============================================================================
 */

/** Reused so the "not a final price" wording is identical everywhere. */
const PRICE_NOTE =
  "Indicative starting point only — the final price depends on scope, integrations and timeline. Request a quote for an exact figure.";

export const MARKETING_SERVICES: ServiceItem[] = [
  // ------------------------------------------------------------ AI & automation
  {
    slug: "ai-chatbots",
    name: "AI Chatbots",
    group: "AI & Automation",
    tagline: "A 24/7 assistant that answers, qualifies and books — in your voice.",
    overview:
      "We design and deploy custom AI chatbots for websites, WhatsApp, Facebook and Instagram. Each bot is trained on your own content — services, prices, policies, FAQs — so it answers accurately instead of guessing, captures leads into your CRM, and hands off to a human the moment a conversation needs one.",
    benefits: [
      "Answer every customer instantly, day or night, without adding headcount",
      "Capture and qualify leads while your competitors are still replying to emails",
      "Fewer repetitive support questions, so your team handles the real work",
      "Reply in English, Urdu and Roman Urdu — customers stay in their own language",
      "Every conversation logged, searchable and reportable",
    ],
    features: [
      "Trained on your business knowledge base, not generic internet answers",
      "Multi-channel: website widget, WhatsApp, Messenger, Instagram DM",
      "Lead capture forms with automatic CRM sync and sales notifications",
      "Human handoff with ticket generation and conversation transcript",
      "Voice notes, image and PDF understanding",
      "Admin dashboard with live conversations, analytics and AI retraining",
    ],
    process: [
      "Discovery call — we map your top 30 customer questions and goals",
      "Knowledge base build — services, pricing, policies and tone of voice",
      "Bot design — conversation flows, menus, lead forms, handoff rules",
      "Integration — website, WhatsApp Business API, CRM and notifications",
      "Testing & training — real conversations reviewed and corrected",
      "Launch + 30 days of tuning, then monthly performance reporting",
    ],
    pricing: {
      startingAt: "From PKR 120,000",
      model: "One-time build + optional monthly support & AI usage retainer",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Will the chatbot make things up?",
        answer:
          "No. It is instructed to answer from your approved knowledge base first, and to say it isn't sure and offer a human handoff when nothing matches. You control the content from the admin console.",
      },
      {
        question: "How long does it take to launch?",
        answer:
          "A focused website or WhatsApp bot typically goes live in 2–4 weeks. Larger multi-department builds with CRM integration take 4–8 weeks.",
      },
      {
        question: "Can it work on WhatsApp?",
        answer:
          "Yes. We set up the official WhatsApp Business API, message templates and broadcast tools alongside the bot.",
      },
    ],
    keywords: [
      "chatbot", "chat bot", "ai chatbot", "bot", "assistant", "virtual assistant",
      "customer support automation", "website bot", "messenger bot",
    ],
  },

  {
    slug: "whatsapp-automation",
    name: "WhatsApp Automation",
    group: "AI & Automation",
    tagline: "Turn WhatsApp into a sales channel that runs itself.",
    overview:
      "We connect your business to the official WhatsApp Business API and automate the whole customer journey: instant replies, catalogue browsing, order and booking flows, payment reminders, delivery updates and approved marketing broadcasts — with every conversation visible to your team in one shared inbox.",
    benefits: [
      "Reply in seconds on the channel your customers already use all day",
      "Send approved promotions to thousands of contacts without getting blocked",
      "Automate reminders for payments, appointments and renewals",
      "One shared team inbox — no more messages lost on a personal phone",
      "Full delivery, read and reply analytics per campaign",
    ],
    features: [
      "Official WhatsApp Business API setup, verification and green tick support",
      "Message template design, submission and approval management",
      "Automated flows: welcome, catalogue, order, booking, feedback",
      "Segmented broadcast campaigns with scheduling",
      "Shared team inbox with assignment, tags and internal notes",
      "CRM sync so every chat becomes a trackable contact record",
    ],
    process: [
      "Business verification and WhatsApp Business API onboarding",
      "Flow design — the exact journeys you want automated",
      "Template writing and submission for approval",
      "Automation build and CRM/webhook integration",
      "Pilot broadcast, review, then full rollout",
      "Monthly optimisation of templates and audiences",
    ],
    pricing: {
      startingAt: "From PKR 85,000",
      model: "One-time setup + monthly platform retainer (Meta conversation charges billed at cost)",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Is this the official WhatsApp API or an unofficial tool?",
        answer:
          "Official only. Unofficial tools get numbers banned. We onboard you properly through Meta's Business API so your number and reputation stay safe.",
      },
      {
        question: "Can we still reply manually?",
        answer:
          "Yes — automation handles the routine, and your team can take over any conversation at any moment from the shared inbox.",
      },
    ],
    keywords: [
      "whatsapp", "whatsapp api", "whatsapp business", "broadcast", "bulk message",
      "wa automation", "whatsapp marketing", "shared inbox",
    ],
  },

  {
    slug: "ai-agents",
    name: "AI Agents",
    group: "AI & Automation",
    tagline: "Software that does the work, not just the talking.",
    overview:
      "AI agents go a step beyond chatbots: they take actions. We build agents that read documents, update your CRM, chase quotations, draft proposals, qualify inbound leads, reconcile spreadsheets, monitor inboxes and trigger workflows across the tools you already use — with human approval gates wherever the stakes are high.",
    benefits: [
      "Remove hours of repetitive back-office work every single day",
      "Fewer human errors on data entry, follow-ups and reporting",
      "Scale operations without scaling payroll",
      "Institutional knowledge captured in a system instead of one person's head",
      "Human-in-the-loop approvals keep you in control of anything sensitive",
    ],
    features: [
      "Custom agents for sales, support, operations, finance and HR workflows",
      "Tool integrations: CRM, email, sheets, databases, WhatsApp, APIs",
      "Document understanding — invoices, contracts, CVs, reports",
      "Scheduled and event-triggered runs with full audit logging",
      "Approval steps and guardrails on any action that spends money or sends messages",
      "Dashboards showing what each agent did, when and why",
    ],
    process: [
      "Process audit — we time and map the workflow you want automated",
      "Agent design — tools, guardrails, approval points, success criteria",
      "Build and sandbox testing against real historical data",
      "Shadow run alongside your team to prove accuracy",
      "Go live with monitoring, logging and rollback",
      "Quarterly review and expansion to the next workflow",
    ],
    pricing: {
      startingAt: "From PKR 250,000",
      model: "Per-workflow build + monthly monitoring and AI usage retainer",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "What is the difference between a chatbot and an AI agent?",
        answer:
          "A chatbot answers questions. An agent completes tasks — it can look things up, update records, send messages and trigger workflows, then report what it did.",
      },
      {
        question: "How do you stop an agent doing something wrong?",
        answer:
          "Every agent runs inside defined tool permissions, with approval gates on high-impact actions and a complete audit log of each step.",
      },
    ],
    keywords: [
      "ai agent", "agents", "automation", "workflow automation", "rpa",
      "process automation", "back office automation", "ai employee",
    ],
  },

  // ------------------------------------------------------------------ Marketing
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    group: "Marketing & Growth",
    tagline: "Campaigns measured in customers, not likes.",
    overview:
      "A complete performance marketing service across Meta, Google, TikTok and LinkedIn. We handle strategy, creative, audience building, landing pages, tracking and optimisation — and report on cost per lead and return on ad spend rather than vanity metrics.",
    benefits: [
      "Predictable, trackable lead flow instead of unpredictable word of mouth",
      "Lower cost per lead through continuous creative and audience testing",
      "Creative, media buying and landing pages handled by one accountable team",
      "Clear monthly reporting you can actually act on",
      "Retargeting that brings back visitors who didn't buy on the first visit",
    ],
    features: [
      "Meta, Google, TikTok, YouTube and LinkedIn campaign management",
      "Ad creative production — static, carousel, reels and short-form video",
      "Landing page design and conversion rate optimisation",
      "Pixel, conversion API and GA4 tracking setup",
      "Audience research, segmentation and lookalike building",
      "Monthly performance report with next-month plan",
    ],
    process: [
      "Business and competitor audit, offer sharpening",
      "Channel strategy and budget allocation",
      "Tracking setup — pixels, events, conversion API, dashboards",
      "Creative production and campaign launch",
      "Weekly optimisation cycles on creative, audience and bid",
      "Monthly reporting and strategy review",
    ],
    pricing: {
      startingAt: "From PKR 75,000 / month",
      model: "Monthly management retainer (ad spend billed separately, paid directly by you)",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Is ad spend included in the retainer?",
        answer:
          "No. The retainer covers strategy, creative and management. Ad budget is paid by you directly to the platform so you keep full ownership and visibility.",
      },
      {
        question: "How soon will we see results?",
        answer:
          "Data starts arriving in the first week. A stable, optimised cost per lead usually takes 4–8 weeks depending on budget and industry.",
      },
    ],
    keywords: [
      "digital marketing", "ads", "advertising", "facebook ads", "meta ads",
      "google ads", "tiktok ads", "ppc", "lead generation", "performance marketing",
      "social media ads", "marketing",
    ],
  },

  {
    slug: "seo",
    name: "SEO",
    group: "Marketing & Growth",
    tagline: "Own the searches your customers already make.",
    overview:
      "Search engine optimisation that compounds. We fix the technical foundation, build content around the terms that actually convert, earn quality links and dominate local map results — so you stop renting every click from ad platforms.",
    benefits: [
      "Traffic that keeps arriving after you stop paying for ads",
      "High intent — searchers are actively looking to buy right now",
      "Local map pack visibility for 'near me' searches",
      "Compounding asset value: rankings built this year still earn next year",
      "Transparent keyword, traffic and conversion reporting",
    ],
    features: [
      "Full technical audit — speed, indexation, structure, Core Web Vitals",
      "Keyword and search-intent research mapped to your services",
      "On-page optimisation and internal linking architecture",
      "Content strategy and SEO copywriting",
      "Google Business Profile and local SEO",
      "Authority building through quality, relevant backlinks",
      "Rank tracking dashboard and monthly reporting",
    ],
    process: [
      "Technical audit and competitor gap analysis",
      "Keyword map and content plan",
      "Technical fixes and on-page optimisation",
      "Content production and publishing cadence",
      "Local SEO and authority building",
      "Monthly reporting, iteration and expansion",
    ],
    pricing: {
      startingAt: "From PKR 60,000 / month",
      model: "Monthly retainer, typically a 6-month minimum engagement",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "How long does SEO take?",
        answer:
          "Meaningful movement usually starts at 3 months, with compounding results from 6 months onward. Anyone promising page one in two weeks is selling something else.",
      },
      {
        question: "Do you guarantee number one rankings?",
        answer:
          "No credible agency can — Google's algorithm isn't ours to control. We guarantee the work, the transparency and the reporting.",
      },
    ],
    keywords: [
      "seo", "search engine optimization", "ranking", "google ranking",
      "backlinks", "keywords", "local seo", "organic traffic", "google business profile",
    ],
  },

  {
    slug: "social-media-marketing",
    name: "Social Media Marketing",
    group: "Marketing & Growth",
    tagline: "A feed that builds trust and a pipeline that fills itself.",
    overview:
      "End-to-end social media management for Facebook, Instagram, TikTok, LinkedIn and YouTube: content strategy, design, short-form video, scheduling, community management and monthly analytics — run as a growth channel, not a chore.",
    benefits: [
      "Consistent, on-brand presence without your team burning weekends",
      "Short-form video built for reach, not just for posting",
      "Faster replies to comments and DMs means more converted enquiries",
      "Content library you own and can reuse in ads",
      "Clear reporting on reach, engagement and enquiries generated",
    ],
    features: [
      "Monthly content calendar and copywriting",
      "Graphic design and reels/short-form video editing",
      "Scheduling and publishing across all major platforms",
      "Community management — comments, DMs, reviews",
      "Influencer and collaboration coordination",
      "Monthly analytics with content performance breakdown",
    ],
    process: [
      "Brand, audience and competitor review",
      "Content pillars and monthly calendar approval",
      "Production — design, video, copy",
      "Scheduling, publishing and community management",
      "Performance review and next-month planning",
    ],
    pricing: {
      startingAt: "From PKR 55,000 / month",
      model: "Monthly retainer, tiered by posts and video volume",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Do you shoot the content too?",
        answer:
          "We produce design and edit video from footage you supply, and can arrange a shoot day in Faisalabad or Lahore as an add-on.",
      },
      {
        question: "Who owns the content?",
        answer: "You do — all files and source assets are handed over on request.",
      },
    ],
    keywords: [
      "social media", "smm", "instagram", "facebook page", "tiktok", "linkedin",
      "content", "reels", "posting", "community management",
    ],
  },

  {
    slug: "branding",
    name: "Branding",
    group: "Brand & Design",
    tagline: "Look like the company you're trying to become.",
    overview:
      "Full brand identity development — positioning, naming, logo, colour, typography, voice and a complete guideline system — plus every asset you need to apply it consistently across print, digital and social.",
    benefits: [
      "Charge more: a credible brand removes the 'cheap' objection",
      "Instant recognition across every channel you appear on",
      "Faster design decisions because the rules are written down",
      "Marketing that compounds instead of restarting every campaign",
      "Assets ready for print, web, social and packaging on day one",
    ],
    features: [
      "Brand discovery workshop and positioning statement",
      "Logo design with full variation and lockup set",
      "Colour palette, typography system and iconography",
      "Brand voice and messaging guide",
      "Stationery, social templates and packaging application",
      "Brand guideline document (PDF + editable source files)",
    ],
    process: [
      "Discovery workshop — audience, competitors, positioning",
      "Concept direction — three routes presented",
      "Refinement of the chosen direction",
      "System build — colour, type, icon, layout rules",
      "Application to real assets",
      "Guideline handover and team briefing",
    ],
    pricing: {
      startingAt: "From PKR 95,000",
      model: "One-time identity project, priced by scope and application count",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Do we get the source files?",
        answer:
          "Yes — vector logo files, editable templates and the full guideline document are yours on completion.",
      },
      {
        question: "Can you refresh our brand instead of replacing it?",
        answer:
          "Absolutely. A brand refresh keeps the equity you've built and modernises the execution.",
      },
    ],
    keywords: [
      "branding", "brand", "logo", "logo design", "identity", "brand guidelines",
      "rebrand", "brand book", "stationery", "packaging",
    ],
  },

  {
    slug: "ui-ux",
    name: "UI/UX Design",
    group: "Brand & Design",
    tagline: "Interfaces people understand without being taught.",
    overview:
      "Product and interface design grounded in research: user flows, wireframes, high-fidelity UI, interactive prototypes and a reusable design system — validated with real users before a single line of code is written.",
    benefits: [
      "Catch expensive mistakes in Figma rather than in production",
      "Higher conversion and completion rates from cleaner flows",
      "Fewer support tickets because the interface explains itself",
      "A design system that keeps future screens consistent and fast to build",
      "Developer-ready handoff with specs, tokens and assets",
    ],
    features: [
      "User research, personas and journey mapping",
      "Information architecture and user flows",
      "Wireframes and interactive prototypes",
      "High-fidelity UI design for web and mobile",
      "Design system with components, tokens and states",
      "Accessibility review and developer handoff documentation",
    ],
    process: [
      "Research — users, competitors, existing analytics",
      "Flows and wireframes for the core journeys",
      "Prototype and usability testing",
      "High-fidelity UI and design system",
      "Handoff, developer support and QA review",
    ],
    pricing: {
      startingAt: "From PKR 110,000",
      model: "Per-project, scoped by screen count and research depth",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Can you design for a product we already have?",
        answer:
          "Yes. We start with a UX audit of the live product and analytics, then redesign the highest-impact flows first.",
      },
      {
        question: "Do you build what you design?",
        answer:
          "We can — our development team takes designs straight to production, or we hand off cleanly to your in-house engineers.",
      },
    ],
    keywords: [
      "ui", "ux", "ui ux", "design", "figma", "prototype", "wireframe",
      "user experience", "interface", "design system", "usability",
    ],
  },

  // ---------------------------------------------------------------- Engineering
  {
    slug: "website-development",
    name: "Website Development",
    group: "Engineering",
    tagline: "Fast, findable websites built to convert.",
    overview:
      "Custom websites and e-commerce stores built on modern frameworks or WordPress/Shopify where that fits better. Every build is fast, mobile-first, SEO-ready, secure and handed over with a CMS your team can actually use.",
    benefits: [
      "Loads fast on Pakistani mobile networks, not just on office fibre",
      "SEO foundations built in from day one instead of bolted on later",
      "Edit content yourself — no developer needed for a price change",
      "Secure, backed up, and monitored",
      "Analytics and lead tracking wired in from launch",
    ],
    features: [
      "Custom design or premium theme customisation",
      "Next.js / React builds, or WordPress & Shopify where appropriate",
      "E-commerce with local payment gateway integration",
      "CMS training and documentation for your team",
      "Speed, Core Web Vitals and technical SEO optimisation",
      "SSL, hardening, automated backups and uptime monitoring",
      "Analytics, pixels and conversion tracking",
    ],
    process: [
      "Requirements, sitemap and content plan",
      "Design — wireframe then high-fidelity approval",
      "Development and CMS integration",
      "Content loading, SEO setup and QA across devices",
      "Launch, training handover and monitoring",
      "Optional monthly care plan",
    ],
    pricing: {
      startingAt: "From PKR 90,000",
      model: "One-time build + optional monthly care plan (hosting, updates, backups)",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "WordPress or custom code?",
        answer:
          "It depends on the job. Content-led sites are often best on WordPress; anything with complex logic, speed demands or custom dashboards we build on Next.js. We recommend honestly, not by preference.",
      },
      {
        question: "Is hosting included?",
        answer:
          "Hosting is separate but we set it up, configure it and can manage it under a care plan.",
      },
    ],
    keywords: [
      "website", "web development", "web design", "wordpress", "shopify",
      "ecommerce", "online store", "landing page", "site", "web",
    ],
  },

  {
    slug: "software-development",
    name: "Software Development",
    group: "Engineering",
    tagline: "Custom systems that fit how your business actually runs.",
    overview:
      "Bespoke web applications, dashboards, portals, CRMs, ERPs and API integrations — engineered properly, with clean architecture, real test coverage, documentation and a deployment pipeline you can hand to any team later.",
    benefits: [
      "Software shaped around your process instead of the other way round",
      "One connected system rather than a dozen spreadsheets",
      "Real-time visibility into operations for decision makers",
      "Scales with you — architecture designed for growth from the start",
      "You own the code, the data and the infrastructure",
    ],
    features: [
      "Web applications, admin dashboards and customer portals",
      "Custom CRM, ERP, LMS, inventory and billing systems",
      "Third-party API and payment gateway integrations",
      "Role-based access control and audit logging",
      "Automated testing, CI/CD and containerised deployment",
      "Technical documentation and team handover",
    ],
    process: [
      "Discovery — process mapping and technical requirements",
      "Architecture, data model and delivery plan",
      "Sprint-based development with fortnightly demos",
      "QA, security review and user acceptance testing",
      "Deployment, training and documentation handover",
      "Support and enhancement retainer",
    ],
    pricing: {
      startingAt: "From PKR 350,000",
      model: "Per-project (milestone-based) or dedicated monthly team",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Do we own the source code?",
        answer:
          "Yes. Full IP transfer on final payment, with the repository, documentation and deployment configuration handed over.",
      },
      {
        question: "Can you take over an existing codebase?",
        answer:
          "Yes — we start with a code and infrastructure audit, then agree a stabilisation plan before adding features.",
      },
    ],
    keywords: [
      "software", "software development", "custom software", "erp", "crm",
      "system", "web app", "application", "portal", "dashboard", "api", "integration",
    ],
  },

  {
    slug: "mobile-apps",
    name: "Mobile Apps",
    group: "Engineering",
    tagline: "One codebase, both stores, native feel.",
    overview:
      "iOS and Android applications built with React Native or Flutter — from concept and design through to store submission, analytics, push notifications and post-launch iteration.",
    benefits: [
      "Reach both platforms without paying to build twice",
      "Push notifications give you a direct line to customers",
      "Offline-capable experiences for unreliable connectivity",
      "App store presence that adds real credibility",
      "In-app analytics showing exactly where users drop off",
    ],
    features: [
      "React Native / Flutter cross-platform development",
      "Native modules where performance demands them",
      "Push notifications and deep linking",
      "Offline sync and local storage",
      "In-app payments and subscription handling",
      "App Store and Play Store submission and review management",
      "Crash reporting and product analytics",
    ],
    process: [
      "Concept, feature prioritisation and platform decision",
      "UX flows and UI design",
      "Development with staged TestFlight / internal builds",
      "QA on a real device matrix",
      "Store submission and launch",
      "Post-launch analytics, iteration and version updates",
    ],
    pricing: {
      startingAt: "From PKR 300,000",
      model: "Per-project, plus optional monthly maintenance and release retainer",
      note: PRICE_NOTE,
    },
    portfolio: [],
    faqs: [
      {
        question: "Do you handle App Store and Play Store submission?",
        answer:
          "Yes — including developer account setup, store listing, screenshots, privacy declarations and review responses.",
      },
      {
        question: "Native or cross-platform?",
        answer:
          "Cross-platform covers the vast majority of business apps at roughly half the cost. We recommend native only when the app genuinely needs it.",
      },
    ],
    keywords: [
      "mobile app", "app", "android", "ios", "react native", "flutter",
      "play store", "app store", "mobile application",
    ],
  },
];

/** Grouped view used by the menu panel and the services landing section. */
export const MARKETING_SERVICE_GROUPS = [
  "AI & Automation",
  "Marketing & Growth",
  "Brand & Design",
  "Engineering",
] as const;

/** Look up a service by slug. */
export function findService(slug: string): ServiceItem | undefined {
  return MARKETING_SERVICES.find((s) => s.slug === slug);
}

/** Best-effort match of free text ("i need a chat bot") to a service. */
export function matchService(text: string): ServiceItem | undefined {
  const q = text.toLowerCase();
  let best: { service: ServiceItem; score: number } | null = null;
  for (const service of MARKETING_SERVICES) {
    let score = 0;
    if (q.includes(service.name.toLowerCase())) score += 5;
    for (const kw of service.keywords) if (q.includes(kw)) score += 2;
    if (score > (best?.score ?? 0)) best = { service, score };
  }
  return best && best.score >= 2 ? best.service : undefined;
}
