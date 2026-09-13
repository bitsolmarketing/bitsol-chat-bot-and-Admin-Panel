import type { Language } from "@/lib/i18n";
import type { ListRow, ReplyButton } from "./types";
import { toDisplayPhone } from "./client";
import { MARKETING_SERVICES, MARKETING_SERVICE_GROUPS } from "@/data/marketing/services";

/**
 * =============================================================================
 *  WhatsApp lead capture
 * =============================================================================
 *
 *  The web widget can open a form and collect eight fields in one screen.
 *  WhatsApp cannot — so this module asks one question per message and keeps the
 *  answers in `conversations.capture` between webhook deliveries.
 *
 *  Three properties matter, and they are why this is a deterministic state
 *  machine rather than a prompt asking the model to "collect these fields":
 *
 *    • **Completeness** — a lead that reaches the CRM always has the columns the
 *      sales pipeline needs. A model can be talked out of asking for a budget.
 *    • **Resumability** — every webhook delivery is a cold start. The step index
 *      lives in the database, not in a process's memory.
 *    • **Tappability** — most steps are buttons or lists. Typing a budget range
 *      in four possible languages is where people abandon a form.
 *
 *  The model still writes every free-form answer around this; the machine only
 *  decides which question comes next.
 * =============================================================================
 */

/**
 * Which structured capture is running. Only leads today; the flow is still
 * stored with the state so another one can be added without migrating the
 * captures already in progress.
 */
export type CaptureFlow = "LEAD";

export interface CaptureState {
  flow: CaptureFlow;
  /** Index into the flow's step list. */
  step: number;
  answers: Record<string, string>;
  /** ISO timestamp — an abandoned capture expires rather than resuming days later. */
  startedAt: string;
}

/** Prefix on every option id, so a capture answer is never confused with a menu tap. */
export const OPTION_PREFIX = "opt:";

/** A half-finished capture is dropped after this long and the visitor starts fresh. */
const CAPTURE_TTL_MS = 6 * 60 * 60 * 1000;

type Localised = Record<Language, string>;

interface CaptureStep {
  key: string;
  prompt: Localised;
  /** Answerable with "skip"; stored as an empty string. */
  optional?: boolean;
  /** Skip the step entirely based on what has already been answered. */
  skipWhen?: (answers: Record<string, string>) => boolean;
  /** Up to three tappable buttons. */
  buttons?: (answers: Record<string, string>, language: Language) => ReplyButton[];
  /** Up to ten tappable list rows. */
  list?: (
    answers: Record<string, string>,
    language: Language
  ) => { label: string; rows: ListRow[] };
  /**
   * Normalise and validate a raw answer. Returns the value to store, or `null`
   * to reject it and re-ask with `error`.
   */
  clean?: (value: string, context: { waPhone: string }) => string | null;
  error?: Localised;
}

// ------------------------------------------------------------ Shared bits ---

const SKIP_WORDS = ["skip", "none", "-", "na", "n/a", "nahi", "koi nahi", "چھوڑیں", "نہیں"];

const OPTIONAL_HINT: Localised = {
  en: "\n\n_Send *skip* if this doesn't apply._",
  ur: "\n\n_اگر لاگو نہیں ہوتا تو *skip* بھیجیں۔_",
  ur_roman: "\n\n_Agar zaroori nahi to *skip* likh dein._",
  pa: "\n\n_جے لوڑ نئیں تے *skip* لکھ دیو۔_",
};

const PHONE_STEP_PROMPT: Localised = {
  en: "📞 Which number should our team call you on?\n\nTap the button to use this WhatsApp number, or type a different one.",
  ur: "📞 ہماری ٹیم آپ کو کس نمبر پر کال کرے؟\n\nاسی واٹس ایپ نمبر کے لیے بٹن دبائیں، یا کوئی اور نمبر لکھ دیں۔",
  ur_roman:
    "📞 Hamari team aap ko kis number par call kare?\n\nIsi WhatsApp number ke liye button dabaen, ya doosra number likh dein.",
  pa: "📞 ساڈی ٹیم تہانوں کیہڑے نمبر تے کال کرے؟\n\nایسے واٹس ایپ نمبر لئی بٹن دباؤ، یا کوئی ہور نمبر لکھ دیو۔",
};

