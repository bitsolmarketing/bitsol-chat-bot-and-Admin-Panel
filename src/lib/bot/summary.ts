import type { CustomerDetails } from "@/lib/ai/customer";
import type { LeadScore } from "./scoring";
import type { BotConfig } from "./schema";
import type { BotState, FlowId, TeamKey } from "./types";

/**
 * Structured write-ups the team reads: the project brief a customer sees at
 * the end of a flow, and the handover summary a person receives when a
 * conversation is passed to them — built so nobody asks the customer to
 * repeat what they already said.
 */

const TEMPERATURE_LABEL = { COLD: "Cold", WARM: "Warm", HOT: "Hot", HIGH_PRIORITY: "High Priority" } as const;

function line(label: string, value: string | undefined): string | null {
  return value ? `• *${label}:* ${value}` : null;
}

/** The customer-facing project brief, in WhatsApp formatting. */
export function projectBrief(details: CustomerDetails, flow: FlowId): string {
  const lines =
    flow === "enterprise_requirements"
      ? [
          line("Organisation", details.company),
          line("Size", details.companySize),
          line("Industry", details.businessType),
          line("Requirements", details.requirements),
          line("Timeline", details.timeline),
          line("Budget", details.budget),
          line("Country", details.country),
        ]
      : [
          line("Business", details.company),
          line("Website", details.website),
          line("Platform", details.platform),
          line("Objective", details.businessGoal),
          line("Features", details.features),
          line("Deadline", details.timeline),
          line("Budget", details.budget),
          line("Country", details.country),
        ];
  return lines.filter(Boolean).join("\n");
}

/** The same brief as plain text, for the CRM's requirements column. */
export function plainBrief(details: CustomerDetails, flow: FlowId): string {
  return projectBrief(details, flow).replace(/\*/g, "").replace(/^• /gm, "");
}

export interface HandoverSummary {
  team: TeamKey;
  reason: string;
  text: string;
  recommendedAction: string;
}

export function recommendedAction(input: {
  reason: string;
  team: TeamKey;
  score?: LeadScore;
  enterprise?: boolean;
  service?: string;
}): string {
  const { reason, team, score, enterprise, service } = input;
  if (/upset|frustrat|complain/i.test(reason)) {
    return "Reply personally and de-escalate. Read the transcript first so the customer does not have to explain again.";
  }
  if (enterprise || team === "ENTERPRISE") {
    return "Senior consultant to call within one business hour and schedule an enterprise discovery session.";
  }
  if (team === "BILLING") return "Check the account and reply with the billing details the customer needs.";
  if (team === "SUPPORT") return "Review the issue, update the ticket and reply to the customer on WhatsApp.";
  if (score && (score.temperature === "HIGH_PRIORITY" || score.temperature === "HOT")) {
    return `Call today while interest is high${service ? ` and prepare a proposal for ${service}` : ""}.`;
  }
  return `Reply on WhatsApp${service ? ` about ${service}` : ""} and qualify the requirement.`;
}

export function handoverSummary(input: {
  details: CustomerDetails;
  state: BotState;
  score?: LeadScore;
  phone: string;
  profileName?: string;
  team: TeamKey;
  reason: string;
  conversation: string;
  config: BotConfig;
  serviceLabel?: string;
}): HandoverSummary {
  const { details, state, score, config } = input;
  const action = recommendedAction({
    reason: input.reason,
    team: input.team,
    score,
    enterprise: state.signals.enterprise,
    service: input.serviceLabel,
  });

  const name = details.name ?? input.profileName ?? "Not shared";
  const rows: Array<[string, string | undefined]> = [
    ["CUSTOMER", `${name} · ${details.phone ?? input.phone}${details.email ? ` · ${details.email}` : ""}`],
    ["COMPANY", [details.company, details.businessType, details.companySize].filter(Boolean).join(" · ") || undefined],
    ["COUNTRY", [details.country, details.city].filter(Boolean).join(" · ") || undefined],
    ["INTENT", details.topic ?? state.intent],
    ["SERVICE", input.serviceLabel ?? details.subService],
    ["REQUIREMENT", details.requirements ?? details.businessGoal],
    ["CHALLENGE", details.challenge],
    ["BUDGET", details.budget],
    ["TIMELINE", details.timeline],
    ["LEAD SCORE", score ? `${score.value}/100 (${TEMPERATURE_LABEL[score.temperature]})${score.reasons.length ? ` — ${score.reasons.join(", ")}` : ""}` : undefined],
    ["TEAM", config.teams[input.team]?.label ?? input.team],
    ["WHY", input.reason],
    ["PREVIOUS SELECTIONS", state.trail?.length ? state.trail.join(" → ") : undefined],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value ?? "—"}`),
    "",
    "CONVERSATION SUMMARY:",
    input.conversation || "—",
    "",
    `RECOMMENDED ACTION: ${action}`,
  ].join("\n");

  return { team: input.team, reason: input.reason, text, recommendedAction: action };
}
