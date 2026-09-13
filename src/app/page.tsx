import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Languages,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SplashScreen } from "@/components/splash/SplashScreen";
import { SiteHeader } from "@/components/branding/SiteHeader";
import { Footer } from "@/components/branding/Footer";
import { LogoMark } from "@/components/branding/Logo";
import { BRAND } from "@/lib/brands";
import { MARKETING_SERVICES } from "@/data/marketing/services";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SEO,
  conciergeJsonLd,
  organizationRef,
  serviceCatalogJsonLd,
  websiteJsonLd,
} from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SEO.homeTitle },
  description: SEO.homeDescription,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: SEO.homeTitle, description: SEO.homeDescription },
};

/** Facts, not flourishes — every figure here is true of the product today. */
const PROOF = [
  { value: `${MARKETING_SERVICES.length}`, label: "Disciplines under one roof" },
  { value: "24/7", label: "AI concierge, never offline" },
  { value: "4", label: "Languages spoken fluently" },
  { value: "100%", label: "Ownership handed to you" },
];

const STANDARD = [
  {
    title: "We build and we market",
    body: "Most agencies do one or the other. We design your brand, engineer the software and run the campaigns that fill it — so nothing falls between vendors.",
  },
  {
    title: "AI is our core, not an add-on",
    body: "We ship production AI systems. Automation advice comes from delivery experience, not a sales deck.",
  },
  {
    title: "You own everything",
    body: "Source code, design files, ad accounts and data are yours — created in your name from day one, transferred in full at handover.",
  },
  {
    title: "We report honestly",
    body: "Clear numbers, plain language and trade-offs explained — including when something isn't working and what we'll change.",
  },
];

const PROCESS = [
  { title: "Discovery call", body: "A free 30-minute conversation about your goal, current setup and constraints." },
  { title: "Proposal & quote", body: "Scope, deliverables, timeline and a fixed price — usually within 2–3 working days." },
  { title: "Kickoff", body: "Milestones agreed, project channel opened and a named point of contact assigned." },
  { title: "Delivery in milestones", body: "You review and approve at every stage, not just at the end." },
  { title: "Launch & handover", body: "Files, access, training and documentation transferred to you." },
  { title: "Ongoing partnership", body: "Optional care plans and retainers to keep compounding results." },
];