const USE_THIS_NUMBER: Localised = {
  en: "✅ Use this number",
  ur: "✅ یہی نمبر",
  ur_roman: "✅ Yehi number",
  pa: "✅ ایہو نمبر",
};

const PHONE_ERROR: Localised = {
  en: "That doesn't look like a phone number. Please send it with the country or city code, e.g. 03001234567.",
  ur: "یہ فون نمبر نہیں لگتا۔ براہِ کرم مکمل نمبر بھیجیں، مثلاً 03001234567۔",
  ur_roman:
    "Ye phone number nahi lag raha. Poora number bhejein, maslan 03001234567.",
  pa: "ایہہ فون نمبر نئیں لگدا۔ پورا نمبر بھیجو، جیویں 03001234567۔",
};

const NAME_ERROR: Localised = {
  en: "Please send your full name so our team knows who they're speaking to.",
  ur: "براہِ کرم اپنا پورا نام بھیجیں تاکہ ہماری ٹیم کو معلوم ہو کہ وہ کس سے بات کر رہی ہے۔",
  ur_roman: "Apna poora naam bhejein taake hamari team ko pata ho kis se baat ho rahi hai.",
  pa: "اپنا پورا ناں بھیجو تاں جو ساڈی ٹیم نوں پتہ ہووے اوہ کیہدے نال گل کر رہی اے۔",
};

const SOMETHING_ELSE: Localised = {
  en: "Something else",
  ur: "کچھ اور",
  ur_roman: "Kuch aur",
  pa: "کجھ ہور",
};

const CHOOSE: Localised = {
  en: "Choose",
  ur: "منتخب کریں",
  ur_roman: "Select karein",
  pa: "چُنو",
};

const OTHER_GROUP = "other";

function cleanPhone(value: string, context: { waPhone: string }): string | null {
  if (value === "use_wa_number") return context.waPhone;
  const digits = value.replace(/[^\d+]/g, "");
  // Pakistani mobiles are 11 digits locally (03xx…) or 12 with the country
  // code; allow 7–15 so international numbers still pass.
  const bare = digits.replace(/\D/g, "");
  if (bare.length < 7 || bare.length > 15) return null;
  return digits.startsWith("+") ? digits : bare;
}

function cleanName(value: string): string | null {
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.length >= 2 && clean.length <= 120 ? clean : null;
}

function catalogueGroupStep(
  key: string,
  prompt: Localised,
  groups: readonly string[]
): CaptureStep {
  return {
    key,
    prompt,
    list: (_answers, language) => ({
      label: CHOOSE[language],
      rows: [
        ...groups.map((group) => ({ id: `${OPTION_PREFIX}${group}`, title: group })),
        { id: `${OPTION_PREFIX}${OTHER_GROUP}`, title: SOMETHING_ELSE[language] },
      ],
    }),
  };
}

// --------------------------------------------------------------- LEAD flow --

