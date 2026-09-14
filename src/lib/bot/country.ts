import type { BotConfig } from "./schema";
import { hasPhrase, normalise } from "./text";

/**
 * Where the customer's business is.
 *
 * Signals, strongest first:
 *   1. what the customer said ("we're in Dubai", or tapping a country),
 *   2. their website's country domain (`.ae`, `.co.uk`),
 *   3. the country code of the number they are messaging from.
 *
 * A phone number is where a person is, not necessarily where their business
 * is — a Pakistani founder can run a UK company — which is why it ranks last
 * and why nothing is assumed when there are no signals at all. Currency is
 * only ever derived from a detected country, never guessed.
 */

export type Country = BotConfig["countries"][number];

export interface CountryMatch {
  country: Country;
  via: "stated" | "website" | "phone";
}

export function countryByName(name: string | undefined, countries: Country[]): Country | undefined {
  if (!name) return undefined;
  const text = normalise(name);
  return countries.find(
    (country) =>
      normalise(country.name) === text ||
      country.code.toLowerCase() === text.trim() ||
      country.keywords.some((keyword) => hasPhrase(text, keyword))
  );
}

export function countryFromWebsite(website: string | undefined, countries: Country[]): Country | undefined {
  if (!website) return undefined;
  const host = website.toLowerCase().replace(/^https?:\/\//, "").split(/[/?#]/)[0];
  return countries.find((country) => country.tlds.some((tld) => host.endsWith(tld)));
}

export function countryFromPhone(phone: string | undefined, countries: Country[]): Country | undefined {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return undefined;

  // Longest dial code first: 971 must win over a hypothetical 97.
  const candidates = countries
    .flatMap((country) => country.dialCodes.map((code) => ({ country, code })))
    .filter(({ code }) => digits.startsWith(code))
    .sort((a, b) => b.code.length - a.code.length);
  if (!candidates.length) return undefined;

  const code = candidates[0].code;
  const sharing = candidates.filter((candidate) => candidate.code === code);
  if (sharing.length === 1) return sharing[0].country;

  // +1 is shared by the US and Canada; the area code tells them apart.
  const areaCode = digits.slice(code.length, code.length + 3);
  const byArea = sharing.find(({ country }) => country.areaCodes?.includes(areaCode));
  if (byArea) return byArea.country;
  return sharing.find(({ country }) => !country.areaCodes?.length)?.country;
}

export function detectCountry(
  input: { stated?: string; message?: string; website?: string; phone?: string },
  countries: Country[]
): CountryMatch | undefined {
  const stated = countryByName(input.stated, countries) ?? countryByName(input.message, countries);
  if (stated) return { country: stated, via: "stated" };

  const website = countryFromWebsite(input.website, countries);
  if (website) return { country: website, via: "website" };

  const phone = countryFromPhone(input.phone, countries);
  if (phone) return { country: phone, via: "phone" };

  return undefined;
}
