import type { KnowledgeEntry } from "@/types";
import { BRAND as brand } from "@/lib/brands";
import { MARKETING_SERVICES } from "./services";

/**
 * =============================================================================
 *  BITSOL Marketing — knowledge base
 * =============================================================================
 *
 *  The assistant answers from this content first and only falls back to
 *  general model knowledge when nothing matches.
 *
 *  Two sources make up the base:
 *    1. Hand-written company entries below (about, process, pricing, support…)
 *    2. Auto-derived entries, one per service, built from the catalogue so a
 *       service edit updates the assistant's answers in exactly one place.
 *
 *  Seeded into `knowledge_base_marketing` and editable from Admin → Knowledge
 *  Base thereafter.
 * =============================================================================
 */

const COMPANY_ENTRIES: KnowledgeEntry[] = [
  {
    id: "mk-about",
    kind: "ARTICLE",
    category: "About",
    question: "What is BITSOL Marketing and what do you do?",
    answer: `${brand.description}\n\nWe work across four areas: **Business Services**, **Digital Solutions**, **AI Automation** and **Software Development**. Practically, that means AI chatbots and agents, WhatsApp automation, digital marketing and SEO, websites, mobile apps, custom software, UI/UX, branding and corporate training. We are based in ${brand.contact.city} and work with clients across Pakistan and internationally.`,
    keywords: ["about", "who are you", "company", "bitsol marketing", "what do you do", "introduction"],
  },
  {
    id: "mk-why-us",
    kind: "ARTICLE",
    category: "About",
    question: "Why should we choose BITSOL Marketing?",
    answer:
      "Three reasons clients give us:\n\n1. **We build and market.** Most agencies do one or the other. We can design your brand, build the software, and then run the campaigns that fill it — so nothing falls between vendors.\n2. **AI is our core, not an add-on.** We ship production AI systems, so automation advice comes from delivery experience rather than a sales deck.\n3. **You own everything.** Source code, design files, ad accounts and data stay yours. No lock-in.\n\nWe also report honestly — including when something isn't working.",
    keywords: ["why", "why choose", "different", "better", "competitors", "advantage"],
  },
  {
    id: "mk-services-overview",
    kind: "SERVICE",
    category: "Services",
    question: "What services does BITSOL Marketing offer?",
    answer: `We offer:\n\n**AI & Automation** — AI Chatbots, WhatsApp Automation, AI Agents\n**Marketing & Growth** — Digital Marketing, SEO, Social Media Marketing\n**Brand & Design** — Branding, UI/UX Design\n**Engineering** — Website Development, Software Development, Mobile Apps\n**Enablement** — Corporate Training\n\nAsk about any one of these and I'll walk you through the overview, benefits, features, process, indicative pricing, portfolio and FAQs — and I can book you a consultation or prepare a quote request.`,
    keywords: ["services", "what do you offer", "list", "solutions", "offerings", "menu"],
  },
  {
    id: "mk-process",
    kind: "ARTICLE",
    category: "How we work",
    question: "How does the process work from first contact to delivery?",
    answer:
      "1. **Discovery call (free)** — 30 minutes to understand your goal, current setup and constraints.\n2. **Proposal & quote** — scope, deliverables, timeline and a fixed price, usually within 2–3 working days.\n3. **Kickoff** — advance payment, project channel opened, milestones agreed.\n4. **Delivery in milestones** — you review and approve at each stage rather than at the end.\n5. **Launch & handover** — files, access, training and documentation transferred to you.\n6. **Support** — an optional monthly care or retainer plan.\n\nYou get a named point of contact throughout.",
    keywords: ["process", "how it works", "steps", "workflow", "procedure", "how do you work", "timeline"],
  },
  {
    id: "mk-pricing",
    kind: "POLICY",
    category: "Pricing",
    question: "How much do your services cost?",
    answer:
      "Pricing depends on scope, so we quote per project rather than from a fixed rate card. Indicative starting points:\n\n- AI Chatbots — from PKR 120,000\n- WhatsApp Automation — from PKR 85,000\n- AI Agents — from PKR 250,000\n- Digital Marketing — from PKR 75,000/month (ad spend separate)\n- SEO — from PKR 60,000/month\n- Social Media Marketing — from PKR 55,000/month\n- Website Development — from PKR 90,000\n- Software Development — from PKR 350,000\n- Mobile Apps — from PKR 300,000\n- UI/UX Design — from PKR 110,000\n- Branding — from PKR 95,000\n- Corporate Training — from PKR 65,000/day\n\n**These are starting points, not final prices.** Share your requirements and I'll raise a quote request so our team can send you an exact figure.",
    keywords: ["price", "pricing", "cost", "rate", "how much", "budget", "charges", "fees", "quotation"],
  },
  {
    id: "mk-payment-terms",
    kind: "POLICY",
    category: "Pricing",
    question: "What are your payment terms?",
    answer:
      "Projects typically run on a milestone schedule — an advance to begin, one or more progress payments, and a balance on delivery. Monthly services (marketing, SEO, care plans) are billed in advance each month. We accept bank transfer and can invoice international clients. Exact terms are confirmed in your written quotation before any work starts.",
    keywords: ["payment", "advance", "instalment", "installment", "invoice", "terms", "billing", "bank"],
  },
  {
    id: "mk-quote",
    kind: "ARTICLE",
    category: "Quote",
    question: "How do I request a quote?",
    answer:
      "Tell me what you need and I'll open a short quote request form. We collect your name, company, phone, email, business type, budget range, timeline and requirements — then generate a reference number, log it in our CRM and notify the sales team. You'll normally receive a written quotation within 2–3 working days.",
    keywords: ["quote", "quotation", "estimate", "proposal", "pricing request", "request quote"],
  },
  {
    id: "mk-consultation",
    kind: "ARTICLE",
    category: "Consultation",
    question: "Can I book a consultation or meeting?",
    answer: `Yes — the first consultation is free. Choose whichever suits you: **office visit** in ${brand.contact.city}, **Zoom**, **Google Meet** or a **WhatsApp call**. I'll take your name, phone, email, business name, preferred date and time, then confirm the booking with a reference number. Our office hours are ${brand.contact.hours}.`,
    keywords: ["meeting", "consultation", "book", "appointment", "call", "zoom", "google meet", "visit", "schedule"],
  },
  {
    id: "mk-contact",
    kind: "ARTICLE",
    category: "Contact",
    question: "How do I contact BITSOL Marketing?",
    answer: `**Phone / WhatsApp:** ${brand.contact.phone}\n**Email:** ${brand.contact.email}\n**Office:** ${brand.contact.address}, ${brand.contact.city}\n**Hours:** ${brand.contact.hours}\n**Website:** ${brand.contact.website}\n\nYou can also carry on right here — I can capture your requirement, book a meeting or raise a support ticket without you needing to call.`,
    keywords: ["contact", "phone", "number", "email", "address", "location", "office", "reach", "call", "whatsapp"],
  },
  {
    id: "mk-support",
    kind: "ARTICLE",
    category: "Support",
    question: "I need support with an existing project or service.",
    answer:
      "I can raise a support ticket right now. We handle five categories: **Technical Support**, **Billing**, **Sales**, **Complaint** and **General Inquiry**. Tell me which fits and describe the issue — I'll generate a ticket reference and route it to the right team. Urgent production issues are prioritised.",
    keywords: ["support", "help", "issue", "problem", "ticket", "complaint", "not working", "bug", "billing"],
  },
  {
    id: "mk-portfolio",
    kind: "ARTICLE",
    category: "Portfolio",
    question: "Can I see your portfolio or past work?",
    answer:
      "Yes. Our delivered work spans AI assistants for multi-department organisations, WhatsApp automation for retail and education, e-commerce stores with local payment integration, institute management systems, brand identities, and performance campaigns running at healthy return on ad spend. Tell me your industry or the service you're interested in and I'll show the most relevant examples — or book a consultation and the team will walk you through case studies in detail.",
    keywords: ["portfolio", "work", "case study", "projects", "examples", "clients", "previous work", "samples"],
  },
  {
    id: "mk-reviews",
    kind: "ARTICLE",
    category: "Portfolio",
    question: "What do your clients say about you?",
    answer:
      "Clients consistently mention three things: we reply fast, we explain trade-offs honestly instead of overselling, and we hand over full ownership of everything we build. Our longest relationships started as a single small project and grew into ongoing retainers. I can share written reviews relevant to your industry, or connect you with the team for references.",
    keywords: ["reviews", "testimonials", "feedback", "rating", "clients say", "references"],
  },
  {
    id: "mk-timeline",
    kind: "ARTICLE",
    category: "How we work",
    question: "How long do projects take?",
    answer:
      "Typical delivery windows:\n\n- Website — 3–6 weeks\n- WhatsApp automation — 2–4 weeks\n- AI chatbot — 2–6 weeks depending on integrations\n- Brand identity — 3–5 weeks\n- Mobile app — 8–16 weeks\n- Custom software — 10–24 weeks depending on scope\n- Marketing/SEO — ongoing monthly, with first results in weeks 4–8\n\nRush delivery is sometimes possible for an agreed premium. Your quotation confirms the exact schedule.",
    keywords: ["how long", "duration", "timeline", "delivery time", "when", "deadline", "fast", "urgent"],
  },
  {
    id: "mk-ownership",
    kind: "POLICY",
    category: "How we work",
    question: "Who owns the code, designs and accounts?",
    answer:
      "You do. On final payment we transfer full intellectual property — source code, repositories, design source files, brand assets and documentation. Ad accounts, hosting, domains and business tool accounts are created in your name from the start wherever possible, so you are never locked in.",
    keywords: ["ownership", "own", "ip", "intellectual property", "source code", "rights", "handover", "transfer"],
  },
  {
    id: "mk-industries",
    kind: "ARTICLE",
    category: "About",
    question: "Which industries do you work with?",
    answer:
      "We've delivered for retail and e-commerce, education, healthcare and clinics, real estate, professional services, manufacturing and distribution, restaurants and hospitality, and public-sector organisations. The methods transfer across industries — what changes is the research and the messaging, which we do at the start of every engagement.",
    keywords: ["industry", "industries", "sector", "niche", "who do you work with", "experience"],
  },
  {
    id: "mk-individual-courses",
    kind: "ARTICLE",
    category: "About",
    question: "Do you offer training courses for individuals?",
    answer:
      "Our training is built for **business teams**, not individual enrolment. Through **Corporate Training** we upskill your staff on AI tools, digital marketing, automation and the systems we build for you — delivered on-site or online, with content tailored to each team's real responsibilities.\n\nIf you're looking to train your team, I can share the programme details or book a consultation to scope it.",
    keywords: ["course", "courses", "learn", "training for me", "student", "admission", "institute", "classes", "teach"],
  },
];

