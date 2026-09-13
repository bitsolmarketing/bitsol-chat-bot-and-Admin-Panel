import { detectLanguage, type Language } from "@/lib/i18n";
import type { ChatTurn } from "./types";
import { retrieveKnowledge } from "./knowledge";
import { buildSystemPrompt, type CustomerContext } from "./system-prompt";
import { getProvider } from "./provider";

export type { AIProvider, ChatTurn } from "./types";
export type { CustomerContext } from "./system-prompt";
export { getProvider } from "./provider";
export { retrieveKnowledge } from "./knowledge";
export { asksQuestion, shouldEscalate, suggestFollowUps } from "./intents";
export {
  extractCustomerDetails,
  mergeDetails,
  type CustomerDetails,
} from "./customer";

export interface AssistantPlan {
  language: Language;
  system: string;
}

/**
 * Work out how to handle this turn *before* any tokens are generated: which
 * language to answer in, and the system prompt built from the knowledge
 * entries that match the newest message and from what the customer has
 * already told us.
 *
 * Kept separate from streaming so the API route can send a `meta` event to the
 * client immediately — the UI switches text direction while the model is
 * still thinking.
 */
export function planAssistantTurn(
  messages: ChatTurn[],
  customer: CustomerContext
): AssistantPlan {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content ?? "";

  const language = detectLanguage(text);

  return {
    language,
    system: buildSystemPrompt({ language, relevant: retrieveKnowledge(text), customer }),
  };
}

/**
 * Stream the assistant's reply for a pre-computed plan.
 *
 * History is trimmed to the last 20 turns: enough for genuine conversation
 * memory, bounded enough to keep latency and token cost predictable. Details
 * given earlier than that are not lost — they reach the model through the
 * customer section of the system prompt.
 */
export async function* streamAssistantReply(
  messages: ChatTurn[],
  plan: AssistantPlan
): AsyncGenerator<string, void, unknown> {
  const provider = getProvider();
  yield* provider.streamChat({
    system: plan.system,
    messages: messages.slice(-20),
  });
}
