import { config } from "@/lib/config";
import type { AIProvider } from "../types";
import { parseSSE } from "./openai";

/**
 * Google Gemini provider via the REST `streamGenerateContent` endpoint with
 * SSE. The Anthropic-style `system` prompt is mapped to Gemini's
 * `systemInstruction`, and turns are mapped to Gemini's `role: user|model`.
 */
export function createGeminiProvider(): AIProvider {
  const apiKey = config.ai.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Configure it in .env or switch AI_PROVIDER."
    );
  }

  return {
    name: "gemini",
    async *streamChat({ system, messages, model: override, maxTokens }) {
      const model = override || config.ai.model || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:streamGenerateContent?alt=sse`;

      const body = {
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { maxOutputTokens: maxTokens ?? config.ai.maxTokens },
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
        throw new Error(`Gemini error (${res.status}): ${detail.slice(0, 300)}`);
      }

      yield* parseSSE(res.body, (json) =>
        // Gemini may split a single chunk across several parts; taking only
        // parts[0] silently drops text mid-answer.
        (json?.candidates?.[0]?.content?.parts ?? [])
          .map((p: { text?: string }) => p?.text ?? "")
          .join("")
      );
    },
  };
}
