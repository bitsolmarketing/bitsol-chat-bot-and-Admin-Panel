import type { Language } from "@/lib/i18n";

/**
 * =============================================================================
 *  WhatsApp growth assistant — shared vocabulary
 * =============================================================================
 *
 *  The names every part of the bot agrees on: intents, teams, lead
 *  temperatures, menu nodes, flows, actions and the per-conversation state.
 *
 *  Everything a person at BITSOL might want to change — wording, menus, prices,
 *  scoring weights — is *data* shaped by these types and lives in the chatbot
 *  configuration (`config.ts`), not in code. What stays in code is the set of
 *  things the engine knows how to *do*: the flow completions, the action kinds
 *  and the profile fields a question can fill.
 *
 *  Isomorphic: no server imports, so the admin console can use the same types.
 * =============================================================================
 */

/** Copy in each supported language. English is required; the rest fall back. */
export type Localized = { en: string } & Partial<Record<Exclude<Language, "en">, string>>;

// ---------------------------------------------------------------- Intents ---

export const BOT_INTENTS = [
  "LEAD_GENERATION",
  "SEO",
  "META_ADS",
  "GOOGLE_ADS",
  "TIKTOK_ADS",
  "SOCIAL_MEDIA",
  "WHATSAPP_CHATBOT",
  "WHATBOT_PRO",
  "AI_AUTOMATION",
  "AI_AGENT",
  "AI_SALES_AGENT",
  "AI_CUSTOMER_SUPPORT",
  "N8N_AUTOMATION",
  "CRM",
  "WEBSITE",
  "E_COMMERCE",
  "SOFTWARE",
  "MOBILE_APP",
  "BRANDING",
  "CONTENT",
  "PRICING",
  "QUOTE",
  "DEMO",
  "SUPPORT",
  "BILLING",
  "PARTNERSHIP",
  "CAREER",
  "GENERAL_INQUIRY",
  "HUMAN_HANDOVER",
  "ENTERPRISE",
] as const;

export type BotIntent = (typeof BOT_INTENTS)[number];

/** Intents that name something BITSOL sells, as opposed to an action or a request. */
export const SERVICE_INTENTS: readonly BotIntent[] = [
  "LEAD_GENERATION",
  "SEO",
  "META_ADS",
  "GOOGLE_ADS",
  "TIKTOK_ADS",
  "SOCIAL_MEDIA",
  "WHATSAPP_CHATBOT",
  "WHATBOT_PRO",
  "AI_AUTOMATION",
  "AI_AGENT",
  "AI_SALES_AGENT",
  "AI_CUSTOMER_SUPPORT",
  "N8N_AUTOMATION",
  "CRM",
  "WEBSITE",
  "E_COMMERCE",
  "SOFTWARE",
  "MOBILE_APP",
  "BRANDING",
  "CONTENT",
];

export function isServiceIntent(intent: BotIntent | undefined): boolean {
  return Boolean(intent && SERVICE_INTENTS.includes(intent));
}

// ------------------------------------------------------------------ Teams ---

export const TEAM_KEYS = [
  "SALES",
  "MARKETING",
  "AI_AUTOMATION",
  "WHATSAPP",
  "WEB_SOFTWARE",
  "ENTERPRISE",
  "SUPPORT",
  "BILLING",
] as const;

export type TeamKey = (typeof TEAM_KEYS)[number];

// ------------------------------------------------------------------ Leads ---

export const TEMPERATURES = ["COLD", "WARM", "HOT", "HIGH_PRIORITY"] as const;
export type Temperature = (typeof TEMPERATURES)[number];

export const TRAFFIC_SOURCES = [
  "META_ADS",
  "GOOGLE_ADS",
  "WEBSITE",
  "QR_CODE",
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "DIRECT_WHATSAPP",
  "REFERRAL",
  "CAMPAIGN",
  "BROADCAST",
  "OTHER",
] as const;

export type TrafficSourceKey = (typeof TRAFFIC_SOURCES)[number];

// ------------------------------------------------------------ Bot events ----