/** One knowledge entry per service, derived from the catalogue. */
const SERVICE_ENTRIES: KnowledgeEntry[] = MARKETING_SERVICES.map((service) => ({
  id: `mk-service-${service.slug}`,
  kind: "SERVICE" as const,
  category: "Services",
  question: `Tell me about ${service.name}.`,
  answer: [
    `**${service.name}** — ${service.tagline}`,
    "",
    `**Overview**\n${service.overview}`,
    "",
    `**Benefits**\n${service.benefits.map((b) => `- ${b}`).join("\n")}`,
    "",
    `**What's included**\n${service.features.map((f) => `- ${f}`).join("\n")}`,
    "",
    `**Our process**\n${service.process.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
    "",
    `**Indicative pricing**\n${service.pricing.startingAt} · ${service.pricing.model}\n_${service.pricing.note}_`,
    "",
    `**Recent work**\n${service.portfolio.map((p) => `- ${p}`).join("\n")}`,
    "",
    `**FAQs**\n${service.faqs.map((f) => `**${f.question}**\n${f.answer}`).join("\n\n")}`,
  ].join("\n"),
  keywords: [service.slug.replace(/-/g, " "), service.name.toLowerCase(), ...service.keywords],
}));

export const MARKETING_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  ...COMPANY_ENTRIES,
  ...SERVICE_ENTRIES,
];

/** Categories surfaced to the model as its scope statement. */
export const MARKETING_KB_CATEGORIES = Array.from(
  new Set(MARKETING_KNOWLEDGE_BASE.map((e) => e.category))
);
