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
  /** The WhatsApp Business number the AI assistant answers on — BITSOL's WhatsApp number. */
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
 * NOTE ON ACCURACY — the numbers are BITSOL's live lines: `whatsapp` is the
 * WhatsApp Business number the AI assistant runs on, and the one to share in
 * every WhatsApp link, QR code and ad; `phone` is the business phone. The
 * address and hours are representative defaults and should be confirmed before
 * go-live.
 *
 * The WhatsApp assistant reads its contact details from the chatbot
 * configuration (Admin → Chatbot Studio), which starts from these values. The
 * assistant is explicitly instructed never to invent contact details beyond
 * what is supplied there.
 */
export const BRAND: BrandProfile = {
  name: "BITSOL Marketing",
  shortName: "BITSOL Marketing",
  tagline: "AI-powered growth & digital transformation agency.",
  description:
    "BITSOL Marketing is an AI-powered growth and digital transformation agency serving businesses internationally. We build AI agents, WhatsApp automation, lead generation and digital marketing systems, websites and software that help businesses generate leads, automate operations, improve customer experience and scale.",
  purpose: [
    "AI & Automation",
    "WhatsApp Solutions",
    "Digital Marketing & Growth",
    "Websites & Software",
  ],
  referencePrefix: "BM",
  contact: {
    phone: "+92 342 140 5876",
    whatsapp: "+92 312 0141581",
    email: "info@bitsolmarketing.com",
    address: "BITSOL Marketing, Faisalabad",
    city: "Faisalabad, Pakistan",
    hours: "Monday–Saturday, 10:00 AM – 7:00 PM (PKT)",
    website: "https://bitsolmarketing.com",
  },
};
