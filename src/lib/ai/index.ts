import { config } from "@/lib/config";
import { detectLanguage, type Language } from "@/lib/i18n";
import type { AIProvider, ChatTurn } from "./types";
import { retrieveKnowledge } from "./knowledge";
import { buildSystemPrompt } from "./system-prompt";
import { createClaudeProvider } from "./providers/claude";
import { createOpenAIProvider } from "./providers/openai";
import { createGeminiProvider } from "./providers/gemini";

export type { AIProvider, ChatTurn } from "./types";
export { retrieveKnowledge } from "./knowledge";
export { detectAction, shouldEscalate, suggestFollowUps } from "./intents";

/**
 * Resolve the configured AI provider. Selection is driven by AI_PROVIDER so
 * BITSOL can move between Claude, an OpenAI-compatible API, a local Ollama
 * model, or Gemini without any code change.
 */
export function getProvider(): AIProvider {
  switch (config.ai.provider) {
    case "openai":
      return createOpenAIProvider(false);
    case "ollama":
      return createOpenAIProvider(true);
    case "gemini":
      return createGeminiProvider();
    case "claude":
    default:
      return createClaudeProvider();
  }
}

export interface AssistantPlan {
  language: Language;
  system: string;
}

/**
 * Work out how to handle this turn *before* any tokens are generated: which
 * language to answer in, and the system prompt built from the knowledge
 * entries that match the newest message.
 *
 * Kept separate from streaming so the API route can send a `meta` event to the
 * client immediately — the UI switches text direction while the model is
 * still thinking.
 */
export function planAssistantTurn(messages: ChatTurn[]): AssistantPlan {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content ?? "";

  const language = detectLanguage(text);

  return {
    language,
    system: buildSystemPrompt({ language, relevant: retrieveKnowledge(text) }),
  };
}

/**
 * Stream the assistant's reply for a pre-computed plan.
 *
 * History is trimmed to the last 20 turns: enough for genuine conversation
 * memory, bounded enough to keep latency and token cost predictable.
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
