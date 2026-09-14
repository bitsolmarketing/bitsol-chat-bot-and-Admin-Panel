import type { Language } from "@/lib/i18n";
import type { BotPromptContext } from "@/lib/ai/system-prompt";
import type { BotConfig } from "./schema";
import { pick } from "./text";

/**
 * The representative's view of the chatbot configuration: who to say we are,
 * how to sound, the contact details it may give and the only prices it may
 * quote. Used by the WhatsApp assistant and the website chat alike, so an edit
 * in the studio changes both.
 */
export function promptContextFor(
  config: BotConfig,
  language: Language,
  turn: Omit<BotPromptContext, "contact" | "personality" | "pricing"> = {}
): BotPromptContext {
  const { contact, personality } = config;
  return {
    contact: {
      whatsapp: contact.whatsappCta,
      phone: contact.businessPhone,
      email: contact.email,
      website: contact.website,
      address: contact.address,
      hours: pick(contact.hours, language),
    },
    personality,
    pricing: config.pricing.map((entry) => ({
      label: entry.label,
      summary: [pick(entry.summary, "en"), entry.details ? pick(entry.details, "en") : ""]
        .filter(Boolean)
        .join("\n")
        .replace(/\*/g, ""),
    })),
    ...turn,
  };
}

/** Where a team's notifications go, falling back to the sales inbox. */
export function teamRecipients(config: BotConfig, team: keyof BotConfig["teams"] | undefined, fallback?: string): string[] {
  const emails = team ? config.teams[team]?.emails ?? [] : [];
  if (emails.length) return emails;
  return fallback ? [fallback] : [];
}
