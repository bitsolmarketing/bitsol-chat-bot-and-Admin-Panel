/**
 * =============================================================================
 *  Phone number lists
 * =============================================================================
 *
 *  Turning a pasted or uploaded list into numbers Meta will accept.
 *
 *  A marketing list arrives in whatever shape the person had it: a column
 *  copied out of Excel, a CSV with headers, numbers written `0300-1234567`,
 *  `+92 300 1234567` or `92 300 1234567`, some with names beside them, some
 *  repeated. Meta wants none of that — it wants `923001234567`, digits only,
 *  no plus, country code included.
 *
 *  Everything here is pure and does no I/O, because the same parse has to run
 *  twice: once to show the person what their file contains before they commit,
 *  and once for real when the broadcast is created. Those two must agree, and
 *  the cheapest way to guarantee that is one function.
 * =============================================================================
 */

/**
 * Country code assumed for a local number written without one.
 *
 * Pakistan, because that is where both businesses operate and where a number
 * beginning `03…` is unambiguous. A number that already carries a country code
 * is never rewritten.
 */
export const DEFAULT_COUNTRY_CODE = "92";

/** E.164 allows 15 digits; a real mobile is never shorter than 8. */
const MIN_DIGITS = 8;
const MAX_DIGITS = 15;

export interface ParsedNumber {
  /** Digits only, country code included — the form Meta calls `wa_id`. */
  waId: string;
  /** Same number as `+923001234567`, the form the CRM stores. */
  phone: string;
  /** Name from the second column, when the list had one. */
  name?: string;
  /** The line it came from, so a rejection can quote it back. */
  raw: string;
}

export interface RejectedNumber {
  raw: string;
  reason: string;
}

export interface ParseOutcome {
  valid: ParsedNumber[];
  invalid: RejectedNumber[];
  /** Lines that repeated a number already accepted earlier in the list. */
  duplicates: number;
}

/** Words that mark the first row as headings rather than data. */
const HEADER_WORDS =
  /^\s*"?\s*(phone|number|mobile|cell|contact|msisdn|whatsapp|wa[_ ]?id)\b/i;

/**
 * Split one line into fields.
 *
 * Handles comma, semicolon and tab separators, and double-quoted fields so a
 * name containing a comma survives. Not a full CSV parser — it does not do
 * embedded newlines, because a phone list never has them and pretending
 * otherwise would mean pulling in a dependency for no gain.
 */
function splitFields(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (char === '"') {
      // A doubled quote inside a quoted field is a literal quote.
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index++;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && (char === "," || char === ";" || char === "\t")) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Normalise one written number to Meta's `wa_id`.
 *
 * Returns null with a reason rather than throwing, because a list of two
 * thousand numbers will always contain a few that are not numbers at all, and
 * the useful response is to import the rest and show which lines were skipped.
 */
export function normalisePhone(
  input: string,
  countryCode = DEFAULT_COUNTRY_CODE
): { waId: string; phone: string } | { error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { error: "Empty" };

  // Letters mean this is a name, a heading, or a mangled cell — not a number.
  if (/[a-z]/i.test(trimmed)) return { error: "Not a phone number" };

  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return { error: "No digits" };

  // `00` is the international prefix in written form; Meta wants neither it
  // nor the `+` it stands in for.
  if (digits.startsWith("00")) digits = digits.slice(2);

  // A local number written with a trunk `0` (`03001234567`). The zero is not
  // part of the number once a country code is in front of it.
  if (digits.startsWith("0")) {
    digits = countryCode + digits.replace(/^0+/, "");
  } else if (digits.length <= 10 && !digits.startsWith(countryCode)) {
    // Bare local number with neither trunk zero nor country code.
    digits = countryCode + digits;
  }

  if (digits.length < MIN_DIGITS) return { error: "Too short" };
  if (digits.length > MAX_DIGITS) return { error: "Too long" };

  return { waId: digits, phone: `+${digits}` };
}

/**
 * Parse a pasted block or an uploaded CSV into numbers.
 *
 * The first column is the number and the second, when present, is the name.
 * That ordering is not configurable on purpose: every export people actually
 * paste in puts the number first, and a mapping UI would be a screen of
 * dropdowns to serve a case that does not arise.
 *
 * Duplicates are counted, not reported line by line. A list pasted twice is a
 * normal accident, and the only thing worth saying about it is that it was
 * caught — the alternative is messaging someone the same offer twice.
 */
export function parseNumberList(
  text: string,
  countryCode = DEFAULT_COUNTRY_CODE
): ParseOutcome {
  const valid: ParsedNumber[] = [];
  const invalid: RejectedNumber[] = [];
  const seen = new Set<string>();
  let duplicates = 0;

  // Strip a UTF-8 BOM, which Excel puts at the front of every CSV it saves and
  // which would otherwise make the first number unparseable.
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;

    // Only the very first non-empty line can be a heading row.
    if (index === 0 && HEADER_WORDS.test(line)) continue;

    const fields = splitFields(line);
    const result = normalisePhone(fields[0] ?? "", countryCode);

    if ("error" in result) {
      invalid.push({ raw: line.trim().slice(0, 80), reason: result.error });
      continue;
    }

    if (seen.has(result.waId)) {
      duplicates++;
      continue;
    }
    seen.add(result.waId);

    const name = fields[1]?.trim();
    valid.push({
      waId: result.waId,
      phone: result.phone,
      // A second column that is itself a number is a second phone column, not
      // a name — importing "03001234567" as somebody's name would put it in
      // the greeting of every message they receive.
      ...(name && /[a-z]/i.test(name) ? { name: name.slice(0, 120) } : {}),
      raw: line.trim().slice(0, 80),
    });
  }

  return { valid, invalid, duplicates };
}