const LEAD_STEPS: CaptureStep[] = [
  {
    key: "name",
    prompt: {
      en: "Great — let's get you a proper proposal. 📝\n\nFirst, what's your name?",
      ur: "بہت خوب — آئیے آپ کے لیے مکمل تجویز تیار کرتے ہیں۔ 📝\n\nپہلے، آپ کا نام کیا ہے؟",
      ur_roman:
        "Bohat acha — chalein aap ke liye proper proposal banate hain. 📝\n\nSab se pehle, aap ka naam?",
      pa: "بہت ودھیا — آؤ تہاڈے لئی پوری تجویز بݨائیے۔ 📝\n\nپہلاں، تہاڈا ناں کیہ اے؟",
    },
    clean: cleanName,
    error: NAME_ERROR,
  },
  {
    key: "company",
    prompt: {
      en: "🏢 What's your company or business name?",
      ur: "🏢 آپ کی کمپنی یا کاروبار کا نام؟",
      ur_roman: "🏢 Aap ki company ya business ka naam?",
      pa: "🏢 تہاڈی کمپنی یا کاروبار دا ناں؟",
    },
    optional: true,
  },
  {
    key: "phone",
    prompt: PHONE_STEP_PROMPT,
    buttons: (_answers, language) => [
      { id: `${OPTION_PREFIX}use_wa_number`, title: USE_THIS_NUMBER[language] },
    ],
    clean: cleanPhone,
    error: PHONE_ERROR,
  },
  catalogueGroupStep("serviceGroup", {
    en: "Which area do you need help with?",
    ur: "آپ کو کس شعبے میں مدد چاہیے؟",
    ur_roman: "Aap ko kis cheez mein madad chahiye?",
    pa: "تہانوں کیہڑے کم وچ مدد چاہیدی اے؟",
  }, MARKETING_SERVICE_GROUPS),
  {
    key: "service",
    prompt: {
      en: "Which service specifically?",
      ur: "خاص طور پر کون سی سروس؟",
      ur_roman: "Khaas taur par kaun si service?",
      pa: "خاص کر کے کیہڑی سروس؟",
    },
    skipWhen: (answers) => answers.serviceGroup === OTHER_GROUP,
    list: (answers, language) => ({
      label: CHOOSE[language],
      rows: MARKETING_SERVICES.filter((service) => service.group === answers.serviceGroup)
        .slice(0, 9)
        .map((service) => ({
          id: `${OPTION_PREFIX}${service.slug}`,
          title: service.name,
          description: service.tagline,
        }))
        .concat({
          id: `${OPTION_PREFIX}${OTHER_GROUP}`,
          title: SOMETHING_ELSE[language],
          description: "",
        }),
    }),
  },
  {
    key: "budget",
    prompt: {
      en: "💰 Roughly what budget do you have in mind? This only helps us scope the right solution — nothing is fixed at this stage.",
      ur: "💰 آپ کا تقریباً کیا بجٹ ہے؟ یہ صرف درست تجویز بنانے کے لیے ہے — ابھی کچھ بھی حتمی نہیں۔",
      ur_roman:
        "💰 Aap ka takreeban kya budget hai? Ye sirf sahi solution tajweez karne ke liye hai — abhi kuch final nahi.",
      pa: "💰 تہاڈا لگ بھگ کیہ بجٹ اے؟ ایہہ صرف ٹھیک تجویز بݨاؤن لئی اے — ہالے کجھ پکا نئیں۔",
    },
    list: (_answers, language) => ({
      label: CHOOSE[language],
      rows: [
        { id: `${OPTION_PREFIX}Under PKR 50,000`, title: "Under PKR 50k" },
        { id: `${OPTION_PREFIX}PKR 50,000 – 150,000`, title: "PKR 50k – 150k" },
        { id: `${OPTION_PREFIX}PKR 150,000 – 500,000`, title: "PKR 150k – 500k" },
        { id: `${OPTION_PREFIX}PKR 500,000+`, title: "PKR 500k+" },
        { id: `${OPTION_PREFIX}Not decided yet`, title: notDecided(language) },
      ],
    }),
  },
  {
    key: "timeline",
    prompt: {
      en: "⏱️ When would you like to start?",
      ur: "⏱️ آپ کب شروع کرنا چاہیں گے؟",
      ur_roman: "⏱️ Aap kab start karna chahenge?",
      pa: "⏱️ تسی کدوں شروع کرنا چاہوگے؟",
    },
    list: (_answers, language) => ({
      label: CHOOSE[language],
      rows: [
        { id: `${OPTION_PREFIX}Immediately`, title: immediately(language) },
        { id: `${OPTION_PREFIX}Within a month`, title: withinMonth(language) },
        { id: `${OPTION_PREFIX}1–3 months`, title: "1–3 months" },
        { id: `${OPTION_PREFIX}Just exploring`, title: justExploring(language) },
      ],
    }),
  },
  {
    key: "requirements",
    prompt: {
      en: "Last one 🙌 — in a line or two, what do you want to achieve?",
      ur: "آخری سوال 🙌 — ایک دو جملوں میں بتائیں آپ کیا حاصل کرنا چاہتے ہیں؟",
      ur_roman:
        "Aakhri sawal 🙌 — ek do line mein bataen aap kya haasil karna chahte hain?",
      pa: "چھیکڑلا سوال 🙌 — اک دو لینا وچ دسو تسی کیہ حاصل کرنا چاہندے او؟",
    },
    clean: (value) => {
      const clean = value.trim();
      return clean.length >= 3 ? clean.slice(0, 3000) : null;
    },
    error: {
      en: "Just a short line is fine — e.g. \"I need a website that takes online orders.\"",
      ur: "ایک مختصر جملہ کافی ہے — مثلاً \"مجھے ایسی ویب سائٹ چاہیے جو آن لائن آرڈر لے۔\"",
      ur_roman:
        "Ek chhoti si line kaafi hai — maslan \"mujhe aisi website chahiye jo online order le.\"",
      pa: "اک نکی جئی گل کافی اے — جیویں \"مینوں ایسی ویب سائٹ چاہیدی اے جیہڑی آن لائن آرڈر لوے۔\"",
    },
  },
];

