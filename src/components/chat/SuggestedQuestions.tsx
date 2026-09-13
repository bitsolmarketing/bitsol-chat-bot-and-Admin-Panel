"use client";

import {
  ArrowUpRight,
  Bot,
  CalendarCheck,
  FileText,
  Globe,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { MARKETING_SUGGESTIONS } from "@/data/marketing/menu";
import { t, type Language } from "@/lib/i18n";

/** One icon per suggestion, in the order they are defined in `menu.ts`. */
const ICONS = [Bot, MessageCircle, TrendingUp, Globe, FileText, CalendarCheck];

/** Empty-state suggestion grid — the six conversations people most often start. */
export function SuggestedQuestions({
  language = "en",
  onPick,
}: {
  language?: Language;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {t("chat.tryAsking", language)}
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {MARKETING_SUGGESTIONS.map((topic, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <button
              key={topic.title}
              type="button"
              onClick={() => onPick(topic.prompt)}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group flex animate-fade-in-up items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-cyan/35 hover:bg-white/[0.05] hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-blue/25 to-brand-violet/25 text-brand-cyan ring-1 ring-inset ring-white/10 transition group-hover:from-brand-blue group-hover:to-brand-violet group-hover:text-white">
                <Icon className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold text-white">{topic.title}</span>
                <span className="urdu truncate text-xs leading-6 text-white/45">{topic.titleUr}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-white/25 transition group-hover:text-brand-cyan" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
