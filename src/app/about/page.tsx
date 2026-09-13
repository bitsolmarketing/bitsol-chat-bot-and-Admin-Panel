import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bot,
  Globe,
  Languages,
  Lock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/branding/SiteHeader";
import { Footer } from "@/components/branding/Footer";
import { BRANDING, brandName, brandTagline, brandUrl } from "@/lib/branding";
import { BRAND } from "@/lib/brands";
import { JsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGE, ORGANIZATION_ID, SITE_URL, absoluteUrl, breadcrumbJsonLd, conciergeJsonLd } from "@/lib/site";

const ABOUT_TITLE = "About the AI Concierge";
const ABOUT_DESCRIPTION = `Meet the ${BRAND.name} AI concierge: grounded answers, quotes, consultations and support tickets on web and WhatsApp, 24/7, in four languages.`;

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: `${ABOUT_TITLE} | ${BRAND.name}`, description: ABOUT_DESCRIPTION, images: [OG_IMAGE] },
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "Grounded answers",
    desc: "Replies are drawn from BITSOL Marketing's approved knowledge base first — services, process, policies and indicative pricing — never invented.",
  },
  {
    icon: Bot,
    title: "Actions, not just answers",
    desc: "Quote requests, consultations and support tickets are created with real reference numbers and routed straight to the team.",
  },
  {
    icon: Languages,
    title: "Four languages",
    desc: "English, Urdu, Roman Urdu and Punjabi — tolerant of spelling mistakes, abbreviations and mixed-language messages.",
  },
  {
    icon: MessageCircle,
    title: "Web and WhatsApp",
    desc: "The same concierge answers on this site and on the BITSOL WhatsApp number, so the answer never depends on the channel.",
  },
  {
    icon: Globe,
    title: "Always available",
    desc: "A lead at 2am is captured as reliably as one at 2pm, and it is waiting for the team when the office opens.",
  },
  {
    icon: Lock,
    title: "Secure by design",
    desc: "Rate limiting, signed sessions, role-based access, validated input and a full audit trail across every module.",
  },
];

export default function AboutPage() {
  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <JsonLd
        graph={[
          {
            "@type": "AboutPage",
            "@id": `${absoluteUrl("/about")}#page`,
            url: absoluteUrl("/about"),
            name: ABOUT_TITLE,
            description: ABOUT_DESCRIPTION,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": ORGANIZATION_ID },
            mainEntity: { "@id": conciergeJsonLd()["@id"] },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      <SiteHeader />

      <main>
        <section className="brand-gradient relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="container relative max-w-4xl py-24 text-center md:py-32">
            <p className="eyebrow justify-center">About</p>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tightest text-white md:text-6xl">
              A firm built on AI —{" "}
              <span className="text-gradient">with a concierge to match.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/60">
              {BRAND.description}
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              {BRAND.purpose.join(" · ")}
            </p>
          </div>
        </section>

        <section className="container py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow justify-center">{BRANDING.product.name}</p>
            <h2 className="mt-5 text-balance text-4xl font-extrabold leading-tight tracking-tightest text-white">
              What the concierge does for you
            </h2>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 transition hover:border-white/15"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-blue/25 to-brand-violet/25 text-brand-cyan ring-1 ring-inset ring-white/10">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <div className="ring-gradient relative overflow-hidden rounded-[2rem] bg-brand-slate/60 p-10 md:p-14">
            <div className="brand-gradient pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="relative grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="eyebrow">{BRANDING.product.poweredBy}</p>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">{brandTagline}</h2>
                <p className="mt-4 text-sm text-white/55">
                  Designed &amp; developed by{" "}
                  <Link
                    href={brandUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-brand-cyan"
                  >
                    {brandName}
                  </Link>
                  .
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/chat"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-brand-ink transition hover:bg-white/90"
                >
                  Try the concierge
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
