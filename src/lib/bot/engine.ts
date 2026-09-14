import type { Language } from "@/lib/i18n";
import { asksQuestion } from "@/lib/ai/intents";
import type { CustomerDetails, CustomerIntent } from "@/lib/ai/customer";
import { mergeDetails } from "@/lib/ai/customer";
import { countryByName, detectCountry } from "./country";
import {
  classify,
  detectEnterprise,
  detectIndustry,
  isFrustrated,
  isGreetingOnly,
  isMenuRequest,
  isOptIn,
  isOptOut,
  isQuestion,
  wantsHuman,
  type Classification,
} from "./detect";
import { isOpen, nextOpening } from "./hours";
import { offer, type Choice, type Outgoing } from "./render";
import { scoreLead, warmedUp, type LeadScore } from "./scoring";
import type { BotConfig } from "./schema";
import { handoverSummary, plainBrief, projectBrief, type HandoverSummary } from "./summary";
import { fill, hasOwn, pick, wordCount, type TemplateValues } from "./text";
import {
  isServiceIntent,
  type ActionRef,
  type ActiveFlow,
  type BotEventType,
  type BotIntent,
  type BotState,
  type ChoiceOption,
  type FlowContext,
  type FlowId,
  type ProofSection,
  type StepField,
  type Localized,
  type TeamKey,
  type Temperature,
} from "./types";

/**
 * =============================================================================
 *  WhatsApp growth assistant — conversation engine
 * =============================================================================
 *
 *  One customer message in, the replies and CRM effects out. The engine decides
 *  *what happens*; a `BotRuntime` does the I/O — sending to WhatsApp, calling
 *  the model, writing the CRM. Swapping the runtime is how the same engine
 *  runs behind the webhook, inside the admin simulator, and under tests with
 *  no network or database at all.
 *
 *  Order of precedence for a message:
 *
 *    1. Opt-out / opt-in                 — always honoured first
 *    2. A person is handling the thread  — stay silent if configured to
 *    3. Button and list taps             — menus, actions, flow answers
 *    4. "menu", greetings                — back to the top
 *    5. Upset, or asking for a person    — hand over with a full summary
 *    6. Enterprise signals               — enterprise mode
 *    7. An open flow                     — take the answer, ask the next thing
 *    8. Natural language                 — quote/demo/support requests start
 *                                          flows; everything else gets a
 *                                          representative's answer and the
 *                                          buttons that fit its intent
 *
 *  Menus never trap anyone: free text works at every point, including in the
 *  middle of a flow, where a question is answered before the flow resumes.
 * =============================================================================
 */

// ------------------------------------------------------------------ Types ---

export interface InboundTurn {
  kind: "text" | "reply" | "media" | "location" | "unsupported";
  /** What the customer wrote — or, for a tap, the title of what they tapped. */
  text: string;
  replyId?: string;
}

export interface Records {
  lead?: string;
  meeting?: string;
  ticket?: string;
}

export interface TurnContext {
  config: BotConfig;
  language: Language;
  /** The number the customer is writing from, `+923001234567`. */
  phone: string;
  profileName?: string;
  isNewConversation: boolean;
  optedOut: boolean;
  /** A person has taken the thread from the console. */
  botPaused: boolean;
  details: CustomerDetails;
  state: BotState;
  records: Records;
  now: Date;
}

export interface ReplyRequest {
  intent: BotIntent;
  classification: Classification;
  /** Service explainers relevant to this message, authoritative for the answer. */
  knowledge: Array<{ title: string; body: string }>;
  /** A flow question still waiting on an answer — the reply must not ask anything else. */
  pendingQuestion?: string;
  details: CustomerDetails;
  state: BotState;
}

export type Effect =
  | {
      type: "event";
      event: BotEventType;
      intent?: string;
      team?: TeamKey;
      value?: string;
      metadata?: Record<string, unknown>;
    }
  | {
      /** Keep the conversation's capture and lead current; create the lead when due. */
      type: "sync";
      details: CustomerDetails;
      state: BotState;
      score: LeadScore;
      /** Create the lead even if the conversational criteria are not met — a flow finished. */
      force?: boolean;
      nextAction?: string;
      team?: TeamKey;
    }
  | {
      type: "quote";
      details: CustomerDetails;
      state: BotState;
      score: LeadScore;
      title: string;
      nextAction: string;
      team: TeamKey;
    }
  | {
      type: "ticket";
      details: CustomerDetails;
      state: BotState;
      context: FlowContext;
      team: TeamKey;
      /** Also hand the conversation to the team (billing and technical issues). */
      handover?: HandoverSummary;
    }
  | {
      type: "meeting";
      details: CustomerDetails;
      state: BotState;
      score: LeadScore;
      topic: string;
      note?: string;
      nextAction: string;
      team: TeamKey;
    }
  | {
      type: "handover";
      details: CustomerDetails;
      state: BotState;
      score: LeadScore;
      summary: HandoverSummary;
      /** Tell the team without telling the customer they were transferred. */
      silent: boolean;
      /** Reuse this reference instead of opening a new ticket. */
      reference?: string;
    }
  | { type: "alert"; details: CustomerDetails; state: BotState; score: LeadScore; summary: HandoverSummary }
  | { type: "optOut" }
  | { type: "optIn" };

export interface EffectResult {
  reference?: string;
  leadReference?: string;
  /** True when this effect created the lead rather than updating it. */
  leadCreated?: boolean;
}

