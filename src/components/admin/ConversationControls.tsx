"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2, PauseCircle, PlayCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Taking over a WhatsApp conversation from the assistant: reply as a person,
 * and pause or resume the assistant on this thread.
 */
export function ConversationControls({
  conversationId,
  botPaused,
  handedOff,
  windowOpen,
}: {
  conversationId: string;
  botPaused: boolean;
  handedOff: boolean;
  windowOpen: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pause, setPause] = useState(true);
  const [busy, setBusy] = useState<"send" | "toggle" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy("send");
    setError(null);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pauseBot: pause }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Could not send.");
      setText("");
      startTransition(() => router.refresh());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send.");
    } finally {
      setBusy(null);
    }
  }

  async function toggle() {
    setBusy("toggle");
    setError(null);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Resuming the assistant also closes the handover.
        body: JSON.stringify(botPaused ? { botPaused: false, handedOff: false } : { botPaused: true }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      setError("Could not change the assistant's status.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Bot className="size-3.5" />
          {botPaused ? "Assistant paused — a person is replying" : handedOff ? "Handed over — assistant still answering" : "Assistant is answering"}
        </span>
        <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" onClick={() => void toggle()} disabled={busy !== null}>
          {busy === "toggle" ? <Loader2 className="animate-spin" /> : botPaused ? <PlayCircle /> : <PauseCircle />}
          {botPaused ? "Resume" : "Pause"}
        </Button>
      </div>

      {windowOpen ? (
        <form onSubmit={send} className="space-y-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="Reply as a person on the team…"
            aria-label="Reply"
            className="w-full resize-y rounded-xl border bg-card p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <input type="checkbox" checked={pause} onChange={(event) => setPause(event.target.checked)} />
              Pause the assistant
            </label>
            <Button type="submit" size="sm" className="bg-[#25D366] text-white hover:bg-[#1ebe5b]" disabled={busy !== null || !text.trim()}>
              {busy === "send" ? <Loader2 className="animate-spin" /> : <Send />} Send
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          The 24-hour reply window has closed. Reach the customer with an approved template from Broadcasts.
        </p>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
