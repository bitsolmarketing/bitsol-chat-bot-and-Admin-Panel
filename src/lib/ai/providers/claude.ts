import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";
import type { AIProvider } from "../types";

/**
 * Anthropic Claude provider (default). Uses the official SDK's streaming API.
 * The model id comes from AI_MODEL (default `claude-opus-4-8`) and is fully
 * operator-configurable. Adaptive thinking is opt-in via AI_THINKING — kept off
 * by default so the public chat widget responds quickly.
 */
export function createClaudeProvider(): AIProvider {
  const apiKey = config.ai.anthropicApiKey;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Configure it in .env or switch AI_PROVIDER."
    );
  }
  const client = new Anthropic({ apiKey });

  return {
    name: "claude",
    async *streamChat({ system, messages, model, maxTokens, thinking }) {
      const params: Anthropic.MessageStreamParams = {
        model: model ?? config.ai.model,
        max_tokens: maxTokens ?? config.ai.maxTokens,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };

      // Opt-in adaptive thinking (Opus 4.6+/4.8). The API accepts `adaptive` at
      // runtime; cast keeps us forward-compatible with older SDK typings.
      if (config.ai.thinking && thinking !== false) {
        (params as unknown as Record<string, unknown>).thinking = {
          type: "adaptive",
          display: "summarized",
        };
      }

      const stream = client.messages.stream(params);

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}