export interface BotRuntime {
  send(message: Outgoing): Promise<void>;
  /** The representative's answer, or "" when the model is unavailable. */
  reply(request: ReplyRequest): Promise<string>;
  /** Details the transcript — including the message being handled — adds to `known`. */
  extract(known: CustomerDetails): Promise<CustomerDetails>;
  /** Faithful translation of fixed copy; returns the input when unavailable. */
  translate(text: string, language: Language): Promise<string>;
  /** A few plain sentences summarising the conversation for a handover. */
  summarize(): Promise<string>;
  commit(effect: Effect): Promise<EffectResult>;
}

export interface TurnResult {
  details: CustomerDetails;
  state: BotState;
  records: Records;
}

// ---------------------------------------------------------------- Helpers ---

const GOAL_LABELS: Record<string, string> = {
  leads: "Generate more leads",
  sales: "Increase sales",
  advertising: "Improve advertising",
  google: "Get more Google traffic",
  social: "Grow social media",
  automation: "Automate the business",
  website: "Improve the website",
  strategy: "Build a growth strategy",
};

const UNSURE_REPLY =
  /(not sure|i don'?t have (that|this|enough) information|can'?t (answer|help with) that|connect you with (our|the) team|team (se|say) rabta|mujhe (is|iss) ka (ilm|pata) nahi)/i;

const LEGACY_IDS: Record<string, string> = {
  "act:menu": "a:main_menu",
  "act:human": "a:talk_to_expert",
  "act:capture": "a:get_quote",
  "act:services": "a:main_menu",
};

/** Run one customer message through the assistant. */
export async function runTurn(input: InboundTurn, context: TurnContext, runtime: BotRuntime): Promise<TurnResult> {
  const turn = new Turn(input, context, runtime);
  await turn.run();
  return { details: turn.details, state: turn.state, records: turn.records };
}

class Turn {
  details: CustomerDetails;
  state: BotState;
  records: Records;

  private readonly config: BotConfig;
  private readonly language: Language;
  private synced = false;
  private readonly startTemperature: Temperature | undefined;

  constructor(
    private readonly input: InboundTurn,
    private readonly context: TurnContext,
    private readonly runtime: BotRuntime
  ) {
    this.config = context.config;
    this.language = context.language;
    this.details = { ...context.details };
    this.state = structuredClone(context.state);
    this.records = { ...context.records };
    this.startTemperature = context.state.score?.temperature;
  }

  // ------------------------------------------------------------ Top level --

  async run(): Promise<void> {
    const { input, context } = this;
    const text = input.text.trim();
    const typed = input.kind === "text" || input.kind === "location";

    // 1. Subscription controls come before everything, even a paused bot.
    if (typed && isOptOut(text)) {
      await this.runtime.commit({ type: "optOut" });
      await this.event("OPTED_OUT");
      this.state.flow = undefined;
      if (!context.botPaused) await this.say(pick(this.config.messages.optOut, this.language));
      return;
    }
    if (context.optedOut && typed && (isOptIn(text) || isMenuRequest(text) || isGreetingOnly(text))) {
      await this.runtime.commit({ type: "optIn" });
      await this.event("OPTED_IN");
    }

    // 2. A person is replying from the console, or the team asked for silence
    //    after a handover: the transcript is kept, the assistant says nothing.
    if (context.botPaused) return;
    if (this.state.handover && !this.state.handover.silent && this.config.handover.pauseBot && !(typed && isMenuRequest(text))) return;

    if (input.kind === "media" && !text) {
      await this.say(pick(this.config.messages.media, this.language));
      return;
    }
    if (input.kind === "unsupported" || (!text && !input.replyId)) {
      await this.openNode(this.config.menu.root, 0, { welcome: context.isNewConversation });
      return;
    }

    // 3. Taps.
    if (input.replyId) {
      await this.handleReply(LEGACY_IDS[input.replyId] ?? input.replyId);
      await this.finish(true);
      return;
    }

    // 4. Back to the top.
    if (isMenuRequest(text)) {
      this.state.flow = undefined;
      await this.openNode(this.config.menu.root, 0);
      return;
    }
    if (isGreetingOnly(text)) {
      if (this.state.flow?.pending) {
        await this.askNext(pick(this.config.messages.resumeFlow, this.language));
      } else {
        await this.openNode(this.config.menu.root, 0, { welcome: true });
      }
      return;
    }

    // 5. People first when it matters.
    if (isFrustrated(text, this.config.handover.frustrationKeywords)) {
      this.state.flow = undefined;
      await this.handover(this.teamFor(), "Customer is upset and needs a person");
      await this.finish(true);
      return;
    }

    const classification = classify(text, this.config);

    if (wantsHuman(text)) {
      this.state.flow = undefined;
      const team = classification.service
        ? this.config.intents[classification.service]?.team
        : this.state.team ?? (this.state.intent ? this.config.intents[this.state.intent]?.team : undefined);
      if (team) {
        await this.handover(team, "Customer asked to speak to a person");
      } else {
        await this.openNode("expert", 0);
      }
      await this.finish(true);
      return;
    }

    // Everything below reads what the customer said.
    await this.learn(text);

    // 6. Enterprise mode, once per conversation.
    if (!this.state.signals.enterprise && this.state.flow?.id !== "enterprise_requirements") {
      const signal = detectEnterprise(text, this.details.companySize, this.config.enterprise);
      if (signal.enterprise) {
        await this.enterEnterpriseMode(signal.reason ?? "enterprise signals");
        await this.finish(true);
        return;
      }
    }

    // 7. An open flow takes the message as an answer.
    if (this.state.flow) {
      await this.continueFlow(text, classification);
      await this.finish(true);
      return;
    }

    // 8. Natural language.
    await this.converse(text, classification);
    await this.finish(true);
  }

  // ---------------------------------------------------------------- Taps ---

