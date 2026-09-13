/**
 * =============================================================================
 *  Intent detection
 * =============================================================================
 *
 *  Turns a free-text message into the structured things the API layer needs:
 *
 *    • `detectAction()`    — should the client open a form (quote, meeting,
 *      support) instead of collecting eight fields across eight conversational
 *      turns?
 *    • `shouldEscalate()`  — does this need a human, and therefore a ticket?
 *    • `suggestFollowUps()`— the quick-reply chips offered after the answer.
 *
 *  All of it is deterministic keyword work. The model writes the prose; this
 *  module decides what the product does, so behaviour stays predictable and
 *  testable rather than depending on the model remembering to emit a marker.
 * =============================================================================
 */
import type { ChatAction } from "@/types";
import { matchService } from "@/data/marketing/services";

// ------------------------------------------------------------ Escalation ----

const ESCALATION_TRIGGERS = [
  "talk to a human", "speak to a human", "talk to someone", "speak to someone",
  "real person", "human agent", "customer service", "call me", "call back",
  "callback", "sales team", "your team", "representative",
  "complaint", "complain", "refund", "not happy", "unhappy", "disappointed",
  "not helpful", "useless", "frustrated", "escalate", "manager", "supervisor",
  "legal", "shikayat", "baat karni hai", "baat karwao", "banda", "insan se baat",
];

/**
 * Should this exchange be escalated to a human, with a tracking ticket?
 * Used by the chat route to attach a ticket reference to the reply.
 */
export function shouldEscalate(message: string): boolean {
  const text = normalise(message);
  return ESCALATION_TRIGGERS.some((trigger) => text.includes(trigger));
}

// ------------------------------------------------------- Workflow actions ---

const QUOTE_TRIGGERS = [
  "quote", "quotation", "estimate", "how much would it cost", "send me a price",
  "price list", "pricing for", "proposal", "budget kitna", "rate kya",
];

const MEETING_TRIGGERS = [
  "book a meeting", "book meeting", "schedule a call", "schedule a meeting",
  "consultation", "appointment", "meet you", "zoom", "google meet",
  "office visit", "visit your office", "meeting rakhni", "meeting book",
];

const SUPPORT_TRIGGERS = [
  "support ticket", "raise a ticket", "open a ticket", "technical issue",
  "not working", "broken", "bug", "error", "billing issue", "invoice issue",
  "existing project", "my website is", "my bot is",
];

/**
 * Decide whether the client should open a structured form after this turn.
 *
 * Returns `undefined` for ordinary informational messages — most turns are just
 * conversation and should not be interrupted by a form.
 */
export function detectAction(message: string): ChatAction | undefined {
  const text = normalise(message);

  if (hit(text, QUOTE_TRIGGERS)) {
    return { kind: "QUOTE_FORM", subject: matchService(text)?.slug };
  }
  if (hit(text, MEETING_TRIGGERS)) {
    return { kind: "MEETING_FORM", subject: matchService(text)?.slug };
  }
  if (hit(text, SUPPORT_TRIGGERS)) {
    return { kind: "SUPPORT_FORM" };
  }
  return undefined;
}

// -------------------------------------------------------- Follow-up chips ---

/**
 * Context-aware quick replies shown after an answer. Deliberately short — these
 * are chips, not sentences.
 */
export function suggestFollowUps(message: string): string[] {
  const text = normalise(message);

  const service = matchService(text);
  if (service) {
    return [
      `${service.name} pricing`,
      `${service.name} process`,
      "See portfolio",
      "Request a quote",
      "Book a consultation",
    ];
  }
  if (hit(text, ["price", "cost", "pricing", "budget", "rate"])) {
    return ["Request a quote", "Book a consultation", "What's included?", "See portfolio"];
  }
  return [
    "Our services",
    "Portfolio",
    "Request a quote",
    "Book a consultation",
    "Talk to the team",
  ];
}

// ------------------------------------------------------------------ utils ---

function normalise(text: string): string {
  return ` ${(text ?? "").toLowerCase().replace(/\s+/g, " ").trim()} `;
}

function hit(text: string, triggers: readonly string[]): boolean {
  return triggers.some((trigger) => text.includes(trigger));
}
