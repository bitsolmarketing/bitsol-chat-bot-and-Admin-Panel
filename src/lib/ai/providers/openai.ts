import { config } from "@/lib/config";
import type { AIProvider, ChatTurn } from "../types";

/**
 * OpenAI-compatible provider. Works with the OpenAI API and any service that
 * speaks the same `/chat/completions` streaming protocol — Azure OpenAI,
 * Together, OpenRouter, and local Ollama (via its OpenAI-compatible endpoint,
 * e.g. OPENAI_BASE_URL=http://localhost:11434/v1).
 *
 * `isOllama` only relaxes the API-key requirement (Ollama needs none).
 */
export function createOpenAIProvider(isOllama = false): AIProvider {
  const baseUrl = config.ai.openaiBaseUrl.replace(/\/$/, "");
  const apiKey = config.ai.openaiApiKey;

  if (!apiKey && !isOllama) {
    throw new Error(
      "OPENAI_API_KEY is not set. Configure it in .env or switch AI_PROVIDER."
    );
  }

  return {
    name: isOllama ? "ollama" : "openai",
    async *streamChat({ system, messages, model, maxTokens }) {
      const body = {
        model: model ?? config.ai.model,
        stream: true,
        max_tokens: maxTokens ?? config.ai.maxTokens,
        messages: [
          { role: "system", content: system },
          ...messages.map((m: ChatTurn) => ({ role: m.role, content: m.content })),
        ],
      };

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Upstream provider error (${res.status}): ${detail.slice(0, 300)}`);
      }

      yield* parseSSE(res.body, (json) => json?.choices?.[0]?.delta?.content ?? "");
    },
  };
}

/**
 * Parse a Server-Sent-Events response body, applying `extract` to each JSON
 * payload and yielding non-empty text chunks. Shared by OpenAI + Gemini.
 */
export async function* parseSSE(
  body: ReadableStream<Uint8Array>,
  extract: (json: any) => string
): AsyncGenerator<string, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]" || data === "") continue;
        try {
          const text = extract(JSON.parse(data));
          if (text) yield text;
        } catch {
          // Skip malformed keep-alive / partial frames.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