  private async handleReply(id: string): Promise<void> {
    const [kind, first, second] = id.split(":");

    switch (kind) {
      case "n":
        return this.openNode(first, Number(second ?? 0) || 0);
      case "a":
        return this.runAction(first);
      case "c":
      case "q":
        return this.answerChoice(first as StepField, Number(second), kind === "q");
      case "p":
        return this.askNext(undefined, Number(second) || 0);
      case "s":
        return this.skip(first as StepField);
      case "y":
        return this.confirmName(true);
      case "o":
        return this.confirmName(false);
      case "dept":
        return this.openNode(this.config.menu.root, 0);
      default:
        await this.say(pick(this.config.messages.unknownButton, this.language));
        return this.openNode(this.config.menu.root, 0);
    }
  }

  private async openNode(nodeId: string, pageNumber: number, options: { welcome?: boolean } = {}): Promise<void> {
    const { config, language } = this;
    const node = config.menu.nodes[nodeId];
    if (!node) {
      await this.say(pick(config.messages.unknownButton, language));
      if (nodeId !== config.menu.root) await this.openNode(config.menu.root, 0);
      return;
    }

    if (node.intent) this.setIntent(node.intent);
    if (node.team) this.state.team = node.team;

    if (node.kind === "menu") {
      this.state.menu = { node: nodeId, page: pageNumber };
      if (nodeId !== config.menu.root) this.remember(pick(node.title, "en"));

      const children = node.children
        .map((child) => [child, config.menu.nodes[child]] as const)
        .filter(([, child]) => Boolean(child))
        .map(([child, entry]) => ({
          id: `n:${child}`,
          title: pick(entry!.title, language),
          description: entry!.description ? pick(entry!.description, language) : undefined,
        }));
      if (nodeId !== config.menu.root) {
        children.push({ id: "a:main_menu", title: pick(config.messages.mainMenu, language), description: undefined });
      }

      const body = options.welcome ? pick(config.messages.welcome, language) : pick(node.body, language);
      await this.event("MENU_OPENED", { value: nodeId });
      await this.offer(this.fillCopy(body), children, {
        pageId: (next) => `n:${nodeId}:${next}`,
        page: pageNumber,
        forceList: true,
      });
      return;
    }

    if (node.kind === "service") {
      this.setIntent(node.intent);
      this.state.team = node.team;
      if (node.serviceSlug) this.details.service = node.serviceSlug;
      if (node.subService) {
        this.details.subService = node.subService;
        this.state.subService = node.subService;
      }
      this.remember(pick(node.title, "en"));
      await this.event("SERVICE_VIEWED", { value: nodeId, intent: node.intent, team: node.team });

      const body = await this.localise(node.body);
      await this.offer(this.fillCopy(body), this.actionChoices(node.actions), { footer: pick(config.messages.footer, language) });
      return;
    }

    this.remember(pick(node.title, "en"));
    await this.runRef(node.do, { intent: node.intent, team: node.team });
  }

  private async runAction(key: string): Promise<void> {
    const action = this.config.actions[key];
    if (!action) {
      await this.say(pick(this.config.messages.unknownButton, this.language));
      return this.openNode(this.config.menu.root, 0);
    }
    if (key !== "main_menu") this.remember(pick(action.title, "en"));
    return this.runRef(action.do, {});
  }

  private async runRef(ref: ActionRef, hint: { intent?: BotIntent; team?: TeamKey }): Promise<void> {
    switch (ref.type) {
      case "menu":
        if (ref.node === this.config.menu.root) this.state.flow = undefined;
        return this.openNode(ref.node, 0);

      case "flow":
        return this.startFlow(ref.flow, {
          ...ref.context,
          intent: ref.context?.intent ?? hint.intent ?? this.currentServiceIntent(),
          team: ref.context?.team ?? hint.team,
        });

      case "handover": {
        const team = ref.team ?? hint.team ?? this.teamFor();
        return this.handover(team, `Customer asked to talk to ${this.config.teams[team]?.label ?? team}`);
      }

      case "pricing":
        return this.showPricing(hint.intent ?? this.currentServiceIntent());

      case "request": {
        await this.event(ref.event, { intent: this.state.intent });
        await this.sync({ force: true, nextAction: ref.nextAction });
        await this.offer(this.fillCopy(pick(ref.body, this.language)), this.actionChoices(ref.actions ?? []));
        return;
      }

      case "say":
        return this.offer(this.fillCopy(pick(ref.body, this.language)), this.actionChoices(ref.actions ?? []));

      case "proof":
        return this.showProof(ref.section);
    }
  }

  // ------------------------------------------------------ Natural language --