/** Values written to `bot_events.type`. */
export const BOT_EVENT_TYPES = [
  "CONVERSATION_STARTED",
  "MENU_OPENED",
  "SERVICE_VIEWED",
  "FLOW_STARTED",
  "FLOW_COMPLETED",
  "QUOTE_REQUESTED",
  "DEMO_REQUESTED",
  "CALL_REQUESTED",
  "GROWTH_PLAN_REQUESTED",
  "SETUP_REQUESTED",
  "PRICING_VIEWED",
  "LEAD_CAPTURED",
  "LEAD_HOT",
  "ENTERPRISE_DETECTED",
  "HANDOVER",
  "TICKET_CREATED",
  "FOLLOW_UP_SENT",
  "OPTED_OUT",
  "OPTED_IN",
  "AI_REPLY",
  "FALLBACK",
] as const;

export type BotEventType = (typeof BOT_EVENT_TYPES)[number];

// ---------------------------------------------------------------- Profile ---

/**
 * Profile fields a flow question can fill. Each is a key of `CustomerDetails`
 * (`lib/ai/customer.ts`), two of them handled specially:
 *
 *  - `meetingSlot` is answered when both `meetingDate` and `meetingTime` are known,
 *  - `name` is offered as a one-tap confirmation when WhatsApp supplied a profile name.
 */
export const STEP_FIELDS = [
  "name",
  "email",
  "company",
  "website",
  "country",
  "city",
  "businessType",
  "service",
  "subService",
  "businessGoal",
  "challenge",
  "requirements",
  "timeline",
  "budget",
  "customerType",
  "leadChannel",
  "monthlyLeads",
  "currentMarketing",
  "monthlyAdSpend",
  "platform",
  "features",
  "companySize",
  "project",
  "meetingSlot",
  "meetingMode",
] as const;

export type StepField = (typeof STEP_FIELDS)[number];

// ------------------------------------------------------------------ Menus ---

/** One option offered as a button or a list row. */
export interface ChoiceOption {
  /** Stored as the answer. Kept in English so the CRM reads the same for everyone. */
  value: string;
  title: Localized;
  description?: Localized;
  /** Catalogue slug this option implies, for service choices. */
  serviceSlug?: string;
  /** Intent this option implies, for service choices. */
  intent?: BotIntent;
  /** Timeline options: this one counts as an immediate start for scoring. */
  immediate?: boolean;
  /** Budget options: this one counts as a high budget for scoring. */
  highValue?: boolean;
  /** Team options: which team this routes to. */
  team?: TeamKey;
}

export type ActionRef =
  | { type: "menu"; node: string }
  | { type: "flow"; flow: FlowId; context?: FlowContext }
  | { type: "handover"; team?: TeamKey }
  | { type: "pricing" }
  /** A request the team acts on (a growth plan) without a flow of its own. */
  | {
      type: "request";
      event: BotEventType;
      nextAction: string;
      body: Localized;
      actions?: string[];
    }
  | { type: "say"; body: Localized; actions?: string[] }
  | { type: "proof"; section: ProofSection };

export interface ActionDefinition {
  /** Button title. WhatsApp shows at most 20 characters on a button, 24 in a list. */
  title: Localized;
  description?: Localized;
  do: ActionRef;
}

interface MenuNodeBase {
  title: Localized;
  description?: Localized;
}

/** A list of further nodes. */
export interface MenuListNode extends MenuNodeBase {
  kind: "menu";
  body: Localized;
  children: string[];
  /** Intent and team a customer inside this menu is most likely about. */
  intent?: BotIntent;
  team?: TeamKey;
}

/** A service explained in five parts, followed by next-step buttons. */
export interface ServiceNode extends MenuNodeBase {
  kind: "service";
  intent: BotIntent;
  team: TeamKey;
  serviceSlug?: string;
  subService?: string;
  /** What it does · who needs it · benefits · example use cases. */
  body: Localized;
  actions: string[];
}

/** A shortcut straight into a flow, or any other action. */
export interface ActionNode extends MenuNodeBase {
  kind: "action";
  do: ActionRef;
  intent?: BotIntent;
  team?: TeamKey;
}

export type MenuNode = MenuListNode | ServiceNode | ActionNode;

// ------------------------------------------------------------------ Flows ---

export const FLOW_IDS = [
  "lead_generation",
  "growth",
  "quote",
  "project_brief",
  "support",
  "demo",
  "strategy_call",
  "whatbot_setup",
  "enterprise_requirements",
] as const;

export type FlowId = (typeof FLOW_IDS)[number];

/** What happens when a flow's questions are answered. */
export const FLOW_COMPLETIONS = ["lead", "quote", "brief", "ticket", "meeting", "handover"] as const;
export type FlowCompletion = (typeof FLOW_COMPLETIONS)[number];

