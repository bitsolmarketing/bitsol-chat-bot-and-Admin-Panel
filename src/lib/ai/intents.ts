/**
 * =============================================================================
 *  Intent detection
 * =============================================================================
 *
 *  Turns a free-text message into the structured things the API layer needs:
 *
 *    • `shouldEscalate()`  — does this need a human, and therefore a ticket?
 *    • `suggestFollowUps()`— the quick-reply chips offered after the answer.
 *    • `asksQuestion()`    — is the reply waiting on an answer from the customer?
 *
 *  All of it is deterministic keyword work. The model writes the prose; this
 *  module decides what the product does, so behaviour stays predictable and
 *  testable rather than depending on the model remembering to emit a marker.
 *
 *  Quotes, consultations and support requests are not detected here: the
 *  representative collects those details in conversation, and
 *  `customer.ts` reads them back out.
 * =============================================================================
 */
import { matchService } from "@/data/marketing/services";

// ------------------------------------------------------------ Escalation ----

/**
 * Explicit requests for a person, and complaints. "Call me" and "your sales
 * team" are deliberately absent: those are someone asking to be contacted,
 * which the representative handles by taking their number — a ticket would
 * interrupt the one conversation most likely to become a client.
 */
const ESCALATION_TRIGGERS = [
  "talk to a human", "speak to a human", "talk to someone", "speak to someone",
  "real person", "human agent", "representative", "live agent",
  "complaint", "complain", "refund", "not happy", "unhappy", "disappointed",
  "not helpful", "useless", "frustrated", "escalate", "manager", "supervisor",
  "legal", "shikayat", "baat karwao", "banda", "insan se baat",
];

/**
 * Should this exchange be escalated to a human, with a tracking ticket?
 * Used by the chat route to attach a ticket reference to the reply.
 */
export function shouldEscalate(message: string): boolean {
  const text = normalise(message);
  return ESCALATION_TRIGGERS.some((trigger) => text.includes(trigger));
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

/**
 * A closing "anything else I can help with?" in the four languages. It ends
 * with a question mark but is not waiting on an answer — it is the
 * representative handing the turn back, which is exactly when chips help.
 */
const CLOSING_QUESTION =
  /(anything else|something else|what else|else (i|we) can|aur (kuch|koi|kisi)|(kuch|koi|kisi) aur|mazeed (kuch|koi|madad|maloomat|sawal)|کچھ اور|کوئی اور|کسی اور|مزید (کچھ|کوئی|مدد|معلومات|سوال)|ہور (کجھ|کوئی)|(کجھ|کوئی) ہور)/i;

/**
 * True when the reply ends on a question the customer is expected to answer.
 * Quick-reply chips and buttons are withheld then: offering "Request a quote"
 * underneath "What's the name of your business?" pulls the customer away from
 * answering. A generic "anything else?" closer does not count.
 */
export function asksQuestion(reply: string): boolean {
  const lastLine = reply.trim().split("\n").pop()?.trim() ?? "";
  if (!/[?؟][\s*_)"'”’]*$/.test(lastLine)) return false;
  // Only the final sentence decides: "I've noted your number. Anything else?"
  // hands the turn back even though an earlier sentence may have been a request.
  const lastSentence = lastLine.split(/(?<=[.!?؟])\s+/).pop() ?? lastLine;
  return !CLOSING_QUESTION.test(lastSentence);
}

// ------------------------------------------------------------------ utils ---

function normalise(text: string): string {
  return ` ${(text ?? "").toLowerCase().replace(/\s+/g, " ").trim()} `;
}

function hit(text: string, triggers: readonly string[]): boolean {
  return triggers.some((trigger) => text.includes(trigger));
}