const FLOWS: Record<CaptureFlow, CaptureStep[]> = {
  LEAD: LEAD_STEPS,
};

// ------------------------------------------------------- State transitions --

export interface CapturePrompt {
  text: string;
  buttons?: ReplyButton[];
  list?: { label: string; rows: ListRow[] };
}

export type CaptureOutcome =
  /** Ask this (the next question, or the same one again after a bad answer). */
  | { status: "ask"; state: CaptureState; prompt: CapturePrompt }
  /** Every field is collected — the handler should now write the CRM record. */
  | { status: "complete"; answers: Record<string, string> }
  /** The visitor typed "cancel"; drop the capture and hand back to the assistant. */
  | { status: "cancelled" };

/** Start a capture and produce its first question. */
export function beginCapture(
  flow: CaptureFlow,
  language: Language,
  seed: Record<string, string> = {}
): CaptureOutcome {
  const state: CaptureState = {
    flow,
    step: 0,
    answers: { ...seed },
    startedAt: new Date().toISOString(),
  };
  return askFrom(state, language, 0);
}

/**
 * Apply an answer and work out what to ask next.
 *
 * `raw` is the button/list id when the visitor tapped something, and their
 * typed text otherwise — the caller does not need to know which.
 */
export function advanceCapture(
  state: CaptureState,
  raw: string,
  language: Language,
  context: { waPhone: string }
): CaptureOutcome {
  const steps = FLOWS[state.flow];
  const step = steps[state.step];
  if (!step) return { status: "complete", answers: state.answers };

  const answer = raw.startsWith(OPTION_PREFIX) ? raw.slice(OPTION_PREFIX.length) : raw.trim();

  if (isCancel(answer)) return { status: "cancelled" };

  const skipped = step.optional && isSkip(answer);
  let value = skipped ? "" : answer;

  if (!skipped && step.clean) {
    const cleaned = step.clean(value, context);
    if (cleaned == null) {
      // Re-ask the same step, prefixed with what went wrong.
      const prompt = renderStep(step, state.answers, language);
      return {
        status: "ask",
        state,
        prompt: { ...prompt, text: `⚠️ ${step.error?.[language] ?? ""}\n\n${prompt.text}`.trim() },
      };
    }
    value = cleaned;
  }

  if (!skipped && !value) {
    const prompt = renderStep(step, state.answers, language);
    return { status: "ask", state, prompt };
  }

  const next: CaptureState = {
    ...state,
    answers: { ...state.answers, [step.key]: value },
    step: state.step + 1,
  };

  return askFrom(next, language, next.step);
}

