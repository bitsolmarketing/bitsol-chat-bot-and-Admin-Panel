"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Start, retry or delete one broadcast.
 *
 * The confirmation is not politeness. This is the only control in the console
 * that messages hundreds of real phones, it cannot be undone once it starts,
 * and every message costs money — so the count is spelled out and the button
 * has to be pressed twice.
 */
export function BroadcastSendButton({
  id,
  status,
  pending,
  title,
  /** False when WHATSAPP_PHONE_ID / WHATSAPP_TOKEN are unset. */
  canSend,
}: {
  id: string;
  status: string;
  pending: number;
  title: string;
  canSend: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sending = status === "SENDING";
  const finished = status === "SENT" && pending === 0;
  // A failed run with recipients still waiting is a resume, not a fresh send:
  // everyone already messaged is skipped by the recipient table.
  const isRetry = status === "FAILED" || (status === "SENT" && pending > 0);

  async function act(action: "send" | "cancel") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/broadcasts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "That did not work.");
      setConfirming(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/broadcasts/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Could not delete that broadcast.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete that broadcast.");
      setBusy(false);
    }
  }

  if (sending) {
    return (
      <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Sending…
      </span>
    );
  }

  if (finished) {
    return <span className="whitespace-nowrap text-xs text-muted-foreground">Sent</span>;
  }

  if (confirming) {
    return (
      <div className="min-w-[13rem] rounded-xl bg-amber-500/10 p-2.5">
        <p className="mb-2 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
          Send &ldquo;{title}&rdquo; to <span className="font-semibold">{pending}</span> WhatsApp
          number{pending === 1 ? "" : "s"}? This cannot be stopped once it starts, and Meta
          charges for every conversation it opens.
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
            Not yet
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 gap-1 text-[11px]"
            onClick={() => act("send")}
            disabled={busy}
          >
            {busy && <Loader2 className="size-3 animate-spin" />} Send now
          </Button>
        </div>
        {error && <p className="mt-1.5 text-[11px] text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={isRetry ? "outline" : "default"}
        size="sm"
        className="h-7 gap-1 text-[11px]"
        onClick={() => setConfirming(true)}
        disabled={busy || !canSend || pending === 0}
        title={
          !canSend
            ? "WhatsApp is not configured on this server"
            : pending === 0
              ? "Everyone on this broadcast has already been messaged"
              : undefined
        }
      >
        {isRetry ? <RotateCcw className="size-3.5" /> : <Send className="size-3.5" />}
        {isRetry ? `Retry ${pending}` : "Send"}
      </Button>

      {(status === "DRAFT" || status === "SCHEDULED") && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-1.5 text-muted-foreground hover:text-destructive"
          onClick={remove}
          disabled={busy}
          aria-label={`Delete ${title}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}

      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </div>
  );
}