const CONCIERGE = [
  { icon: FileText, title: "Quotes, not guesswork", body: "Scopes your project and files a quote request with a reference number." },
  { icon: CalendarCheck, title: "Consultations booked", body: "Office, Zoom, Google Meet or WhatsApp — confirmed by our team." },
  { icon: LifeBuoy, title: "Support, tracked", body: "Existing clients raise tickets that route straight to the right people." },
  { icon: Languages, title: "Fluent in four languages", body: "English, Urdu, Roman Urdu and Punjabi — it mirrors how you write." },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        graph={[
          { ...organizationRef, hasOfferCatalog: { "@id": serviceCatalogJsonLd()["@id"] } },
          websiteJsonLd(),
          conciergeJsonLd(),
          serviceCatalogJsonLd(),
        ]}
      />
      <SplashScreen />

      <div className="dark min-h-dvh bg-background text-foreground">
        <SiteHeader />

        <main>
          {/* ------------------------------------------------------------ Hero */}
          <section className="brand-gradient relative overflow-hidden">
            <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
            <div className="container relative grid items-center gap-14 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.15fr_1fr] lg:pb-32">
              <div className="animate-fade-in-up">
                <p className="eyebrow">{BRAND.name} · AI-first growth partner</p>
                <h1 className="mt-6 text-balance text-[2.6rem] font-extrabold leading-[1.05] tracking-tightest text-white sm:text-6xl lg:text-[4.25rem]">
                  Growth, engineered with{" "}
                  <span className="text-gradient">artificial intelligence.</span>
                </h1>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/65">
                  We design, build and market the systems that grow ambitious businesses — AI
                  chatbots and agents, WhatsApp automation, software, and brands people remember.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/chat"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-semibold text-white shadow-brand transition hover:brightness-110"
                  >
                    <Sparkles className="size-4" /> Speak with our AI concierge
                  </Link>
                  <Link
                    href="#services"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 text-[15px] font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/[0.07]"
                  >
                    Explore services
                  </Link>
                </div>

                <dl className="mt-14 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/[0.08] pt-8 sm:grid-cols-4">
                  {PROOF.map((item) => (
                    <div key={item.label}>
                      <dt className="sr-only">{item.label}</dt>
                      <dd className="text-3xl font-bold tracking-tight text-white">{item.value}</dd>
                      <p className="mt-1 text-[11px] leading-snug text-white/45">{item.label}</p>
                    </div>
                  ))}
                </dl>
              </div>

              <ConciergePreview />
            </div>
          </section>

          {/* --------------------------------------------------------- Marquee */}
          <div className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-5">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap pr-10">
              {[...MARKETING_SERVICES, ...MARKETING_SERVICES].map((service, index) => (
                <span
                  key={`${service.slug}-${index}`}
                  className="inline-flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.2em] text-white/35"
                >
                  {service.name}
                  <span className="size-1 rounded-full bg-brand-cyan/70" aria-hidden />
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </div>

          {/* -------------------------------------------------------- Services */}
          <section id="services" className="container scroll-mt-24 py-24 md:py-32">
            <SectionHeading
              eyebrow="What we do"
              title={
                <>
                  {MARKETING_SERVICES.length} disciplines.{" "}
                  <span className="text-white/45">One accountable partner.</span>
                </>
              }
              body="From the first automation to the full brand system, every engagement is run by one team that answers for the outcome."
            />

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MARKETING_SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href="/chat"
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:bg-white/[0.045] hover:shadow-glow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan/80">
                      {service.group}
                    </span>
                    <ArrowUpRight className="size-4 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-white">{service.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{service.tagline}</p>
                  <p className="mt-6 border-t border-white/[0.06] pt-4 text-xs text-white/40">
                    <span className="font-semibold text-white/80">{service.pricing.startingAt}</span>{" "}
                    · {service.pricing.model}
                  </p>
                </Link>
              ))}

              <Link
                href="/chat"
                className="ring-gradient group relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue/20 via-brand-violet/15 to-transparent p-7 transition hover:-translate-y-1 sm:col-span-2 md:flex-row md:items-center lg:col-span-3"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Not sure where to start?
                  </span>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                    Describe the goal. We&apos;ll recommend the route.
                  </h3>
                </div>
                <span className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 text-sm font-semibold text-brand-ink md:self-auto">
                  Ask the concierge
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>

            <p className="mt-6 text-center text-[11px] text-white/35">
              Prices are indicative starting points. Every engagement receives a written, fixed
              quotation.
            </p>
          </section>

          {/* -------------------------------------------------------- Standard */}
          <section id="standard" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.015]">
            <div className="container grid gap-14 py-24 md:py-32 lg:grid-cols-[1fr_1.4fr]">
              <SectionHeading
                align="left"
                eyebrow="The BITSOL standard"
                title={
                  <>
                    Held to the standard of a firm{" "}
                    <span className="text-gradient">many times our size.</span>
                  </>
                }
                body="Four commitments shape every engagement — and they're written into how we work, not just how we pitch."
              />

              <ol className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2">
                {STANDARD.map((item, index) => (
                  <li key={item.title} className="bg-background p-7">
                    <span className="font-mono text-xs font-semibold text-brand-cyan">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-lg font-bold tracking-tight text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* --------------------------------------------------------- Process */}
          <section id="process" className="container scroll-mt-24 py-24 md:py-32">
            <SectionHeading
              eyebrow="How an engagement runs"
              title={
                <>
                  A clear path from first call{" "}
                  <span className="text-white/45">to compounding results.</span>
                </>
              }
            />

            <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PROCESS.map((step, index) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-brand">
                      {index + 1}
                    </span>
                    <h3 className="text-base font-bold tracking-tight text-white">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/55">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ------------------------------------------------------- Concierge */}
          <section className="border-t border-white/[0.06] bg-white/[0.015]">
            <div className="container grid items-center gap-14 py-24 md:py-32 lg:grid-cols-2">
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="The AI concierge"
                  title={
                    <>
                      Your first meeting with BITSOL{" "}
                      <span className="text-gradient">can happen right now.</span>
                    </>
                  }
                  body="Our concierge answers from BITSOL's own knowledge — services, process and indicative pricing — and turns a conversation into action, day or night."
                />
                <Link
                  href="/chat"
                  className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-semibold text-white shadow-brand transition hover:brightness-110"
                >
                  Start a conversation
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {CONCIERGE.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/[0.07] bg-background/60 p-6 transition hover:border-white/15"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-blue/25 to-brand-violet/25 text-brand-cyan ring-1 ring-inset ring-white/10">
                      <item.icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-base font-bold tracking-tight text-white">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------- CTA */}
          <section className="container py-24 md:py-32">
            <div className="ring-gradient relative overflow-hidden rounded-[2rem] bg-brand-slate/60 px-6 py-16 text-center sm:px-12 md:py-20">
              <div className="brand-gradient pointer-events-none absolute inset-0 opacity-70" aria-hidden />
              <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative mx-auto max-w-3xl">
                <p className="eyebrow justify-center">Begin</p>
                <h2 className="mt-5 text-balance text-4xl font-extrabold leading-tight tracking-tightest text-white md:text-5xl">
                  Your next stage of growth starts with one conversation.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-white/60">
                  Tell us where you want to be. We&apos;ll show you the fastest credible way to get
                  there — with a fixed quotation, not a vague estimate.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/chat"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-brand-ink transition hover:bg-white/90"
                  >
                    <MessageCircle className="size-4" /> Talk to the concierge
                  </Link>
                  <a
                    href={`tel:${BRAND.contact.phone.replace(/\s/g, "")}`}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 text-[15px] font-semibold text-white transition hover:bg-white/[0.08]"
                  >
                    <Phone className="size-4" /> {BRAND.contact.phone}
                  </a>
                </div>
                <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/45">
                  <Mail className="size-3.5" /> {BRAND.contact.email}
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-xl"}>
      <p className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p>
      <h2 className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] tracking-tightest text-white md:text-5xl">
        {title}
      </h2>
      {body && <p className="mt-5 text-pretty text-base leading-relaxed text-white/55">{body}</p>}
    </div>
  );
}

/** A still frame of the concierge doing what it does — shown, not described. */
function ConciergePreview() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-in-up [animation-delay:120ms]">
      <div className="absolute -inset-10 rounded-full bg-brand-violet/20 blur-3xl" aria-hidden />

      <div className="ring-gradient relative overflow-hidden rounded-3xl bg-brand-slate/70 shadow-glow backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <span className="grid size-9 place-items-center rounded-full bg-brand-ink ring-1 ring-brand-cyan/30">
            <LogoMark className="size-8" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">AI Concierge</p>
            <p className="text-[11px] text-white/45">{BRAND.name}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            Online
          </span>
        </div>

        <div className="space-y-4 px-5 pb-14 pt-6 text-[13px] leading-relaxed">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-white shadow-brand">
            Mujhe apne business ke liye WhatsApp automation chahiye.
          </p>
          <div className="w-fit max-w-[92%] rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-white/85">
            <p>
              Bilkul. <strong className="text-white">WhatsApp Automation</strong> se aap ke
              customers ko 24/7 jawab, order updates aur reminders milte hain.
            </p>
            <p className="mt-2 flex gap-2">
              <span className="text-brand-cyan">•</span> Indicative price PKR 85,000 se shuru
            </p>
            <p className="mt-1 flex gap-2">
              <span className="text-brand-cyan">•</span> Aam taur par 2–4 hafton mein live
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-brand-cyan/40 bg-brand-cyan/[0.08] px-3 py-1 text-[11px] font-medium text-white">
              Request a quote
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/65">
              Book a consultation
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-7 -left-3 flex animate-float items-center gap-3 rounded-2xl border border-white/10 bg-brand-ink/90 px-4 py-3 shadow-elevated backdrop-blur sm:-left-10">
        <CheckCircle2 className="size-5 text-emerald-400" />
        <div className="leading-tight">
          <p className="text-xs font-semibold text-white">Quote request logged</p>
          <p className="font-mono text-[10px] text-white/45">BM-LEAD-7F3K2Q9A</p>
        </div>
      </div>

      <div className="absolute -right-3 -top-5 flex animate-float items-center gap-2 rounded-full border border-white/10 bg-brand-ink/90 px-3.5 py-2 shadow-elevated backdrop-blur [animation-delay:1.5s] sm:-right-8">
        <ShieldCheck className="size-4 text-brand-cyan" />
        <span className="text-[11px] font-medium text-white/80">Grounded in BITSOL&apos;s knowledge</span>
      </div>
    </div>
  );
}
