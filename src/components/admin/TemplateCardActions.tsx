"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Per-template controls — currently just deleting it. */
export function TemplateCardActions({
  id,
  metaName,
  /** True once Meta knows about it: deleting then removes it there too. */
  inMeta,
}: {
  id: string;
  metaName: string;
  inMeta: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

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
            variant="destructive"
            size="sm"
            className="h-7 gap-1 text-[11px]"
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
    <div className="flex items-center justify-between gap-2">
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : (
        <span className="text-[11px] text-muted-foreground">
          {inMeta ? "Managed in Meta" : "Local draft"}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2.5 text-[11px] text-muted-foreground hover:text-destructive"
        onClick={() => setConfirming(true)}
        disabled={busy}
        aria-label={`Delete ${metaName}`}
      >
        <Trash2 className="size-3.5" /> Delete
      </Button>
    </div>
  );
}
