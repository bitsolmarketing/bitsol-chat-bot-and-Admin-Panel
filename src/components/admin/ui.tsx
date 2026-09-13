import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Database, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, humanise } from "@/lib/utils";

/**
 * Shared presentation pieces for the admin console. Server-component friendly
 * (no hooks) so every module page can be a server component that queries
 * Prisma directly and renders without a client bundle.
 */

// ------------------------------------------------------------ PageHeader ----

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  /** Small label above the title — the section of the console. */
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

// --------------------------------------------------------------- StatCard ---

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const body = (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden p-5",
        href && "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-violet/10 text-primary ring-1 ring-inset ring-primary/10">
            <Icon className="size-[18px]" />
          </span>
        )}
      </div>
      <div>
        <p className="text-[1.75rem] font-bold leading-none tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {href && (
        <ArrowUpRight
          className="absolute bottom-4 right-4 size-4 text-muted-foreground/0 transition-colors group-hover:text-primary"
          aria-hidden
        />
      )}
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

// ------------------------------------------------------------- StatusBadge --

const TONE = {
  good: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/15 dark:text-emerald-400",
  bad: "bg-rose-500/10 text-rose-700 ring-rose-600/15 dark:text-rose-400",
  attention: "bg-amber-500/15 text-amber-700 ring-amber-600/20 dark:text-amber-400",
  flight: "bg-sky-500/10 text-sky-700 ring-sky-600/15 dark:text-sky-400",
} as const;

const STATUS_TONES: Record<string, string> = {
  // Positive / terminal-good
  WON: TONE.good,
  RESOLVED: TONE.good,
  ACCEPTED: TONE.good,
  COMPLETED: TONE.good,
  CONFIRMED: TONE.good,
  DELIVERED: TONE.good,
  PUBLISHED: TONE.good,
  SENT: TONE.good,
  ACTIVE: TONE.good,
  // Meta template review, and per-recipient delivery.
  APPROVED: TONE.good,
  READ: TONE.good,
  // Negative / terminal-bad
  LOST: TONE.bad,
  REJECTED: TONE.bad,
  CANCELLED: TONE.bad,
  FAILED: TONE.bad,
  NO_SHOW: TONE.bad,
  URGENT: TONE.bad,
  INACTIVE: TONE.bad,
  // Attention
  PENDING: TONE.attention,
  WAITING_CUSTOMER: TONE.attention,
  ON_HOLD: TONE.attention,
  HIGH: TONE.attention,
  // A template Meta paused for quality still exists but stops going out.
  PAUSED: TONE.attention,
  // In flight
  NEW: TONE.flight,
  OPEN: TONE.flight,
  REQUESTED: TONE.flight,
  SENDING: TONE.flight,
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        STATUS_TONES[value] ?? "bg-secondary text-secondary-foreground ring-border"
      )}
    >
      {humanise(value)}
    </span>
  );
}

// ------------------------------------------------------------ SourceBadge ---

const SOURCE_TONES: Record<string, string> = {
  WHATSAPP: "bg-[#25D366]/10 text-[#128C7E] ring-[#25D366]/25 dark:text-[#25D366]",
  CHATBOT: "bg-primary/10 text-primary ring-primary/15",
};

const SOURCE_ICONS: Record<string, string> = {
  WHATSAPP: "🟢",
  CHATBOT: "🤖",
  WEBSITE: "🌐",
  REFERRAL: "🤝",
  WALK_IN: "🚶",
  SOCIAL: "📣",
  PHONE: "📞",
  OTHER: "•",
};

/**
 * Where a lead came from.
 *
 * WhatsApp is given its own brand colour rather than another grey pill: the
 * whole point of adding the channel is being able to see at a glance how much
 * of the pipeline it is producing.
 */
export function SourceBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        SOURCE_TONES[value] ?? "bg-secondary text-secondary-foreground ring-border"
      )}
    >
      <span aria-hidden>{SOURCE_ICONS[value] ?? "•"}</span>
      {humanise(value)}
    </span>
  );
}

/** Which surface a conversation arrived on — the web widget or WhatsApp. */
export function ChannelBadge({ value }: { value: "WEB" | "WHATSAPP" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        value === "WHATSAPP"
          ? "bg-[#25D366]/10 text-[#128C7E] ring-[#25D366]/25 dark:text-[#25D366]"
          : "bg-secondary text-secondary-foreground ring-border"
      )}
    >
      <span aria-hidden>{value === "WHATSAPP" ? "🟢" : "💬"}</span>
      {value === "WHATSAPP" ? "WhatsApp" : "Web chat"}
    </span>
  );
}

// ----------------------------------------------------------------- Filters --

/**
 * Pill used by every list page's filter row.
 *
 * Lives here because leads and conversations each grew their own copy; a
 * shared one keeps a stage chip and a source chip visually identical.
 */
export function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-brand-ink bg-brand-ink text-white shadow-soft"
          : "bg-card text-foreground/80 hover:border-foreground/20 hover:text-foreground"
      )}
    >
      {label}
      {count != null && (
        <span className={cn("ml-1.5 tabular-nums", active ? "text-brand-cyan" : "text-muted-foreground")}>
          {count}
        </span>
      )}
    </Link>
  );
}

// -------------------------------------------------------------- DataTable ---

export interface Column<T> {
  header: string;
  /** Cell renderer. Keep it presentational — no data fetching here. */
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  rows,
  columns,
  empty = "Nothing here yet.",
  rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  rowKey: (row: T, index: number) => string;
}) {
  if (!rows.length) return <EmptyState message={empty} />;

  return (
    <Card className="overflow-hidden p-0">
      <div className="scroll-slim overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-secondary/60 text-left">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className="border-b transition-colors last:border-0 hover:bg-secondary/40"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn("px-4 py-3.5 align-top", column.className)}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ------------------------------------------------------------- EmptyState ---

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 border-dashed p-12 text-center shadow-none">
      <span className="mb-1 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-violet/10 text-primary">
        <Inbox className="size-5" />
      </span>
      <p className="text-sm font-semibold">{message}</p>
      {hint && <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </Card>
  );
}

// ------------------------------------------------------------- DbNotice -----

/**
 * Shown when a module's query failed — almost always a missing or unreachable
 * DATABASE_URL in local development. Keeps the console usable instead of
 * throwing a 500 on every page.
 */
export function DbNotice({ error }: { error?: string }) {
  return (
    <Card className="mb-6 flex items-start gap-3 border-amber-500/30 bg-amber-500/5 p-4 shadow-none">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
        <Database className="size-4" />
      </span>
      <div className="text-sm">
        <p className="font-semibold">Database unavailable</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This module is showing empty results. Check <code>DATABASE_URL</code>, then run{" "}
          <code>npx prisma migrate deploy</code> and <code>npm run db:seed</code>.
          {error ? ` (${error})` : ""}
        </p>
      </div>
    </Card>
  );
}

// --------------------------------------------------------------- Callout ----

export function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex items-start gap-3 border-primary/20 bg-primary/[0.04] p-4 shadow-none">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <AlertTriangle className="size-4" />
      </span>
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </Card>
  );
}
