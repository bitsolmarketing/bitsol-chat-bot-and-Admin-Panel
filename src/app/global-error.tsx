"use client";

/**
 * Root error boundary.
 *
 * Catches failures in the root layout itself, which the per-route `error.tsx`
 * cannot. Because it replaces the whole document, it must render its own
 * <html> and <body> — that is a hard App Router requirement.
 *
 * Like `not-found.tsx`, defining this keeps `next build` from falling back to
 * the pages-router error document when prerendering /_error.
 *
 * Styling is inline: if the root layout failed, the stylesheet may not have
 * loaded either, and an error page that itself renders broken helps nobody.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          backgroundColor: "#050816",
          backgroundImage:
            "radial-gradient(900px 520px at 12% -12%, rgba(0,217,255,0.16), transparent 60%), radial-gradient(900px 560px at 92% -6%, rgba(124,58,237,0.26), transparent 62%)",
          color: "white",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            The BITSOL Marketing assistant hit an unexpected error. Please try again — if it
            keeps happening, contact us and we&apos;ll look into it.
          </p>

          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.6875rem",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              backgroundImage: "linear-gradient(135deg, #2563EB, #7C3AED)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
