/**
 * =============================================================================
 *  BITSOL Marketing — brand profile
 * =============================================================================
 *
 *  The assistant, the WhatsApp number and the admin console all serve one
 *  business. Everything that names it — voice, positioning, contact details,
 *  reference-number prefix — is read from this file, so no module hard-codes it.
 *
 *  Why a `department` still exists
 *  -------------------------------
 *  This product used to serve a second business, BITSOL Institute, from the
 *  same database. Its records were kept when it was retired: they sit in the
 *  same shared tables (conversations, tickets, templates…) and are told apart by
 *  a `department` column. So every record the app writes is stamped
 *  `DEPARTMENT`, and every admin query filters to it (see `lib/admin/queries`),
 *  which keeps the archived rows in the database and out of every screen.
 *
 *  This file is isomorphic (no server-only imports) so client components can
 *  read the same profile.
 * =============================================================================
 */

/** The `department` value stamped on every record this app writes. */
export const DEPARTMENT = "MARKETING" as const;

export type Department = typeof DEPARTMENT;

export interface BrandContact {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  hours: string;
  website: string;
}

export interface BrandProfile {
  /** Full public name. */
  name: string;
  /** Compact name for headers and chips. */
  shortName: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Two-sentence description used on the landing page and in the AI prompt. */
  description: string;
  /** What the business does — fed to the system prompt as scope. */
  purpose: readonly string[];
  /** Prefix for every reference id the business generates (leads, tickets…). */
  referencePrefix: string;
  contact: BrandContact;
}

/**
 * NOTE ON ACCURACY — the phone/WhatsApp number is BITSOL's live business line.
 * The remaining contact fields are representative defaults and should be
 * confirmed before go-live.
 *
 * All of it is overridable at runtime from Admin → Settings (`settings` table).
 * The assistant is explicitly instructed never to invent contact details beyond
 * what is supplied here.
 */
export const BRAND: BrandProfile = {
  name: "BITSOL Marketing",
  shortName: "BITSOL Marketing",
  tagline: "Business growth, engineered with Artificial Intelligence.",
  description:
    "BITSOL Marketing is a full-service digital and AI solutions company. We build AI chatbots, WhatsApp automation, AI agents, websites, mobile apps and complete brand systems for businesses that want to grow faster with less manual work.",
  purpose: [
    "Business Services",
    "Digital Solutions",
    "AI Automation",
    "Software Development",
  ],
  referencePrefix: "BM",
  contact: {
    phone: "+92 312 0141581",
    whatsapp: "+92 312 0141581",
    email: "info@bitsolmarketing.com",
    address: "BITSOL Marketing, Faisalabad",
    city: "Faisalabad, Pakistan",
    hours: "Monday–Saturday, 10:00 AM – 7:00 PM (PKT)",
    website: "https://bitsolmarketing.com",
  },
};
