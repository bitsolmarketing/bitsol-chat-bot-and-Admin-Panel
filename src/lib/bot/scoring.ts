import type { CustomerDetails } from "@/lib/ai/customer";
import type { BotConfig } from "./schema";
import { hasPhrase, normalise } from "./text";
import type { BotState, Temperature } from "./types";

/**
 * =============================================================================
 *  Lead scoring
 * =============================================================================
 *
 *  A transparent points system rather than a model's opinion, so the sales
 *  team can see exactly why a lead is Hot: every rule that fired is returned
 *  as a readable reason and stored on the lead.
 *
 *  Weights and band thresholds come from the chatbot configuration. The score
 *  is capped at 100.
 * =============================================================================
 */

export interface LeadScore {
  value: number;
  temperature: Temperature;
  reasons: string[];
}

const IMMEDIATE_PHRASES = [
  "immediately", "asap", "urgent", "urgently", "right away", "this week", "today", "tomorrow",
  "within 2 weeks", "within two weeks", "within a week", "next week", "foran", "jaldi", "abhi",
  "isi hafte", "فوراً", "جلدی", "ابھی",
];

/** A timeline that means "now" — a tapped immediate option or the words for it. */
export function isImmediate(timeline: string | undefined, config: BotConfig["options"]): boolean {
  if (!timeline) return false;
  if (config.timelines.some((option) => option.immediate && option.value === timeline)) return true;
  const text = normalise(timeline);
  return IMMEDIATE_PHRASES.some((phrase) => hasPhrase(text, phrase));
}

/**
 * The largest amount in a budget, in US dollars, or null when there is none.
 * Understands "$10k", "10,000 USD", "Rs 3 lakh", "PKR 2.8M", "£5,000".
 */
export function budgetInUsd(budget: string | undefined, config: BotConfig["scoring"]): number | null {
  if (!budget) return null;
  const text = budget.toLowerCase().replace(/,/g, "");

  const pkr = /(rs\.?|pkr|rupees?|روپے)/.test(text);
  const rates: Array<[RegExp, number]> = [
    [/£|gbp/, 1.25],
    [/€|eur/, 1.08],
    [/aed|dirham/, 0.27],
    [/sar|riyal/, 0.27],
    [/cad/, 0.73],
    [/aud/, 0.66],
  ];
  const rate = pkr ? 1 / config.pkrPerUsd : rates.find(([pattern]) => pattern.test(text))?.[1] ?? 1;

  let largest: number | null = null;
  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*(k|m|mn|million|lakh|lac|crore)?/g)) {
    const unit = match[2];
    const multiplier =
      unit === "k" ? 1_000
      : unit === "m" || unit === "mn" || unit === "million" ? 1_000_000
      : unit === "lakh" || unit === "lac" ? 100_000
      : unit === "crore" ? 10_000_000
      : 1;
    const amount = Number(match[1]) * multiplier * rate;
    if (largest === null || amount > largest) largest = amount;
  }
  return largest;
}

function isHighBudget(budget: string | undefined, config: BotConfig): boolean {
  if (!budget) return false;
  const all = [...config.options.budgets.USD, ...config.options.budgets.PKR];
  const option = all.find((entry) => entry.value === budget);
  if (option) return Boolean(option.highValue);
  const usd = budgetInUsd(budget, config.scoring);
  return usd !== null && usd >= config.scoring.highBudgetUsd;
}

function isUnsure(value: string | undefined): boolean {
  return !value || /^(not sure|unsure|don'?t know|no idea|pata nahi|معلوم نہیں)$/i.test(value.trim());
}

export function temperatureFor(value: number, bands: BotConfig["scoring"]["bands"]): Temperature {
  if (value >= bands.highPriority) return "HIGH_PRIORITY";
  if (value >= bands.hot) return "HOT";
  if (value >= bands.warm) return "WARM";
  return "COLD";
}

export function scoreLead(details: CustomerDetails, state: BotState, config: BotConfig): LeadScore {
  const { weights } = config.scoring;
  const reasons: string[] = [];
  let value = 0;

  const add = (points: number, reason: string, when: boolean) => {
    if (when && points > 0) {
      value += points;
      reasons.push(reason);
    }
  };

  add(weights.businessIdentified, "Business identified", Boolean(details.company || details.businessType));
  add(
    weights.websiteProvided,
    "Website provided",
    Boolean(details.website && !/^no\b/i.test(details.website))
  );
  add(
    weights.clearService,
    "Clear service requirement",
    Boolean(details.service || details.subService || (details.requirements && details.requirements.length > 15))
  );
  add(weights.budgetProvided, "Budget provided", !isUnsure(details.budget));
  add(weights.immediateTimeline, "Immediate timeline", isImmediate(details.timeline, config.options));
  add(weights.enterprise, "Enterprise company", Boolean(state.signals.enterprise));
  add(weights.highBudget, "High budget", isHighBudget(details.budget, config));
  add(weights.wantsStrategyCall, "Wants a strategy call", Boolean(state.signals.wantsCall));
  add(weights.wantsDemo, "Wants a demo", Boolean(state.signals.wantsDemo));

  value = Math.min(100, value);
  return { value, temperature: temperatureFor(value, config.scoring.bands), reasons };
}

const ORDER: Temperature[] = ["COLD", "WARM", "HOT", "HIGH_PRIORITY"];

/** True when `next` is a hotter band than `previous`. */
export function warmedUp(previous: Temperature | undefined, next: Temperature): boolean {
  return ORDER.indexOf(next) > ORDER.indexOf(previous ?? "COLD");
}
