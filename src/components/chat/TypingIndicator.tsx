export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.035] px-4 py-3.5">
      <span className="sr-only">Assistant is typing…</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-typing-dot rounded-full bg-brand-cyan"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
