"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { speechTagFor } from "@/lib/i18n";

/**
 * Chat composer with:
 *  - auto-growing textarea (Enter to send, Shift+Enter for newline)
 *  - voice input via the browser Web Speech API (English, Urdu, Punjabi)
 *  - a file/image/PDF attach button (the file name is appended to the message;
 *    binary upload handling is a server-side concern handled separately)
 */
export function ChatInput({
  onSend,
  disabled,
  streaming,
  onStop,
  placeholder = "Ask anything…  (English, اردو, Roman Urdu or پنجابی)",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  streaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-resize the textarea to fit content (up to a cap).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  function toggleVoice() {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      alert("Voice input isn't supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = speechTagFor(value);
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setValue(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setValue((v) => `${v}${v ? " " : ""}[Attached: ${file.name}]`);
    }
    e.target.value = "";
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)] transition focus-within:border-brand-cyan/45 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_4px_rgba(0,217,255,0.08)]">
      <div className="flex items-end gap-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onFile}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-white/50 hover:bg-white/5 hover:text-white"
          aria-label="Attach a file, image or PDF"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="size-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-40 flex-1 resize-none bg-transparent px-1 py-3 text-[14px] text-white outline-none placeholder:text-white/35"
          disabled={disabled}
        />

        <Button
          type="button"
          variant={listening ? "destructive" : "ghost"}
          size="icon"
          className={cn("shrink-0", !listening && "text-white/50 hover:bg-white/5 hover:text-white")}
          aria-label={listening ? "Stop voice input" : "Start voice input"}
          onClick={toggleVoice}
          disabled={disabled}
        >
          {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>

        {streaming ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="shrink-0"
            aria-label="Stop generating"
            onClick={onStop}
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="brand"
            size="icon"
            className={cn("shrink-0 rounded-xl", !value.trim() && "opacity-50 shadow-none")}
            aria-label="Send message"
            onClick={submit}
            disabled={disabled || !value.trim()}
          >
            <Send className="size-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
