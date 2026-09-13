import { BRAND } from "@/lib/brands";
import { MARKETING_SERVICES } from "@/data/marketing/services";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/**
 * llms.txt: a plain-text summary for AI assistants and AI search engines, built
 * from the same service catalogue the concierge answers from, so it never
 * drifts from what the site says.
 */
export const dynamic = "force-static";

export function GET() {
  const services = MARKETING_SERVICES.map(
    (s) => `- ${s.name} (${s.group}): ${s.tagline} ${s.pricing.startingAt}, ${s.pricing.model}.`,
  ).join("\n");

  const body = `# ${BRAND.name} AI Concierge

> ${BRAND.description} This site (${SITE_URL}) hosts the company's AI concierge, which answers questions, gives indicative pricing, files quote requests and books consultations 24/7 in English, Urdu, Roman Urdu and Punjabi.

The company's main website is ${BRAND.contact.website}.

## Pages

- [Home](${absoluteUrl("/")}): Services, how an engagement runs, and the BITSOL standard.
- [AI Concierge](${absoluteUrl("/chat")}): Chat with the assistant for answers, quotes and consultations.
- [About](${absoluteUrl("/about")}): What the concierge does and how it works.

## Services

${services}

Prices are indicative starting points. Every engagement receives a written, fixed quotation.

## Contact

- Email: ${BRAND.contact.email}
- Phone and WhatsApp: ${BRAND.contact.phone}
- Website: ${BRAND.contact.website}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