  private async converse(text: string, classification: Classification): Promise<void> {
    const { config } = this;
    const { request, service } = classification;

    if (service) this.setIntent(service);
    if (classification.primary !== "GENERAL_INQUIRY") this.details.topic = classification.primary;

    // Requests that have a flow of their own start it straight away.
    if (request === "QUOTE") {
      return this.startFlow("quote", this.contextFor(service));
    }
    if (request === "DEMO") {
      return this.startFlow("demo", this.contextFor(service ?? "WHATBOT_PRO"));
    }
    // The message describing the problem is the ticket description.
    if (request === "BILLING") {
      return this.startFlow(
        "support",
        { intent: "BILLING", supportCategory: "BILLING", topicLabel: "Billing", team: "BILLING" },
        wordCount(text) >= 4 ? text : undefined
      );
    }
    if (request === "SUPPORT" && !service) {
      return this.startFlow(
        "support",
        { intent: "SUPPORT", supportCategory: "TECHNICAL", topicLabel: "Support request" },
        wordCount(text) >= 4 ? text : undefined
      );
    }

    const intent = service ?? request ?? this.state.intent ?? "GENERAL_INQUIRY";
    const reply = await this.runtime.reply({
      intent,
      classification,
      knowledge: this.knowledgeFor(intent),
      details: this.details,
      state: this.state,
    });

    if (!reply.trim()) {
      this.state.fallbacks += 1;
      await this.event("FALLBACK", { intent });
      await this.offer(pick(config.messages.busy, this.language), this.actionChoices(["talk_to_expert", "main_menu"]));
      return;
    }

    this.state.fallbacks = UNSURE_REPLY.test(reply) ? this.state.fallbacks + 1 : 0;
    await this.event("AI_REPLY", { intent });

    if (this.state.fallbacks >= config.handover.lowConfidenceTurns) {
      this.state.fallbacks = 0;
      await this.say(reply);
      await this.offer(pick(config.messages.lowConfidence, this.language), this.actionChoices(["talk_to_expert", "main_menu"]));
      return;
    }

    if (asksQuestion(reply)) {
      await this.say(reply);
      return;
    }

    const pricingActions =
      request === "PRICING" ? config.pricing.find((entry) => entry.intents.includes(intent))?.actions : undefined;
    const actions = pricingActions ?? config.intents[intent]?.actions ?? config.intents.GENERAL_INQUIRY?.actions ?? [];
    await this.offer(reply, this.actionChoices(actions));
  }

  private knowledgeFor(intent: BotIntent): ReplyRequest["knowledge"] {
    const nodeId = this.config.intents[intent]?.node;
    const node = nodeId ? this.config.menu.nodes[nodeId] : undefined;
    if (!node || node.kind !== "service") return [];
    return [{ title: pick(node.title, "en"), body: this.fillCopy(node.body.en) }];
  }

  // ---------------------------------------------------------------- Flows ---

  /** `issue` is the customer's own description of a problem, for a support flow. */
  private async startFlow(id: FlowId, context: FlowContext, issue?: string): Promise<void> {
    const flow = this.config.flows[id];
    if (!flow) return this.openNode(this.config.menu.root, 0);

    // A ticket describes this problem, not the project discussed earlier.
    if (flow.completion === "ticket") this.details.requirements = issue;

    const intent = context.intent ?? flow.intent;
    if (intent) this.setIntent(intent);
    this.state.team = context.team ?? flow.team;

    if (context.serviceSlug) this.details.service = context.serviceSlug;
    if (context.subService) {
      this.details.subService = context.subService;
      this.state.subService = context.subService;
    }
    if (context.goal && !this.details.businessGoal && GOAL_LABELS[context.goal]) {
      this.details.businessGoal = GOAL_LABELS[context.goal];
    }
    if (context.supportCategory) {
      this.details.intent = "SUPPORT";
      this.details.supportCategory = context.supportCategory;
    }
    if (id === "demo") this.state.signals.wantsDemo = true;
    if (id === "strategy_call") this.state.signals.wantsCall = true;
    if (id === "quote") this.state.signals.wantsQuote = true;

    this.state.flow = {
      id,
      context: { ...context, intent },
      retries: 0,
      skipped: [],
      startedAt: this.context.now.toISOString(),
    };
    this.remember(pick(flow.title, "en"));

    await this.event("FLOW_STARTED", { value: id, intent, team: this.state.team });
    if (flow.event && flow.event !== "TICKET_CREATED") await this.event(flow.event, { value: id, intent });

    await this.askNext(flow.intro ? pick(flow.intro, this.language) : undefined);
  }

  private currentFlow() {
    const active = this.state.flow;
    const definition = active ? this.config.flows[active.id] : undefined;
    return active && definition ? { active, definition } : null;
  }

  /** The next unanswered step of the open flow, or null when it is complete. */
  private nextStep() {
    const current = this.currentFlow();
    if (!current) return null;
    const { active, definition } = current;
    for (const step of definition.steps) {
      if (step.goals && !step.goals.includes(active.context.goal ?? "")) continue;
      if (active.skipped.includes(step.field)) continue;
      if (this.known(step.field, active)) continue;
      return step;
    }
    return null;
  }

  private known(field: StepField, active: ActiveFlow): boolean {
    const d = this.details;
    switch (field) {
      case "meetingSlot":
        return Boolean((d.meetingDate && d.meetingTime) || active.meetingNote);
      case "service":
        return Boolean(d.service || d.subService);
      default:
        return Boolean(d[field as keyof CustomerDetails]);
    }
  }

  /** Ask the open flow's next question, or complete the flow. */
  private async askNext(prefix?: string, pageNumber = 0): Promise<void> {
    const current = this.currentFlow();
    if (!current) return this.openNode(this.config.menu.root, 0);

    const step = this.nextStep();
    if (!step) return this.completeFlow();

    const { active } = current;
    if (active.pending !== step.field) active.retries = 0;
    active.pending = step.field;

    const { messages } = this.config;
    const question = pick(step.ask, this.language);
    const lead = (body: string) =>
      prefix ? (prefix.includes("{question}") ? fill(prefix, { question: body }) : `${prefix}\n\n${body}`) : body;

    // A WhatsApp profile name is offered rather than asked for.
    if (step.field === "name" && this.context.profileName) {
      const confirm = fill(pick(messages.nameConfirm, this.language), { name: this.context.profileName });
      await this.offer(lead(confirm), [
        { id: "y:name", title: pick(messages.nameConfirmYes, this.language) },
        { id: "o:name", title: pick(messages.nameConfirmOther, this.language) },
      ]);
      return;
    }

    const skip = step.optional ? [{ id: `s:${step.field}`, title: pick(messages.skip, this.language) }] : [];

    if (step.kind === "choice") {
      const choices = this.optionsFor(step).map((option, index) => ({
        id: `c:${step.field}:${index}`,
        title: pick(option.title, this.language),
        description: option.description ? pick(option.description, this.language) : undefined,
      }));
      await this.offer(lead(question), [...choices, ...skip], {
        pageId: (next) => `p:${step.field}:${next}`,
        page: pageNumber,
      });
      return;
    }

    const quick = (step.quickAnswers ?? []).map((option, index) => ({
      id: `q:${step.field}:${index}`,
      title: pick(option.title, this.language),
    }));
    await this.offer(lead(question), [...quick, ...skip]);
  }