/** Find the next step that isn't skipped, or report completion. */
function askFrom(state: CaptureState, language: Language, from: number): CaptureOutcome {
  const steps = FLOWS[state.flow];

  for (let index = from; index < steps.length; index++) {
    const step = steps[index];
    // Already answered — either seeded from the conversation ("you were asking
    // about SEO") or filled on an earlier pass. Never ask twice.
    if (state.answers[step.key] !== undefined) continue;
    if (step.skipWhen?.(state.answers)) continue;
    const positioned: CaptureState = { ...state, step: index };
    return {
      status: "ask",
      state: positioned,
      prompt: renderStep(step, state.answers, language, index + 1, steps.length),
    };
  }

  return { status: "complete", answers: state.answers };
}

function renderStep(
  step: CaptureStep,
  answers: Record<string, string>,
  language: Language,
  position?: number,
  total?: number
): CapturePrompt {
  let text = step.prompt[language] ?? step.prompt.en;
  if (step.optional) text += OPTIONAL_HINT[language] ?? OPTIONAL_HINT.en;
  if (position && total) text = `*${position}/${total}* · ${text}`;

  return {
    text,
    buttons: step.buttons?.(answers, language),
    list: step.list?.(answers, language),
  };
}

/** True when a stored capture is too old to resume. */
export function isCaptureStale(state: CaptureState): boolean {
  const started = Date.parse(state.startedAt);
  return Number.isNaN(started) || Date.now() - started > CAPTURE_TTL_MS;
}

/** Narrow the untyped `conversations.capture` JSON column back to a state. */
export function asCaptureState(value: unknown): CaptureState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CaptureState>;
  // An admission capture left over from BITSOL Institute is not resumable.
  if (candidate.flow !== "LEAD") return null;
  if (typeof candidate.step !== "number") return null;
  return {
    flow: candidate.flow,
    step: candidate.step,
    answers: (candidate.answers ?? {}) as Record<string, string>,
    startedAt: candidate.startedAt ?? new Date().toISOString(),
  };
}

/** Default phone answer offered to a contact, in display form. */
export function seedFromWaId(waId: string): { waPhone: string } {
  return { waPhone: toDisplayPhone(waId) };
}

// ------------------------------------------------------------------ words ---
// Short labels only — WhatsApp truncates a list row title at 24 characters and
// a button title at 20, so these stay deliberately terse in every language.

function notDecided(language: Language): string {
  return { en: "Not decided yet", ur: "ابھی طے نہیں", ur_roman: "Abhi decide nahi", pa: "ہالے پکا نئیں" }[language];
}
function immediately(language: Language): string {
  return { en: "Immediately", ur: "فوراً", ur_roman: "Foran", pa: "ہُݨے" }[language];
}
function withinMonth(language: Language): string {
  return { en: "Within a month", ur: "ایک ماہ میں", ur_roman: "Ek month mein", pa: "اک مہینے وچ" }[language];
}
function justExploring(language: Language): string {
  return { en: "Just exploring", ur: "صرف معلومات", ur_roman: "Sirf maloomat", pa: "صرف جاݨکاری" }[language];
}
const CANCEL_WORDS = [
  "cancel", "stop", "exit", "quit", "menu", "back", "main menu", "restart",
  "band karo", "rehne do", "منسوخ", "بند",
];

function isCancel(value: string): boolean {
  return CANCEL_WORDS.includes(value.trim().toLowerCase());
}

function isSkip(value: string): boolean {
  return SKIP_WORDS.includes(value.trim().toLowerCase());
}
