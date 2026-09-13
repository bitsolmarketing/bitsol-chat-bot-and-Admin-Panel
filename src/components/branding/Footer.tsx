import Link from "next/link";
import { brandTagline } from "@/lib/branding";
import { BRAND } from "@/lib/brands";
import { MARKETING_SERVICE_GROUPS } from "@/data/marketing/services";
import { BitsolBranding } from "./BitsolBranding";
import { Logo } from "./Logo";

/** Site footer for the public, midnight-surfaced pages. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-brand-ink">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo descriptor="Marketing" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">{BRAND.description}</p>
          <p className="mt-5 text-xs font-medium text-white/35">{BRAND.tagline}</p>
        </div>

        <FooterColumn title="Practice" className="md:col-span-2">
          {MARKETING_SERVICE_GROUPS.map((group) => (
            <li key={group}>
              <Link href="/#services" className="transition hover:text-white">
                {group}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Company" className="md:col-span-2">
          <li>
            <Link href="/about" className="transition hover:text-white">About</Link>
          </li>
          <li>
            <Link href="/#process" className="transition hover:text-white">How we work</Link>
          </li>
          <li>
            <Link href="/chat" className="transition hover:text-white">AI Concierge</Link>
          </li>
          <li>
            <Link href="/login" className="transition hover:text-white">Staff sign in</Link>
          </li>
        </FooterColumn>

        <FooterColumn title="Contact" className="md:col-span-3">
          <li>
            <a href={`tel:${BRAND.contact.phone.replace(/\s/g, "")}`} className="transition hover:text-white">
              {BRAND.contact.phone}
            </a>
          </li>
          <li className="break-all">
            <a href={`mailto:${BRAND.contact.email}`} className="transition hover:text-white">
              {BRAND.contact.email}
            </a>
          </li>
          <li>{BRAND.contact.city}</li>
          <li className="text-white/35">{BRAND.contact.hours}</li>
        </FooterColumn>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container flex flex-col items-center gap-3 py-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-[11px] text-white/35">
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <div className="md:text-right">
            <BitsolBranding className="justify-center md:justify-end" />
            <p className="mt-1 text-[11px] text-white/30">{brandTagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-white/60">{children}</ul>
    </div>
  );
}
