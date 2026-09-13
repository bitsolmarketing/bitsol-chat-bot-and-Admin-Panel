/**
 * Product-level branding for the BITSOL AI Assistant.
 *
 * `BRAND` (src/lib/brands.ts) is the business the assistant speaks for. This
 * file holds the assistant's own identity and the developer attribution
 * rendered on the splash screen, login, footer, about page, admin console and
 * chat widget.
 */
export const BRANDING = {
  product: {
    name: "BITSOL AI Assistant",
    shortName: "BITSOL AI",
    poweredBy: "Powered by Artificial Intelligence",
    description:
      "The AI concierge for BITSOL Marketing — AI automation, software, digital growth and brand services.",
  },
  developer: {
    name: "BITSOL MARKETING",
    url: "https://bitsolmarketing.com",
    tagline: "Empowering Businesses with Artificial Intelligence",
    attribution: "Designed & Developed by BITSOL MARKETING",
  },
} as const;

/** Read a public branding value, allowing env overrides at build time. */
export const brandName =
  process.env.NEXT_PUBLIC_BRAND_NAME ?? BRANDING.developer.name;
export const brandUrl =
  process.env.NEXT_PUBLIC_BRAND_URL ?? BRANDING.developer.url;
export const brandTagline =
  process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? BRANDING.developer.tagline;
