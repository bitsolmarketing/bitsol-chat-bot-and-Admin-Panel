/** A single conversational turn passed to a provider. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatOptions {
  system: string;
  messages: ChatTurn[];
  /** Overrides AI_MODEL — the details extractor can run on a smaller model. */
  model?: string;
  /** Overrides AI_MAX_TOKENS. */
  maxTokens?: number;
  /** Set false to skip AI_THINKING for a call that only needs to return JSON. */
  thinking?: boolean;
}

/**
 * Provider-agnostic chat interface. Every backend (Claude, OpenAI-compatible,
 * Ollama, Gemini) implements `streamChat` as an async generator of text chunks,
 * so the API route can stream tokens to the browser identically regardless of
 * which provider is configured.
 */
export interface AIProvider {
  readonly name: string;
  streamChat(options: StreamChatOptions): AsyncGenerator<string, void, unknown>;
}
