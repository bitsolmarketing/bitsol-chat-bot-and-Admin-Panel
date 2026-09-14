import { config } from "@/lib/config";
import type { AIProvider } from "../types";
import { parseSSE } from "./openai";

/**
 * Google Gemini provider via the REST `streamGenerateContent` endpoint with
 * SSE. The Anthropic-style `system` prompt is mapped to Gemini's
 * `systemInstruction`, and turns are mapped to Gemini's `role: user|model`.
 *
 * A key from Google AI Studio is enough — the free tier serves the Flash and
 * Flash-Lite models with a daily request cap and uses the conversations to
 * improve Google's products; the paid tier lifts the cap and does not.
 */
export function createGeminiProvider(): AIProvider {
  const apiKey = config.ai.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Configure it in .env or switch AI_PROVIDER."
    );
  }

  const thinkingConfig = geminiThinkingConfig(config.ai.geminiThinking);

  return {
    name: "gemini",
    async *streamChat({ system, messages, model: override, maxTokens }) {
      const model = override || config.ai.model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:streamGenerateContent?alt=sse`;

      const body = {
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          maxOutputTokens: maxTokens ?? config.ai.maxTokens,
          ...(thinkingConfig ? { thinkingConfig } : {}),
        },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Header rather than a `key=` query parameter: a URL-embedded key
          // leaks into access logs, proxy logs and any thrown error string.
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        // Long enough to keep which quota a 429 hit (per minute or per day),
        // which Google puts after a paragraph of boilerplate.
        throw new Error(`Gemini error (${res.status}): ${detail.slice(0, 1200)}`);
      }

      yield* parseSSE(res.body, (json) =>
        // Gemini may split a single chunk across several parts; taking only
        // parts[0] silently drops text mid-answer. Thought summaries, when a
        // model returns them, are flagged and must not reach the customer.
        (json?.candidates?.[0]?.content?.parts ?? [])
          .filter((p: { thought?: boolean }) => !p?.thought)
          .map((p: { text?: string }) => p?.text ?? "")
          .join("")
      );
    },
  };
}

/**
 * GEMINI_THINKING in the API's shape. Gemini 2.5 Flash models switch thinking
 * off with a zero budget; Gemini 3 models take a level instead and cannot
 * switch it off entirely. Unset sends nothing, leaving the model's default.
 */
function geminiThinkingConfig(
  setting: typeof config.ai.geminiThinking
): { thinkingBudget: number } | { thinkingLevel: string } | undefined {
  if (!setting) return undefined;
  if (setting === "off") return { thinkingBudget: 0 };
  return { thinkingLevel: setting.toUpperCase() };
}
