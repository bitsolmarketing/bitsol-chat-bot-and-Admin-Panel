"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Select, Textarea } from "@/components/ui/field";
import type { Department } from "@/lib/brands";

/**
 * =============================================================================
 *  Broadcast composer
 * =============================================================================
 *
 *  Four decisions, in the order they actually matter: which approved template,
 *  what fills its placeholders, who receives it, and — separately, from the
 *  campaign's own row — whether to send.
 *
 *  Creating never sends. The audience count is fetched live as the filter
 *  changes, so the number on screen is the number of people who will be
 *  messaged, and it is fetched from the server rather than estimated here
 *  because opt-outs and blocks are applied in the same query that builds the
 *  recipient list.
 * =============================================================================
 */

export interface ComposerTemplate {
  id: string;
  name: string;
  metaName: string;
  languageCode: string;
  body: string;
  headerText: string | null;
  /** TEXT, IMAGE, VIDEO, DOCUMENT — or null when the template has no header. */
  headerFormat: string | null;
  footerText: string | null;
  variables: string[];
  department: Department | null;
}

type ParameterKind = "contactName" | "static" | "contactPhone";

interface ParameterDraft {
  kind: ParameterKind;
  value: string;
  fallback: string;
}

const PARAMETER_LABELS: Record<ParameterKind, string> = {
  contactName: "Contact's WhatsApp name",
  static: "The same text for everyone",
  contactPhone: "Contact's phone number",
};

/** Header formats that carry a file Meta needs handed to it on every send. */
const MEDIA_HEADERS = new Set(["IMAGE", "VIDEO", "DOCUMENT"]);

function countPlaceholders(text: string): number {
  const found = text.match(/\{\{\s*(\d+)\s*\}\}/g);
  if (!found) return 0;
  return Math.max(...found.map((token) => Number(token.replace(/\D/g, "")) || 0));
}

/** Mirrors the server's preview so the composer and the saved row agree. */
function render(body: string, values: string[]): string {
  return body.replace(/\{\{\s*(\d+)\s*\}\}/g, (match, index: string) => {
    const value = values[Number(index) - 1];
    return value?.trim() ? value : match;
  });
}

