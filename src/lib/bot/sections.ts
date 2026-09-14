import type { SectionKey } from "./schema";

/** How each configuration section is presented in Chatbot Studio. */
export const SECTION_INFO: Record<SectionKey, { title: string; group: string; description: string }> = {
  contact: {
    title: "Contact details",
    group: "Business",
    description: "The WhatsApp number the chatbot runs on, the business phone, email, website, WhatBot Pro link, address and opening hours the assistant may give out.",
  },
  businessHours: {
    title: "Business hours",
    group: "Business",
    description: "When the team is available. Used to tell customers when a person will reply, and to keep follow-ups inside working hours. Days: 0 = Sunday … 6 = Saturday.",
  },
  teams: {
    title: "Teams & departments",
    group: "Business",
    description: "Each team's name, the inboxes its handovers and alerts go to, and the console users (by email) its new leads are assigned to.",
  },
  pricing: {
    title: "Pricing",
    group: "Business",
    description: "The only prices the assistant will ever quote, and the intents they apply to. Any service not listed here is quoted by the team after scoping.",
  },
  proof: {
    title: "Our work & results",
    group: "Business",
    description: "Verified case studies, results, projects, reviews and industries shown under Our Work & Results. Empty sections offer a strategy call instead — never invented examples.",
  },
  personality: {
    title: "AI personality",
    group: "Conversation",
    description: "The assistant's name, voice and standing instructions, added to every AI answer.",
  },
  messages: {
    title: "Messages & welcome",
    group: "Conversation",
    description: "The welcome message and every fixed message: opt-out, handover, enterprise, pricing, errors. Placeholders like {name} and {reference} are filled in automatically.",
  },
  menu: {
    title: "Menu items & services",
    group: "Conversation",
    description: "The main menu, sub-menus and service explainers. Each node is a menu (a list), a service (an explainer with buttons) or an action.",
  },
  actions: {
    title: "Buttons",
    group: "Conversation",
    description: "Reusable buttons — Book Consultation, Get a Quote, Talk to Expert… — and what each one does. Button titles show at most 20 characters.",
  },
  flows: {
    title: "Qualification questions",
    group: "Conversation",
    description: "The questions each flow asks (quote, lead generation, project brief, support, demo…), what they create in the CRM and the buttons offered at the end.",
  },
  options: {
    title: "Answer options",
    group: "Conversation",
    description: "The service list, budget ranges (US dollars, and rupees for Pakistan) and timelines offered as choices in flows.",
  },
  countries: {
    title: "Markets",
    group: "Conversation",
    description: "Supported countries: dial codes, website domains and words that identify each, and the currency used for budgets.",
  },
  intents: {
    title: "Intents & routing",
    group: "Automation",
    description: "For each of the 30 intents: the team it routes to, the service it maps to, the buttons under an answer and extra keywords that detect it.",
  },
  scoring: {
    title: "Lead scoring",
    group: "Automation",
    description: "Points per signal and the Cold / Warm / Hot / High Priority thresholds.",
  },
  enterprise: {
    title: "Enterprise detection",
    group: "Automation",
    description: "Headcount and branch thresholds, and phrases that switch on Enterprise Mode.",
  },
  handover: {
    title: "Human handover",
    group: "Automation",
    description: "When to hand a conversation to a person, which lead bands alert the team, and whether the assistant stays silent afterwards.",
  },
  followUp: {
    title: "Follow-up timing",
    group: "Automation",
    description: "When quiet leads get a check-in, which bands qualify, the message and buttons, and the approved template for check-ins after 24 hours.",
  },
  sources: {
    title: "Source tracking",
    group: "Automation",
    description: "ref: codes for links and QR codes (wa.me/…?text=Hi%20ref:qr:expo) and how long a broadcast reply is attributed to that broadcast.",
  },
  broadcastCategories: {
    title: "Broadcast categories",
    group: "Automation",
    description: "The categories marketing broadcasts are organised under.",
  },
};
