import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRANDING, brandName, brandUrl } from "@/lib/branding";

/**
 * Elegant, non-intrusive attribution to BITSOL MARKETING.
 * Rendered on the login screen, splash screen, footer, about page, admin panel,
 * docs and chat widget footer, per the brand guidelines.
 */
export function BitsolBranding({
  className,
  variant = "line",
}: {
  className?: string;
  variant?: "line" | "stacked";
}) {
  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-brand-cyan" aria-hidden />
          {BRANDING.product.poweredBy}
        </span>
        <span className="text-xs text-muted-foreground">
          {BRANDING.developer.attribution.split("BITSOL MARKETING")[0]}
          <Link
            href={brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-brand-cyan"
          >
            {brandName}
          </Link>
        </span>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted-foreground",
        className
      )}
    >
      <Sparkles className="size-3.5 text-brand-cyan" aria-hidden />
      <span>Designed &amp; Developed by</span>
      <Link
        href={brandUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold tracking-wide text-foreground transition-colors hover:text-brand-cyan"
      >
        {brandName}
      </Link>
    </p>
  );
}
