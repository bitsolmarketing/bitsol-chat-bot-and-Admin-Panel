import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { label: "Services", href: "/#services" },
  { label: "Our standard", href: "/#standard" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/about" },
];

/** Public navigation bar, shared by the landing and about pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-brand-ink/70 backdrop-blur-xl">
      <div className="container flex h-[4.5rem] items-center justify-between gap-6">
        <Logo descriptor="Marketing" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-white/65 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-white/65 transition hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/chat"
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-[13px] font-semibold text-white shadow-brand transition hover:brightness-110"
          >
            Talk to our AI
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
