import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The BITSOL mark and wordmark, as they appear on bitsolmarketing.com.
 *
 * The mark's lettering is dark teal on the main site, which disappears on a
 * midnight surface — `tone="light"` swaps it for near-white and keeps the cyan
 * ring and rocket untouched.
 */
export function LogoMark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const ink = tone === "light" ? "#F1F7FF" : "#052E3B";
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BITSOL"
    >
      <circle cx="250" cy="250" r="230" fill="none" stroke="#00D9FF" strokeWidth="10" />
      <circle cx="250" cy="250" r="212" fill="none" stroke={ink} strokeOpacity="0.55" strokeWidth="4" />
      <text
        x="250"
        y="282"
        textAnchor="middle"
        fontFamily="'Montserrat Variable', Montserrat, sans-serif"
        fontSize="120"
        fontWeight="800"
        fill={ink}
        letterSpacing="-4"
      >
        bitsol
      </text>
      <path d="M255 180 L265 170 L275 180 L265 195 Z" fill="#00D9FF" transform="rotate(-45 265 180)" />
      <path d="M260 190 L265 200 L270 190" fill="#00D9FF" opacity="0.6" />
    </svg>
  );
}

/** Mark + "BITSOL." wordmark, optionally with a descriptor underneath. */
export function Logo({
  href = "/",
  tone = "light",
  descriptor,
  size = "md",
  className,
}: {
  href?: string | null;
  tone?: "light" | "dark";
  descriptor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const body = (
    <span className={cn("group/logo inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid shrink-0 place-items-center",
          size === "sm" && "size-8",
          size === "md" && "size-10",
          size === "lg" && "size-14"
        )}
      >
        <span className="absolute inset-0 rounded-full bg-brand-cyan/0 blur-md transition-colors duration-300 group-hover/logo:bg-brand-cyan/35" />
        <LogoMark tone={tone} className="relative size-full" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-extrabold tracking-tight",
            tone === "light" ? "text-white" : "text-brand-ink",
            size === "sm" && "text-base",
            size === "md" && "text-lg",
            size === "lg" && "text-2xl"
          )}
        >
          BITSOL<span className="text-brand-cyan">.</span>
        </span>
        {descriptor && (
          <span
            className={cn(
              "mt-1 text-[10px] font-semibold uppercase tracking-[0.24em]",
              tone === "light" ? "text-white/55" : "text-muted-foreground"
            )}
          >
            {descriptor}
          </span>
        )}
      </span>
    </span>
  );

  return href ? (
    <Link href={href} aria-label="BITSOL Marketing — home">
      {body}
    </Link>
  ) : (
    body
  );
}
