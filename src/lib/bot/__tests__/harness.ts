import type { CustomerDetails } from "@/lib/ai/customer";
import type { Language } from "@/lib/i18n";
import { DEFAULT_BOT_CONFIG } from "@/data/marketing/bot";
import { runTurn, type BotRuntime, type Effect, type EffectResult, type Records, type ReplyRequest } from "../engine";
import { transcriptOf, type Outgoing } from "../render";
import type { BotConfig } from "../schema";
import { emptyBotState, type BotState } from "../types";

/**
 * A conversation with the engine and nothing else: no WhatsApp, no database,
 * no model. Replies, extraction and CRM writes are recorded so a test can
 * assert on exactly what the customer saw and what the team would receive.
 */
export class TestConversation {
  details: CustomerDetails = {};
  state: BotState = emptyBotState();
  records: Records = {};
  effects: Effect[] = [];
  sent: Outgoing[] = [];
  replies: ReplyRequest[] = [];
  optedOut = false;
  botPaused = false;
  turns = 0;
  now = new Date("2026-09-14T08:00:00Z"); // Monday 13:00 in Pakistan — inside business hours

  /** What the fake model answers. */
  aiReply: (request: ReplyRequest) => string = () => "Absolutely — here's how we can help with that.";
  /** What the fake extractor reads out of the latest message. */
  extractor: (text: string, known: CustomerDetails) => CustomerDetails = () => ({});

  private lastText = "";
  private leadCreated = false;

  constructor(
    readonly options: {
      phone?: string;
      profileName?: string;
      language?: Language;
      config?: BotConfig;
    } = {}
  ) {}

  get config(): BotConfig {
    return this.options.config ?? DEFAULT_BOT_CONFIG;
  }

  private runtime(outbox: Outgoing[]): BotRuntime {
    return {
      send: async (message) => {
        outbox.push(message);
        this.sent.push(message);
      },
      reply: async (request) => {
        this.replies.push(request);
        return this.aiReply(request);
      },
      extract: async (known) => this.extractor(this.lastText, known),
      translate: async (text, language) => `[${language}] ${text}`,
      summarize: async () => "Customer discussed their requirements.",
      commit: async (effect) => {
        this.effects.push(effect);
        return this.commit(effect);
      },
    };
  }

  private commit(effect: Effect): EffectResult {
    switch (effect.type) {
      case "sync": {
        const due = effect.force || Boolean(effect.details.name && effect.details.service);
        if (!due && !this.records.lead) return {};
        const created = !this.leadCreated;
        this.leadCreated = true;
        return { leadReference: "BM-LEAD-TEST", leadCreated: created };
      }
      case "quote":
        return { reference: "BM-QTE-TEST" };
      case "ticket":
        return { reference: "BM-TKT-TEST" };
      case "meeting":
        return effect.details.meetingDate ? { reference: "BM-MTG-TEST" } : {};
      case "handover":
        return { reference: effect.reference ?? "BM-TKT-HAND" };
      case "optOut":
        this.optedOut = true;
        return {};
      case "optIn":
        this.optedOut = false;
        return {};
      default:
        return {};
    }
  }

  private async turn(input: { kind: "text" | "reply"; text: string; replyId?: string }): Promise<Outgoing[]> {
    const outbox: Outgoing[] = [];
    this.lastText = input.text;
    const result = await runTurn(
      input,
      {
        config: this.config,
        language: this.options.language ?? "en",
        phone: this.options.phone ?? "+971501234567",
        profileName: this.options.profileName,
        isNewConversation: this.turns === 0,
        optedOut: this.optedOut,
        botPaused: this.botPaused,
        details: this.details,
        state: this.state,
        records: this.records,
        now: this.now,
      },
      this.runtime(outbox)
    );
    this.turns += 1;
    this.details = result.details;
    this.state = result.state;
    this.records = result.records;
    return outbox;
  }

  send(text: string): Promise<Outgoing[]> {
    return this.turn({ kind: "text", text });
  }

  tap(replyId: string, title = replyId): Promise<Outgoing[]> {
    return this.turn({ kind: "reply", text: title, replyId });
  }

  effectsOf<T extends Effect["type"]>(type: T): Array<Extract<Effect, { type: T }>> {
    return this.effects.filter((effect): effect is Extract<Effect, { type: T }> => effect.type === type);
  }

  events(): string[] {
    return this.effectsOf("event").map((effect) => effect.event);
  }
}

/** Every button and list-row id in a set of messages. */
export function ids(messages: Outgoing[]): string[] {
  return messages.flatMap((message) =>
    message.type === "buttons" ? message.buttons.map((b) => b.id) : message.type === "list" ? message.rows.map((r) => r.id) : []
  );
}

/** Every button and list-row title in a set of messages. */
export function titles(messages: Outgoing[]): string[] {
  return messages.flatMap((message) =>
    message.type === "buttons"
      ? message.buttons.map((b) => b.title)
      : message.type === "list"
        ? message.rows.map((r) => r.title)
        : []
  );
}

/** All message text, as the customer would read it. */
export function textOf(messages: Outgoing[]): string {
  return messages.map(transcriptOf).join("\n---\n");
}
