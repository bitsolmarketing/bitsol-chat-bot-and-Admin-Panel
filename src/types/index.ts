/** Shared domain types used by both client and server code. */

import type { Language } from "@/lib/i18n";

export type { Language } from "@/lib/i18n";

// ------------------------------------------------------------------- Chat ---

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
}

/** A tappable quick-reply / suggestion surfaced to the user. */
export interface QuickReply {
  label: string;
  /** The text sent to the assistant when tapped (defaults to `label`). */
  value?: string;
}

/**
 * A structured workflow the assistant can hand off to the UI — e.g. once the
 * user says "I want a quote", the model finishes its sentence and the client
 * opens the matching form instead of collecting nine fields conversationally.
 */
export type ChatActionKind = "LEAD_FORM" | "MEETING_FORM" | "QUOTE_FORM" | "SUPPORT_FORM";

export interface ChatAction {
  kind: ChatActionKind;
  /** Pre-selected service slug, when the user named one. */
  subject?: string;
}

/** SSE event payloads streamed from /api/chat to the browser. */
export type ChatStreamEvent =
  | { type: "meta"; language: Language }
  | { type: "chunk"; text: string }
  | {
      type: "done";
      ticketId?: string;
      suggestions?: string[];
      action?: ChatAction;
    }
  | { type: "error"; message: string };

// -------------------------------------------------------- Knowledge base ----

export type KnowledgeKind = "FAQ" | "ARTICLE" | "SERVICE" | "POLICY" | "DOCUMENT";

/** One entry in the BITSOL Marketing knowledge base. */
export interface KnowledgeEntry {
  id: string;
  kind: KnowledgeKind;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

// ------------------------------------------------------------- Catalogues ---

/** Pricing is a placeholder until BITSOL publishes final rate cards. */
export interface PricePlaceholder {
  /** Human-readable starting point, e.g. "From PKR 45,000". */
  startingAt: string;
  /** Billing shape, e.g. "one-time project" or "monthly retainer". */
  model: string;
  /** Always shown so the assistant never presents a price as final. */
  note: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** A BITSOL Marketing service, rendered in the menu and answered from the KB. */
export interface ServiceItem {
  slug: string;
  name: string;
  group: string;
  tagline: string;
  overview: string;
  benefits: string[];
  features: string[];
  process: string[];
  pricing: PricePlaceholder;
  portfolio: string[];
  faqs: FaqItem[];
  keywords: string[];
}

/** A menu entry shown in the chat menu panel. */
export interface MenuEntry {
  id: string;
  label: string;
  labelUr: string;
  /** Prompt sent to the assistant when tapped. */
  prompt: string;
  /** Optional structured workflow to open instead of sending a prompt. */
  action?: ChatAction;
  children?: MenuEntry[];
}

// ------------------------------------------------------------ Submissions ---

export interface LeadSubmission {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  businessType?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  requirements: string;
  conversationRef?: string;
}

export interface MeetingSubmission {
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  preferredDate: string;
  preferredTime: string;
  mode: "OFFICE" | "ZOOM" | "GOOGLE_MEET" | "WHATSAPP";
  topic?: string;
  conversationRef?: string;
}

export interface TicketSubmission {
  category: "TECHNICAL" | "BILLING" | "SALES" | "COMPLAINT" | "GENERAL";
  name: string;
  phone?: string;
  email?: string;
  subject: string;
  description: string;
  conversationRef?: string;
}

/** Uniform shape returned by every submission endpoint. */
export interface SubmissionResult {
  ok: boolean;
  reference?: string;
  message: string;
}