  private optionsFor(step: { options?: ChoiceOption[]; optionsFrom?: string }): ChoiceOption[] {
    if (step.options?.length) return step.options;
    const { options, countries } = this.config;
    switch (step.optionsFrom) {
      case "services":
        return options.services;
      case "timelines":
        return options.timelines;
      case "budgets": {
        const country = countryByName(this.details.country, countries);
        return country?.currency === "PKR" ? options.budgets.PKR : options.budgets.USD;
      }
      case "countries":
        return [
          ...countries.map((country) => ({ value: country.name, title: { en: `${country.flag} ${country.name}` } })),
          { value: "Other", title: { en: "🌍 Other", ur_roman: "🌍 Koi aur", ur: "🌍 کوئی اور" } },
        ];
      default:
        return [];
    }
  }

  /** A tapped option — or quick answer — for the question the flow is waiting on. */
  private async answerChoice(field: StepField, index: number, quick: boolean): Promise<void> {
    const current = this.currentFlow();
    const step = current?.definition.steps.find(
      (candidate) =>
        candidate.field === field &&
        (!candidate.goals || candidate.goals.includes(current.active.context.goal ?? ""))
    );
    const option = step ? (quick ? step.quickAnswers ?? [] : this.optionsFor(step))[index] : undefined;

    if (!current || !step || !option) {
      await this.say(pick(this.config.messages.unknownButton, this.language));
      return this.openNode(this.config.menu.root, 0);
    }

    this.apply(field, option.value, option);
    await this.askNext();
  }

  private async skip(field: StepField): Promise<void> {
    const current = this.currentFlow();
    if (!current) return this.openNode(this.config.menu.root, 0);
    if (!current.active.skipped.includes(field)) current.active.skipped.push(field);
    await this.askNext();
  }

  private async confirmName(yes: boolean): Promise<void> {
    const current = this.currentFlow();
    if (!current) return this.openNode(this.config.menu.root, 0);
    if (yes && this.context.profileName) {
      this.details.name = this.context.profileName;
      return this.askNext();
    }
    current.active.pending = "name";
    await this.say(pick(current.definition.steps.find((step) => step.field === "name")?.ask ?? { en: "May I have your name?" }, this.language));
  }

  /** A typed message while a flow is open. */
  private async continueFlow(text: string, classification: Classification): Promise<void> {
    const current = this.currentFlow()!;
    const { active } = current;
    const field = active.pending;
    const step = field
      ? current.definition.steps.find(
          (candidate) => candidate.field === field && (!candidate.goals || candidate.goals.includes(active.context.goal ?? ""))
        )
      : undefined;

    // A new quote or demo request replaces what was in progress.
    if (classification.request === "QUOTE" && active.id !== "quote") {
      return this.startFlow("quote", this.contextFor(classification.service));
    }
    if (classification.request === "DEMO" && active.id !== "demo") {
      return this.startFlow("demo", this.contextFor(classification.service ?? "WHATBOT_PRO"));
    }

    if (!field || !step || this.known(field, active)) {
      // The customer answered (possibly several questions at once), or there
      // was no question pending.
      return this.askNext();
    }

    // A question in the middle of a flow gets a real answer, then the flow resumes.
    if (isQuestion(text) || (classification.request === "PRICING" && wordCount(text) > 2)) {
      const intent = classification.service ?? this.state.intent ?? "GENERAL_INQUIRY";
      const reply = await this.runtime.reply({
        intent,
        classification,
        knowledge: this.knowledgeFor(intent),
        pendingQuestion: pick(step.ask, "en"),
        details: this.details,
        state: this.state,
      });
      if (reply.trim()) {
        await this.say(reply);
        await this.event("AI_REPLY", { intent, value: `during:${active.id}` });
      }
      return this.askNext(pick(this.config.messages.resumeFlow, this.language));
    }

    if (step.kind === "choice") {
      const options = this.optionsFor(step);
      const matched = matchOption(text, options, this.language);
      if (matched) {
        this.apply(field, matched.value, matched);
        return this.askNext();
      }
      if (field === "service" && classification.service) {
        const byIntent = options.find((option) => option.intent === classification.service);
        this.apply(field, byIntent?.value ?? text, byIntent);
        return this.askNext();
      }
      // A short free-text answer is still an answer: "Qatar", "about $2k".
      if (wordCount(text) <= 8) {
        this.apply(field, text);
        return this.askNext();
      }
      return this.retry(step.ask);
    }

    // Text questions.
    if (field === "meetingSlot") {
      active.retries += 1;
      if (active.retries < 2) {
        await this.say(pick(this.config.messages.meetingSlotRetry, this.language));
        return;
      }
      // The extractor could not turn it into a date; keep their words for the team.
      active.meetingNote = text;
      return this.askNext();
    }

    const value = acceptText(field, text);
    if (value) {
      this.apply(field, value);
      return this.askNext();
    }
    return this.retry(step.ask);
  }

