"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sectionSchemas, type SectionKey } from "@/lib/bot/schema";

/**
 * Chatbot Studio's editor for one configuration section.
 *
 * The section is edited as JSON and checked against the same schema the server
 * uses, as you type — so a mistake is pointed out before Save, and Save can
 * only be refused for something the browser cannot see (a reference to a menu
 * item defined in another section).
 */
export function SectionEditor({
  section,
  value,
  defaults,
  customised,
}: {
  section: SectionKey;
  value: unknown;
  defaults: unknown;
  customised: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [issues, setIssues] = useState<string[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [, startTransition] = useTransition();

  const local = useMemo(() => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      return { ok: false as const, issues: [`Not valid JSON: ${(error as Error).message}`] };
    }
    const result = sectionSchemas[section].safeParse(parsed);
    if (result.success) return { ok: true as const, data: result.data };
    return {
      ok: false as const,
      issues: result.error.issues.slice(0, 12).map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
    };
  }, [text, section]);

  const dirty = text !== JSON.stringify(value, null, 2);

  async function save() {
    if (!local.ok) return;
    setBusy("save");
    setIssues([]);
    setSaved(null);
    try {
      const res = await fetch(`/api/admin/bot-config/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local.data),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; issues?: string[]; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setIssues(body?.issues ?? [body?.error ?? "Save failed."]);
        return;
      }
      setSaved("Saved. The assistant uses this within 30 seconds.");
      startTransition(() => router.refresh());
    } catch {
      setIssues(["Could not reach the server."]);
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    if (!window.confirm("Replace this section with the built-in default? Your changes to it will be lost.")) return;
    setBusy("reset");
    setIssues([]);
    try {
      const res = await fetch(`/api/admin/bot-config/${section}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setText(JSON.stringify(defaults, null, 2));
      setSaved("Reset to the default.");
      startTransition(() => router.refresh());
    } catch {
      setIssues(["Could not reset this section."]);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="brand" onClick={() => void save()} disabled={!local.ok || !dirty || busy !== null}>
          {busy === "save" ? <Loader2 className="animate-spin" /> : <Save />} Save section
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => local.ok && setText(JSON.stringify(local.data, null, 2))}
          disabled={!local.ok}
        >
          <Wand2 /> Format
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void reset()} disabled={!customised || busy !== null}>
          {busy === "reset" ? <Loader2 className="animate-spin" /> : <RotateCcw />} Reset to default
        </Button>
        <span className="ml-auto text-xs">
          {local.ok ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Valid
            </span>
          ) : (
            <span className="text-destructive">{local.issues.length} problem{local.issues.length === 1 ? "" : "s"}</span>
          )}
        </span>
      </div>

      {(issues.length > 0 || !local.ok) && (
        <ul className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {(issues.length ? issues : local.ok ? [] : local.issues).map((issue) => (
            <li key={issue} className="font-mono">
              {issue}
            </li>
          ))}
        </ul>
      )}
      {saved && <p className="text-xs text-emerald-600 dark:text-emerald-400">{saved}</p>}

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setSaved(null);
        }}
        spellCheck={false}
        aria-label={`${section} configuration`}
        className="scroll-slim h-[65dvh] w-full resize-y rounded-2xl border bg-card p-4 font-mono text-[12px] leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
