import type { LeadStage, LeadTemperature } from "@prisma/client";

/** Pipeline stages in the order a lead moves through them, for filters and selects. */
export const LEAD_STAGES: LeadStage[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "HOT",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "FOLLOW_UP",
  "WON",
  "LOST",
  "SUPPORT",
  "SPAM",
  "OPTED_OUT",
];

export const LEAD_TEMPERATURES: LeadTemperature[] = ["HIGH_PRIORITY", "HOT", "WARM", "COLD"];