  private async retry(ask: { en: string }): Promise<void> {
    const active = this.state.flow!;
    active.retries += 1;
    if (active.retries >= 3 && active.pending) {
      // Three misses: move on rather than loop.
      active.skipped.push(active.pending);
      return this.askNext();
    }
    await this.say(fill(pick(this.config.messages.askAgain, this.language), { question: pick(ask, this.language) }));
  }

  private apply(field: StepField, value: string, option?: ChoiceOption): void {
    const d = this.details;
    switch (field) {
      case "service":
        if (option?.serviceSlug) d.service = option.serviceSlug;
        if (!this.state.flow?.context.subService) d.subService = option?.value ?? value;
        if (option?.intent) this.setIntent(option.intent);
        return;
      case "meetingMode":
        if (["OFFICE", "ZOOM", "GOOGLE_MEET", "WHATSAPP"].includes(value)) {
          d.meetingMode = value as CustomerDetails["meetingMode"];
        }
        return;
      case "meetingSlot":
        return;
      case "companySize":
        d.companySize = value;
        return;
      default:
        (d as Record<string, string>)[field] = value;
    }
  }

  private async completeFlow(): Promise<void> {
    const current = this.currentFlow()!;
    const { active, definition } = current;
    const { id, context } = active;
    const team = context.team ?? definition.team;
    this.state.flow = undefined;

    const intent: CustomerIntent =
      definition.completion === "ticket" ? "SUPPORT" : definition.completion === "meeting" ? "CONSULTATION" : "PROJECT";
    this.details.intent = intent;

    const score = this.score();
    let reference: string | undefined;
    let brief = "";

    switch (definition.completion) {
      case "lead": {
        const result = await this.sync({ force: true, nextAction: definition.nextAction, team });
        reference = result.leadReference;
        break;
      }
      case "quote": {
        await this.sync({ force: true, nextAction: definition.nextAction, team });
        const result = await this.runtime.commit({
          type: "quote",
          details: this.details,
          state: this.state,
          score,
          title: this.serviceLabel() ?? "Project quotation",
          nextAction: definition.nextAction,
          team,
        });
        reference = result.reference ?? this.records.lead;
        break;
      }
      case "brief": {
        brief = projectBrief(this.details, id);
        if (!this.details.requirements || id !== "enterprise_requirements") {
          this.details.requirements = plainBrief(this.details, id);
        }
        const result = await this.sync({ force: true, nextAction: definition.nextAction, team });
        reference = result.leadReference;
        break;
      }
      case "ticket": {
        const serious = context.supportCategory === "BILLING" || context.supportCategory === "TECHNICAL";
        const summary = serious
          ? await this.summary(team, `${context.topicLabel ?? "Support"} request from an existing client`)
          : undefined;
        const result = await this.runtime.commit({
          type: "ticket",
          details: this.details,
          state: this.state,
          context,
          team,
          handover: summary,
        });
        reference = result.reference;
        if (reference) this.records.ticket = reference;
        if (summary && reference) {
          this.state.handover = { team, reference, at: this.context.now.toISOString(), reason: summary.reason };
        }
        await this.event("TICKET_CREATED", { value: context.topicLabel, team });
        break;
      }
      case "meeting": {
        await this.sync({ force: true, nextAction: definition.nextAction, team });
        const result = await this.runtime.commit({
          type: "meeting",
          details: this.details,
          state: this.state,
          score,
          topic: [pick(definition.title, "en"), this.serviceLabel()].filter(Boolean).join(" — "),
          note: active.meetingNote,
          nextAction: definition.nextAction,
          team,
        });
        reference = result.reference ?? this.records.lead;
        if (result.reference) this.records.meeting = result.reference;
        break;
      }
      case "handover":
        await this.handover(team, `${pick(definition.title, "en")} completed`);
        return;
    }

    if (definition.escalate) {
      const summary = await this.summary(team, `${pick(definition.title, "en")} submitted`);
      const result = await this.runtime.commit({
        type: "handover",
        details: this.details,
        state: this.state,
        score,
        summary,
        silent: true,
      });
      this.state.handover = { team, reference: result.reference, at: this.context.now.toISOString(), reason: summary.reason, silent: true };
      await this.event("HANDOVER", { team, value: id });
    }

    await this.event("FLOW_COMPLETED", { value: id, intent: this.state.intent, team });

    const body = this.fillCopy(pick(definition.done.body, this.language), {
      reference,
      brief: brief ? fill(pick(this.config.messages.brief, this.language), { brief }) : undefined,
    });
    await this.offer(body, this.actionChoices(definition.done.actions));
  }

  // ------------------------------------------------------------- Handover ---

  private async handover(team: TeamKey, reason: string, options: { silent?: boolean } = {}): Promise<void> {
    const { config, language } = this;
    const existing = this.state.handover;
    const recent =
      existing &&
      existing.team === team &&
      this.context.now.getTime() - Date.parse(existing.at) < config.handover.dedupeHours * 3_600_000;

    if (recent && existing.reference) {
      if (!options.silent) {
        await this.offer(
          this.fillCopy(pick(config.messages.handoverExisting, language), {
            team: config.teams[team]?.label ?? team,
            reference: existing.reference,
          }),
          this.actionChoices(["main_menu"])
        );
      }
      return;
    }

    const summary = await this.summary(team, reason);
    const result = await this.runtime.commit({
      type: "handover",
      details: this.details,
      state: this.state,
      score: this.score(),
      summary,
      silent: Boolean(options.silent),
    });

    this.state.handover = { team, reference: result.reference, at: this.context.now.toISOString(), reason, silent: options.silent };
    this.state.team = team;
    await this.event("HANDOVER", { team, value: reason });
    if (options.silent) return;

    const open = isOpen(config.businessHours, this.context.now);
    const body = [
      this.fillCopy(pick(config.messages.handover, language), {
        team: config.teams[team]?.label ?? team,
        reference: result.reference,
      }),
      open ? "" : this.fillCopy(pick(config.messages.handoverOffHours, language), {
        nextOpen: nextOpening(config.businessHours, this.context.now),
      }),
    ]
      .filter(Boolean)
      .join("\n\n");

    await this.offer(body, this.actionChoices(["main_menu"]));
  }

