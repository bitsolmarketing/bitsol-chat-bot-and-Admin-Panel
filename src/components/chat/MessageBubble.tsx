import { User2, Volume2 } from "lucide-react";
import { LogoMark } from "@/components/branding/Logo";
import { cn, isUrduScript } from "@/lib/utils";
import type { ChatMessage } from "@/types";

/**
 * Renders a single chat message. Detects Urdu/Punjabi script to switch to RTL,
 * and applies a small, safe text formatter (bold + bullets + headings) so
 * responses read well without pulling in a full markdown renderer.
 */
export function MessageBubble({
  message,
  onSpeak,
}: {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const rtl = isUrduScript(message.content);

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in-up gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {isUser ? (
        <span
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white/70 ring-1 ring-inset ring-white/10"
          aria-hidden
        >
          <User2 className="size-4" />
        </span>
      ) : (
        <span
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-brand-ink ring-1 ring-brand-cyan/30"
          aria-hidden
        >
          <LogoMark className="size-7" />
        </span>
      )}

      <div
        className={cn(
          "group relative max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed md:max-w-[78%]",
          isUser
            ? "rounded-tr-md bg-brand text-white shadow-brand"
            : "rounded-tl-md border border-white/[0.07] bg-white/[0.035] text-white/90"
        )}
      >
        <div className={cn(rtl && "urdu")}>{renderContent(message.content)}</div>

        {!isUser && message.content && onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(message.content)}
            aria-label="Read this answer aloud"
            className="absolute -bottom-3 right-2 hidden rounded-full bg-brand-slate p-1.5 text-white/60 shadow ring-1 ring-white/10 transition hover:text-brand-cyan group-hover:block"
          >
            <Volume2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Tiny formatter: headings, bullets, numbered steps and **bold** — no HTML injection. */
function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trimStart();

    if (!trimmed) return <span key={i} className="block h-2" />;

    // A line that is entirely bold reads as a section heading.
    const heading = /^\*\*(.+)\*\*:?$/.exec(trimmed);
    if (heading) {
      return (
        <p key={i} className={cn("font-semibold text-white", i > 0 && "mt-3")}>
          {heading[1]}
        </p>
      );
    }

    const bullet = /^([-*•])\s+/.exec(trimmed);
    const numbered = /^(\d+)\.\s+/.exec(trimmed);
    const clean = trimmed.replace(/^([-*•]|\d+\.)\s+/, "");

    if (bullet || numbered) {
      return (
        <p key={i} className={cn("flex gap-2", i > 0 && "mt-1")}>
          <span className="select-none font-semibold text-brand-cyan">
            {numbered ? `${numbered[1]}.` : "•"}
          </span>
          <span>{formatInline(clean)}</span>
        </p>
      );
    }

    return (
      <p key={i} className={cn(i > 0 && "mt-1.5")}>
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) {
      return (
        <em key={i} className="opacity-75">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
