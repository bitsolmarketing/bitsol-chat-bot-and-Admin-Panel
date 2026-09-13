import type { MenuEntry } from "@/types";
import { MARKETING_SERVICES } from "./services";

/**
 * BITSOL Marketing conversation menu.
 *
 * Rendered in the chat menu panel. Every leaf sends a prompt: questions are
 * answered from the knowledge base, and requests (a quote, a consultation,
 * support) start a conversation in which the representative asks for what the
 * team needs.
 */
export const MARKETING_MENU: MenuEntry[] = [
  {
    id: "mk-about",
    label: "About BITSOL Marketing",
    labelUr: "بِٹسول مارکیٹنگ کے بارے میں",
    prompt: "Tell me about BITSOL Marketing — who you are and what you do.",
  },
  {
    id: "mk-services",
    label: "Our Services",
    labelUr: "ہماری خدمات",
    prompt: "What services does BITSOL Marketing offer?",
    children: MARKETING_SERVICES.map((service) => ({
      id: `mk-service-${service.slug}`,
      label: service.name,
      labelUr: service.name,
      prompt: `Tell me about ${service.name} — overview, benefits, features, process, pricing, portfolio and FAQs.`,
    })),
  },
  {
    id: "mk-portfolio",
    label: "Portfolio",
    labelUr: "ہمارا کام",
    prompt: "Show me your portfolio and case studies.",
  },
  {
    id: "mk-reviews",
    label: "Client Reviews",
    labelUr: "کلائنٹ کی رائے",
    prompt: "What do your clients say about working with BITSOL Marketing?",
  },
  {
    id: "mk-quote",
    label: "Request Quote",
    labelUr: "قیمت معلوم کریں",
    prompt: "I'd like a quote for a project.",
  },
  {
    id: "mk-consultation",
    label: "Book Consultation",
    labelUr: "مشاورت بُک کریں",
    prompt: "I'd like to book a free consultation.",
  },
  {
    id: "mk-support",
    label: "Support",
    labelUr: "سپورٹ",
    prompt: "I'm an existing client and need help with my project.",
  },
  {
    id: "mk-contact",
    label: "Contact",
    labelUr: "رابطہ",
    prompt: "How can I contact BITSOL Marketing?",
  },
];

/** Empty-state suggestions for a new BITSOL Marketing conversation. */
export const MARKETING_SUGGESTIONS = [
  {
    title: "Build an AI chatbot",
    titleUr: "اے آئی چیٹ بوٹ بنوائیں",
    prompt: "I want an AI chatbot for my business. How does it work and what does it cost?",
  },
  {
    title: "WhatsApp automation",
    titleUr: "واٹس ایپ آٹومیشن",
    prompt: "Tell me about WhatsApp automation for my business.",
  },
  {
    title: "Get more customers",
    titleUr: "زیادہ کسٹمرز حاصل کریں",
    prompt: "I want more customers from digital marketing. Where should I start?",
  },
  {
    title: "Build a website",
    titleUr: "ویب سائٹ بنوائیں",
    prompt: "I need a website for my business. What's the process and pricing?",
  },
  {
    title: "Request a quote",
    titleUr: "قیمت درکار ہے",
    prompt: "I'd like to request a quote for a project.",
  },
  {
    title: "Book a free consultation",
    titleUr: "مفت مشاورت بُک کریں",
    prompt: "I'd like to book a free consultation with your team.",
  },
];

/** Quick-reply chips shown under the composer in a Marketing conversation. */
export const MARKETING_QUICK_REPLIES = [
  "Pricing",
  "Portfolio",
  "Request a quote",
  "Book a consultation",
  "اردو میں بتائیں",
];
