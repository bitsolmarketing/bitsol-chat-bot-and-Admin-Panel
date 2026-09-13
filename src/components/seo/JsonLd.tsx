/**
 * Renders schema.org structured data as one `@graph`. `<` is escaped so a value
 * containing `</script>` can never close the tag early.
 */
export function JsonLd({ graph }: { graph: Record<string, unknown>[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\u003c",
  );
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