  private async summary(team: TeamKey, reason: string): Promise<HandoverSummary> {
    const conversation = await this.runtime.summarize().catch(() => "");
    return handoverSummary({
      details: this.details,
      state: this.state,
      score: this.score(),
      phone: this.context.phone,
      profileName: this.context.profileName,
      team,
      reason,
      conversation,
      config: this.config,
      serviceLabel: this.serviceLabel(),
    });
  }

  private async enterEnterpriseMode(reason: string): Promise<void> {
    this.state.signals.enterprise = true;
    this.state.flow = undefined;
    this.state.team = "ENTERPRISE";
    this.details.topic = "ENTERPRISE";
    await this.event("ENTERPRISE_DETECTED", { value: reason, team: "ENTERPRISE" });

    // The enterprise team hears about it now, not after the customer picks a button.
    await this.handover("ENTERPRISE", `Enterprise opportunity (${reason})`, { silent: true });

    const actions = this.config.intents.ENTERPRISE?.actions ?? ["book_strategy_call", "submit_requirements", "enterprise_expert"];
    await this.offer(pick(this.config.messages.enterprise, this.language), this.actionChoices(actions));
  }

  // ------------------------------------------------------- Pricing & proof --

  private async showPricing(intent: BotIntent | undefined): Promise<void> {
    const { config, language } = this;
    const entries = intent ? config.pricing.filter((entry) => entry.intents.includes(intent)) : [];

    if (!entries.length) {
      const body = fill(pick(config.messages.pricingUnavailable, language), {
        service: this.serviceLabel() ?? (language === "en" ? "this service" : "is service"),
      });
      await this.offer(body, this.actionChoices(["get_quote", "book_strategy_call", "talk_to_expert"]));
      return;
    }

    await this.event("PRICING_VIEWED", { intent, value: entries.map((entry) => entry.id).join(",") });
    for (const [index, entry] of entries.entries()) {
      const body = [pick(entry.summary, language), entry.details ? pick(entry.details, language) : ""]
        .filter(Boolean)
        .join("\n\n");
      if (index < entries.length - 1) await this.say(body);
      else await this.offer(body, this.actionChoices(entry.actions));
    }
  }

  private async showProof(section: ProofSection): Promise<void> {
    const items = this.config.proof[section];
    if (!items.length) {
      await this.offer(
        pick(this.config.messages.proofEmpty, this.language),
        this.actionChoices(["book_strategy_call", "main_menu"])
      );
      return;
    }
    const body = items
      .slice(0, 6)
      .map((item) => [`*${item.title}*`, item.summary, item.link].filter(Boolean).join("\n"))
      .join("\n\n");
    await this.offer(body, this.actionChoices(["book_strategy_call", "get_quote", "main_menu"]));
  }

  // --------------------------------------------------------- Understanding --

  /** Read the customer's message into the profile. */
  private async learn(text: string): Promise<void> {
    const extracted = await this.runtime.extract(this.details).catch(() => ({}) as CustomerDetails);
    this.details = mergeDetails(this.details, extracted);

    if (!this.details.businessType) {
      const industry = detectIndustry(text);
      if (industry) this.details.businessType = industry;
    }

    if (!this.details.country) {
      const match = detectCountry(
        { message: text, website: this.details.website, phone: this.context.phone },
        this.config.countries
      );
      if (match) this.details.country = match.country.name;
    } else {
      // Normalise "dubai" or "ksa" to the configured country name.
      const named = countryByName(this.details.country, this.config.countries);
      if (named) this.details.country = named.name;
    }
  }

  private setIntent(intent: BotIntent): void {
    if (isServiceIntent(intent) || !this.state.intent) this.state.intent = intent;
    const entry = this.config.intents[intent];
    if (isServiceIntent(intent)) {
      this.details.topic = intent;
      if (entry?.serviceSlug && !this.details.service) this.details.service = entry.serviceSlug;
      if (entry?.subService && !this.details.subService) this.details.subService = entry.subService;
    }
  }

  private currentServiceIntent(): BotIntent | undefined {
    return this.state.intent && isServiceIntent(this.state.intent) ? this.state.intent : undefined;
  }

  private contextFor(service: BotIntent | undefined): FlowContext {
    if (!service) return {};
    const entry = this.config.intents[service];
    return { intent: service, serviceSlug: entry?.serviceSlug, subService: entry?.subService, team: entry?.team };
  }

  private teamFor(): TeamKey {
    if (this.state.team) return this.state.team;
    const intent = this.state.intent;
    return (intent && this.config.intents[intent]?.team) || "SALES";
  }

  private serviceLabel(): string | undefined {
    if (this.details.subService) return this.details.subService;
    const nodeId = this.state.intent ? this.config.intents[this.state.intent]?.node : undefined;
    const node = nodeId ? this.config.menu.nodes[nodeId] : undefined;
    return node ? pick(node.title, "en").replace(/^\P{L}+/u, "").trim() : undefined;
  }

  private score(): LeadScore {
    return scoreLead(this.details, this.state, this.config);
  }