export function BroadcastComposer({
  templates,
  department,
}: {
  /** Approved templates only — nothing else can be broadcast. */
  templates: ComposerTemplate[];
  department: Department | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [business, setBusiness] = useState<Department>(department ?? "MARKETING");
  const [templateId, setTemplateId] = useState("");
  const [parameters, setParameters] = useState<ParameterDraft[]>([]);
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [includeUnrouted, setIncludeUnrouted] = useState(false);
  const [activeWithinDays, setActiveWithinDays] = useState<string>("");
  const [limit, setLimit] = useState<string>("");

  const [reach, setReach] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);

  // A template assigned to the other business would be refused by the server;
  // hiding it here means the picker never offers a dead end.
  const available = useMemo(
    () => templates.filter((t) => !t.department || t.department === business),
    [templates, business]
  );

  const template = available.find((t) => t.id === templateId) ?? null;
  const placeholders = template ? countPlaceholders(template.body) : 0;
  const needsMedia = Boolean(
    template?.headerFormat && MEDIA_HEADERS.has(template.headerFormat.toUpperCase())
  );

  // Resize the parameter list whenever the chosen template changes, keeping
  // whatever the person already typed for the slots that still exist.
  useEffect(() => {
    setParameters((current) =>
      Array.from(
        { length: placeholders },
        (_, index) =>
          current[index] ?? { kind: "contactName" as ParameterKind, value: "", fallback: "there" }
      )
    );
  }, [placeholders, templateId]);

  // Clear a selection that the business switch just made invalid.
  useEffect(() => {
    if (templateId && !available.some((t) => t.id === templateId)) setTemplateId("");
  }, [available, templateId]);

  // Live audience count. Debounced because the day and limit fields fire on
  // every keystroke, and each change is a database count.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCounting(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/broadcasts/audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department: business,
            includeUnrouted,
            activeWithinDays: activeWithinDays ? Number(activeWithinDays) : null,
            limit: limit ? Number(limit) : null,
          }),
        });
        const data = (await res.json().catch(() => null)) as { count?: number } | null;
        if (!cancelled) setReach(res.ok ? (data?.count ?? 0) : null);
      } catch {
        if (!cancelled) setReach(null);
      } finally {
        if (!cancelled) setCounting(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, business, includeUnrouted, activeWithinDays, limit]);

  const previewValues = parameters.map((parameter) =>
    parameter.kind === "static"
      ? parameter.value.trim() || "…"
      : parameter.kind === "contactPhone"
        ? "+923001234567"
        : "Ali"
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!template) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          department: business,
          templateId: template.id,
          headerMediaUrl: needsMedia ? headerMediaUrl.trim() : undefined,
          parameters: parameters.map((parameter) =>
            parameter.kind === "static"
              ? { kind: "static", value: parameter.value.trim() }
              : parameter.kind === "contactPhone"
                ? { kind: "contactPhone" }
                : { kind: "contactName", fallback: parameter.fallback.trim() || undefined }
          ),
          audience: {
            includeUnrouted,
            activeWithinDays: activeWithinDays ? Number(activeWithinDays) : null,
            limit: limit ? Number(limit) : null,
          },
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        reference?: string;
        recipients?: number;
      } | null;
      if (!res.ok) throw new Error(data?.error ?? "Could not create that broadcast.");

      setNotice(
        `Draft ${data?.reference ?? ""} created for ${data?.recipients ?? 0} contacts. ` +
          "Nothing has been sent — use Send on its row when you are ready."
      );
      setTitle("");
      setTemplateId("");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create that broadcast.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Megaphone className="size-4" /> New broadcast
        </Button>
        {notice && (
          <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
            {notice}
          </p>
        )}
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="rounded-xl border bg-secondary/40 p-4">
        <p className="text-xs text-muted-foreground">
          No approved templates yet. A broadcast reaches people outside the 24-hour reply
          window, so Meta only allows it through a template it has approved — sync or submit
          one from WhatsApp Templates first.
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border bg-secondary/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Campaign name" required hint="Internal only — recipients never see it.">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="March intake — fee reminder"
            required
          />
        </Field>

        <Field label="Business" required>
          <Select
            value={business}
            onChange={(e) => setBusiness(e.target.value as Department)}
            disabled={Boolean(department)}
          >
            <option value="MARKETING">BITSOL Marketing</option>
            <option value="INSTITUTE">BITSOL Institute</option>
          </Select>
        </Field>
      </div>

      <Field label="Approved template" required>
        <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
          <option value="">Choose a template…</option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} ({option.languageCode})
            </option>
          ))}
        </Select>
      </Field>

      {template && (
        <>
          {needsMedia && (
            <Field
              label={`${template.headerFormat?.toLowerCase() ?? "media"} header`}
              required
              hint="Meta approves the format of a media header but never keeps the file, so it must be sent with every message. Paste a public URL, or a media ID already uploaded to the account."
            >
              <Input
                type="url"
                value={headerMediaUrl}
                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                placeholder="https://bitsolmarketing.com/campaign/banner.png"
                required
              />
            </Field>
          )}

          {placeholders > 0 && (
            <div className="space-y-2 rounded-xl border bg-background p-3">
              <p className="text-xs font-medium">Fill the template's values</p>
              {parameters.map((parameter, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr]">
                  <div className="flex items-center">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
                      {`{{${index + 1}}}`}
                    </span>
                    <span className="ml-1.5 truncate text-[11px] text-muted-foreground">
                      {template.variables[index] ?? ""}
                    </span>
                  </div>

                  <Select
                    value={parameter.kind}
                    onChange={(e) =>
                      setParameters((current) => {
                        const next = [...current];
                        next[index] = { ...next[index], kind: e.target.value as ParameterKind };
                        return next;
                      })
                    }
                    className="h-9 text-xs"
                    aria-label={`Source for placeholder ${index + 1}`}
                  >
                    {Object.entries(PARAMETER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>

                  {parameter.kind === "static" ? (
                    <Input
                      value={parameter.value}
                      onChange={(e) =>
                        setParameters((current) => {
                          const next = [...current];
                          next[index] = { ...next[index], value: e.target.value };
                          return next;
                        })
                      }
                      placeholder="Text sent to everyone"
                      className="h-9 text-xs"
                      required
                    />
                  ) : parameter.kind === "contactName" ? (
                    <Input
                      value={parameter.fallback}
                      onChange={(e) =>
                        setParameters((current) => {
                          const next = [...current];
                          next[index] = { ...next[index], fallback: e.target.value };
                          return next;
                        })
                      }
                      placeholder="Fallback when they have no profile name"
                      className="h-9 text-xs"
                    />
                  ) : (
                    <p className="self-center text-[11px] text-muted-foreground">
                      Filled from each contact.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Field label="What each person receives">
            <Textarea
              value={
                (template.headerText ? `${template.headerText}\n\n` : "") +
                render(template.body, previewValues) +
                (template.footerText ? `\n\n${template.footerText}` : "")
              }
              readOnly
              className="min-h-[96px] bg-background text-xs"
            />
          </Field>
        </>
      )}

      <div className="space-y-2.5 rounded-xl border bg-background p-3">
        <p className="text-xs font-medium">Audience</p>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={includeUnrouted}
            onChange={(e) => setIncludeUnrouted(e.target.checked)}
            className="size-3.5 accent-[hsl(var(--primary))]"
          />
          Also include contacts who have not been routed to a business yet
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <Field
            label="Only contacts active in the last…"
            hint="Days. Leave blank for everyone. A number that has been silent for a year is the one most likely to report the message."
          >
            <Input
              type="number"
              min={1}
              max={3650}
              value={activeWithinDays}
              onChange={(e) => setActiveWithinDays(e.target.value)}
              placeholder="90"
              className="h-9 text-xs"
            />
          </Field>

          <Field label="Cap the number of recipients" hint="Blank means no cap.">
            <Input
              type="number"
              min={1}
              max={5000}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="500"
              className="h-9 text-xs"
            />
          </Field>
        </div>

        <p className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs">
          {counting ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Users className="size-3.5 text-muted-foreground" />
          )}
          {reach === null ? (
            <span className="text-muted-foreground">Counting the audience…</span>
          ) : (
            <span>
              <span className="font-semibold">{reach}</span> contact{reach === 1 ? "" : "s"} will
              be messaged. Opted-out and blocked numbers are already excluded.
            </span>
          )}
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-2 border-t pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={
            saving ||
            !template ||
            !title.trim() ||
            reach === 0 ||
            (needsMedia && !headerMediaUrl.trim())
          }
          className="gap-1.5"
        >
          {saving && <Loader2 className="size-4 animate-spin" />} Save as draft
        </Button>
      </div>
    </form>
  );
}
