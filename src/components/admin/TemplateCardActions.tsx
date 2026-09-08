"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import type { Department } from "@/lib/brands";

/**
 * Per-template controls: which business owns it, and deleting it.
 *
 * A template synced from Meta arrives with no business attached, because Meta
 * has no idea this account serves two of them. Until someone assigns one it
 * shows in both lists — visible to everybody is the safe default; guessing
 * would hide it from the half of the staff who needed it.
 */
export function TemplateCardActions({
  id,
  metaName,
  department,
  /** Locked for staff restricted to one business — they cannot hand it over. */
  locked,
  /** True once Meta knows about it: deleting then removes it there too. */
  inMeta,
}: {
  id: string;
  metaName: string;
  department: Department | null;
  locked: boolean;
  inMeta: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function assign(value: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: value === "" ? null : value }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Could not reassign that template.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reassign that template.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Could not delete that template.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete that template.");
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <div className="rounded-xl bg-destructive/10 p-2.5">
        <p className="mb-2 text-[11px] leading-relaxed text-destructive">
          {inMeta ? (
            <>
              Delete <span className="font-mono">{metaName}</span> from Meta? Every language
              variant of this name goes with it, and any broadcast still using it will stop
              sending.
            </>
          ) : (
            <>
              Delete <span className="font-mono">{metaName}</span>? It was never submitted, so
              this only removes it from here.
            </>
          )}
        </p>
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px]"
            onClick={() => setConfirming(false)}
            disabled={busy}
          >
            Keep it
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 gap-1 bg-destructive text-[11px] text-destructive-foreground hover:bg-destructive/90"
            onClick={remove}
            disabled={busy}
          >
            {busy && <Loader2 className="size-3 animate-spin" />} Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Select
          value={department ?? ""}
          onChange={(e) => assign(e.target.value)}
          disabled={busy || locked}
          aria-label="Business this template belongs to"
          className="h-8 flex-1 text-[11px]"
        >
          <option value="">Both businesses</option>
          <option value="MARKETING">BITSOL Marketing</option>
          <option value="INSTITUTE">BITSOL Institute</option>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={() => setConfirming(true)}
          disabled={busy}
          aria-label={`Delete ${metaName}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