  private remember(label: string): void {
    const clean = label.replace(/^\P{L}+/u, "").trim();
    if (!clean || this.state.trail.at(-1) === clean) return;
    this.state.trail = [...this.state.trail, clean].slice(-12);
  }

  // ------------------------------------------------------------ Finishing ---

  private async sync(options: { force?: boolean; nextAction?: string; team?: TeamKey } = {}): Promise<EffectResult> {
    const score = this.score();
    this.state.score = score;
    const result = await this.runtime.commit({
      type: "sync",
      details: this.details,
      state: this.state,
      score,
      force: options.force,
      nextAction: options.nextAction,
      team: options.team ?? this.teamFor(),
    });
    this.synced = true;
    if (result.leadReference) {
      if (result.leadCreated) await this.event("LEAD_CAPTURED", { intent: this.state.intent, team: this.teamFor() });
      this.records.lead = result.leadReference;
    }
    return result;
  }

  /**
   * End of every turn that may have changed the profile: keep the CRM current
   * and tell the team the first time a lead reaches a hot band.
   */
  private async finish(changed: boolean): Promise<void> {
    if (changed && !this.synced) await this.sync();

    const score = this.score();
    this.state.score = score;

    const notify = this.config.handover.notifyTemperatures;
    const alerted = this.state.alerted ?? [];
    if (
      this.records.lead &&
      notify.includes(score.temperature) &&
      warmedUp(this.startTemperature, score.temperature) &&
      !alerted.includes(score.temperature)
    ) {
      this.state.alerted = [...alerted, score.temperature];
      await this.event("LEAD_HOT", { value: score.temperature, intent: this.state.intent, team: this.teamFor() });
      const summary = await this.summary(this.teamFor(), `Lead reached ${score.temperature.replace("_", " ").toLowerCase()} (${score.value}/100)`);
      await this.runtime.commit({ type: "alert", details: this.details, state: this.state, score, summary });
    }
  }

  // ------------------------------------------------------------ Messaging ---

  private actionChoices(keys: string[]): Choice[] {
    return keys
      .map((key) => [key, this.config.actions[key]] as const)
      .filter(([, action]) => Boolean(action))
      .map(([key, action]) => ({
        id: `a:${key}`,
        title: pick(action!.title, this.language),
        description: action!.description ? pick(action!.description, this.language) : undefined,
      }));
  }

  private async say(body: string): Promise<void> {
    if (body.trim()) await this.runtime.send({ type: "text", body: body.trim() });
  }

  private async offer(
    body: string,
    choices: Choice[],
    options: { pageId?: (page: number) => string; page?: number; footer?: string; forceList?: boolean } = {}
  ): Promise<void> {
    const { messages } = this.config;
    for (const message of offer(body, choices, {
      listButton: pick(messages.menuButton, this.language),
      moreTitle: pick(messages.moreOptions, this.language),
      ...options,
    })) {
      await this.runtime.send(message);
    }
  }

  /** Fixed copy in the customer's language — translated by the model when not written for it. */
  private async localise(copy: Localized): Promise<string> {
    if (hasOwn(copy, this.language)) return pick(copy, this.language);
    const translated = await this.runtime.translate(copy.en, this.language).catch(() => "");
    return translated.trim() || copy.en;
  }

  private fillCopy(template: string, extra: TemplateValues = {}): string {
    const { contact } = this.config;
    return fill(template, {
      name: this.details.name ?? this.context.profileName,
      company: this.details.company,
      service: this.serviceLabel(),
      phone: contact.businessPhone,
      whatsapp: contact.whatsappCta,
      hours: pick(contact.hours, this.language),
      website: contact.website,
      whatbotUrl: contact.whatbotUrl,
      email: contact.email,
      ...extra,
    });
  }

  private async event(
    event: BotEventType,
    extra: { intent?: string; team?: TeamKey; value?: string; metadata?: Record<string, unknown> } = {}
  ): Promise<void> {
    await this.runtime.commit({ type: "event", event, ...extra });
  }
}

// ------------------------------------------------------ Answer handling -----

/** An option the customer typed rather than tapped: "2", "google", "not sure". */
export function matchOption(text: string, options: ChoiceOption[], language: Language): ChoiceOption | undefined {
  const raw = text.trim();
  const numeric = /^\d{1,2}$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= options.length) return options[numeric - 1];

  const bare = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}$+]+/gu, " ")
      .trim();
  const typed = bare(raw);
  if (!typed) return undefined;

  return (
    options.find((option) => bare(option.value) === typed) ??
    options.find((option) => bare(pick(option.title, language)) === typed || bare(option.title.en) === typed) ??
    options.find((option) => {
      const title = bare(option.title.en);
      return typed.length >= 3 && (title.includes(typed) || bare(option.value).includes(typed));
    })
  );
}

/** A typed answer to a text question, or null when it is not a plausible one. */
export function acceptText(field: StepField, text: string): string | null {
  const value = text.replace(/\s+/g, " ").trim();
  if (!value) return null;

  switch (field) {
    case "name": {
      const name = value.replace(/^(my name is|i am|i'm|this is|mera naam|main)\s+/i, "").replace(/[.!]+$/, "");
      if (name.length < 2 || name.length > 60 || /\d|@/.test(name) || wordCount(name) > 5) return null;
      return name;
    }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? value.toLowerCase() : null;
    case "website":
      // Word boundary: "novaclinics.ae" starts with "no" and is very much a website.
      if (/^(no|none|nahi|nahin|not yet|don'?t have)\b(?!\.)/i.test(value)) return "No website yet";
      return /([a-z0-9-]+\.)+[a-z]{2,}/i.test(value) ? value : null;
    default:
      return value.length <= 1500 ? value : value.slice(0, 1500);
  }
}
