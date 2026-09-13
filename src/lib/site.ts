import { BRAND } from "@/lib/brands";
import { MARKETING_SERVICES } from "@/data/marketing/services";

/**
 * Public, canonical identity of this site for search engines.
 *
 * Canonical URLs, the sitemap, robots.txt and structured data all need one
 * absolute origin. `NEXT_PUBLIC_APP_URL` wins when it is set to a real host; a
 * missing or localhost value falls back to production, so a host that forgot
 * the variable never publishes `http://localhost:3000` as its canonical URL.
 */
const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const SITE_URL = (
  envUrl && !/localhost|127\.0\.0\.1/.test(envUrl) ? envUrl : "https://ai.bitsolmarketing.com"
).replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * The company itself is described once, on bitsolmarketing.com. This site
 * references that record by `@id` instead of repeating address, phone and hours,
 * so the two sites can never publish conflicting business details.
 */
export const ORGANIZATION_ID = "https://bitsolmarketing.com/#organization";

export const SAME_AS = [
  "https://bitsolmarketing.com",
  "https://www.facebook.com/bitsolmarketing/",
  "https://www.linkedin.com/company/bitsolpvtltd/",
  "https://www.instagram.com/bitsol_marketing/",
];

export const SEO = {
  homeTitle: "AI Chatbots, WhatsApp Automation & AI Agents | BITSOL Marketing",
  homeDescription:
    "Talk to BITSOL Marketing's AI concierge 24/7 for AI chatbots, WhatsApp automation, AI agents, websites and digital marketing. Free quotes and consultations.",
  ogAlt: `${BRAND.name} AI concierge: AI chatbots, WhatsApp automation and AI agents`,
};

/**
 * A page that sets its own `openGraph` replaces the root one, which drops the
 * generated share image, so pages spread this back in.
 */
export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SEO.ogAlt };

/** Every public, indexable route. The sitemap is generated from this list. */
export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/chat", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
] as const;

/** Organization reference plus the fields that are true on both sites. */
export const organizationRef = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: BRAND.name,
  url: BRAND.contact.website,
  email: BRAND.contact.email,
  sameAs: SAME_AS,
};

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: `${BRAND.name} AI Concierge`,
    description: SEO.homeDescription,
    inLanguage: ["en", "ur"],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function conciergeJsonLd() {
  return {
    "@type": "WebApplication",
    "@id": `${SITE_URL}/chat#app`,
    name: `${BRAND.name} AI Concierge`,
    url: absoluteUrl("/chat"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    availableLanguage: ["English", "Urdu", "Roman Urdu", "Punjabi"],
    description:
      "An AI assistant that answers questions about BITSOL Marketing's services, gives indicative pricing, files quote requests and books consultations, 24/7.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
    provider: { "@id": ORGANIZATION_ID },
  };
}

/** The service catalogue, with the indicative starting price where it is numeric. */
export function serviceCatalogJsonLd() {
  return {
    "@type": "OfferCatalog",
    "@id": `${SITE_URL}/#services`,
    name: `${BRAND.name} services`,
    itemListElement: MARKETING_SERVICES.map((service, index) => {
      const amount = service.pricing.startingAt.match(/[\d,]+/)?.[0]?.replace(/,/g, "");
      return {
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service.name,
          serviceType: service.group,
          description: service.overview,
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "Pakistan" },
        },
        ...(amount
          ? {
              priceSpecification: {
                "@type": "PriceSpecification",
                minPrice: Number(amount),
                priceCurrency: "PKR",
              },
            }
          : {}),
      };
    }),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
