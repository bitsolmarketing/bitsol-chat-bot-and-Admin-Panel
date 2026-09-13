"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BitsolBranding } from "@/components/branding/BitsolBranding";
import { Logo } from "@/components/branding/Logo";
import { BRAND } from "@/lib/brands";
import { cn } from "@/lib/utils";

/** Roles that land in the admin console rather than the public chat. */
const STAFF_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

const CONSOLE_POINTS = [
  "Every lead, quote and meeting in one pipeline",
  "Live web and WhatsApp conversations",
  "Broadcasts through Meta-approved templates",
  "Reports on what the assistant is winning",
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email: form.get("email"), password: form.get("password") }
        : {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
            phone: form.get("phone") || undefined,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");

      // Honour ?next=… when the admin console bounced us here, otherwise send
      // staff to the console and everyone else to the assistant.
      const next = new URLSearchParams(window.location.search).get("next");
      const role: string | undefined = data?.user?.role;
      router.push(next ?? (role && STAFF_ROLES.includes(role) ? "/admin" : "/chat"));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark grid min-h-dvh bg-background text-foreground lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="brand-gradient relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <Logo descriptor="Marketing" size="lg" />
        </div>

        <div className="relative max-w-lg">
          <p className="eyebrow">Admin console</p>
          <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[1.05] tracking-tightest text-white">
            The command centre for <span className="text-gradient">{BRAND.name}.</span>
          </h1>
          <ul className="mt-10 space-y-3.5">
            {CONSOLE_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-[15px] text-white/70">
                <CheckCircle2 className="size-5 shrink-0 text-brand-cyan" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <BitsolBranding className="relative justify-start text-white/50" />
      </aside>

      {/* Form */}
      <main className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo descriptor="Marketing" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-2 text-sm text-white/50">
            {mode === "login"
              ? "Sign in to continue to the console."
              : "Register to keep your conversations with us."}
          </p>

          <div className="mt-8 flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition",
                  mode === m ? "bg-white text-brand-ink shadow-soft" : "text-white/55 hover:text-white"
                )}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "register" && (
              <>
                <Input
                  name="name"
                  placeholder="Full name"
                  autoComplete="name"
                  required
                  minLength={2}
                  className="h-12 border-white/10 bg-white/[0.03]"
                />
                <Input
                  name="phone"
                  placeholder="Phone (optional)"
                  autoComplete="tel"
                  className="h-12 border-white/10 bg-white/[0.03]"
                />
              </>
            )}
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              className="h-12 border-white/10 bg-white/[0.03]"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "register" ? 8 : 1}
              className="h-12 border-white/10 bg-white/[0.03]"
            />

            {error && (
              <p className="rounded-xl bg-destructive/15 px-3 py-2 text-sm text-rose-300">{error}</p>
            )}

            <Button type="submit" variant="brand" size="lg" className="mt-2 w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "login" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-white/45">
            No account needed to chat —{" "}
            <Link href="/chat" className="font-semibold text-white hover:text-brand-cyan">
              open the concierge
            </Link>
          </p>

          <div className="mt-10 flex justify-center lg:hidden">
            <BitsolBranding variant="stacked" />
          </div>
        </div>
      </main>
    </div>
  );
}