/** Where a set of choice options comes from when it is not written inline. */
export const OPTION_SOURCES = ["services", "budgets", "countries", "timelines"] as const;
export type OptionSource = (typeof OPTION_SOURCES)[number];

export interface FlowStep {
  field: StepField;
  ask: Localized;
  kind: "choice" | "text";
  options?: ChoiceOption[];
  optionsFrom?: OptionSource;
  /** Offer a Skip button and move on without an answer. */
  optional?: boolean;
  /** Only ask when the flow's goal is one of these. */
  goals?: string[];
  /** A one-tap answer offered under a text question, e.g. "No website yet". */
  quickAnswers?: ChoiceOption[];
}

export interface FlowDefinition {
  title: Localized;
  intro?: Localized;
  intent?: BotIntent;
  team: TeamKey;
  completion: FlowCompletion;
  /** Recorded when the flow starts — QUOTE_REQUESTED, DEMO_REQUESTED… */
  event?: BotEventType;
  /** CRM next action for the team once the flow completes. */
  nextAction: string;
  /** Hand the finished flow to the team with a full summary, e.g. enterprise requirements. */
  escalate?: boolean;
  steps: FlowStep[];
  done: { body: Localized; actions: string[] };
}

/** What the flow was started *about* — set by the menu or message that opened it. */
export interface FlowContext {
  intent?: BotIntent;
  team?: TeamKey;
  serviceSlug?: string;
  subService?: string;
  goal?: string;
  supportCategory?: "TECHNICAL" | "BILLING" | "SALES" | "COMPLAINT" | "GENERAL";
  /** Shown on the ticket subject for support flows, e.g. "WhatBot support". */
  topicLabel?: string;
}

// ------------------------------------------------------------------ Proof ---

export const PROOF_SECTIONS = [
  "caseStudies",
  "results",
  "websites",
  "aiProjects",
  "whatsappProjects",
  "campaigns",
  "reviews",
  "industries",
] as const;

export type ProofSection = (typeof PROOF_SECTIONS)[number];

/**
 * One piece of verified work. Nothing reaches a customer from here unless a
 * person at BITSOL entered it — the assistant never makes up clients, figures
 * or testimonials, so an empty section says so honestly instead.
 */
export interface ProofItem {
  title: string;
  summary: string;
  link?: string;
}

// ------------------------------------------------------------------ State ---

export interface ActiveFlow {
  id: FlowId;
  context: FlowContext;
  /** The field the last question asked for, when the customer has not answered it. */
  pending?: StepField;
  /** How many times the pending question has been asked without an answer. */
  retries: number;
  /** Optional fields the customer chose to skip. */
  skipped: StepField[];
  /** A meeting time the customer gave in words the extractor could not date. */
  meetingNote?: string;
  startedAt: string;
}

/**
 * Everything the bot remembers about a conversation besides the customer's
 * details, stored under `conversations.capture.bot`.
 */
export interface BotState {
  flow?: ActiveFlow;
  /** The last list shown, so "More options" knows where to continue. */
  menu?: { node: string; page: number };
  /** The service or request this conversation is about. */
  intent?: BotIntent;
  team?: TeamKey;
  subService?: string;
  signals: {
    wantsDemo?: boolean;
    wantsCall?: boolean;
    wantsQuote?: boolean;
    enterprise?: boolean;
  };
  score?: { value: number; temperature: Temperature; reasons: string[] };
  /** `silent`: the team was alerted but the customer was not told a person took over. */
  handover?: { team: TeamKey; reference?: string; at: string; reason: string; silent?: boolean };
  /** Consecutive turns the assistant could not answer. */
  fallbacks: number;
  /** The last menus, services and flows the customer chose, oldest first. */
  trail: string[];
  /** Hot-lead alerts already sent, so each band is announced once. */
  alerted?: Temperature[];
}

export function emptyBotState(): BotState {
  return { signals: {}, fallbacks: 0, trail: [] };
}

/** Narrow the untyped JSON stored on the conversation back to a `BotState`. */
export function readBotState(value: unknown): BotState {
  const state = emptyBotState();
  if (!value || typeof value !== "object") return state;
  const raw = value as Partial<BotState>;
  return {
    ...state,
    ...raw,
    signals: { ...(raw.signals ?? {}) },
    fallbacks: typeof raw.fallbacks === "number" ? raw.fallbacks : 0,
    trail: Array.isArray(raw.trail) ? raw.trail.filter((entry) => typeof entry === "string").slice(-12) : [],
  };
}
