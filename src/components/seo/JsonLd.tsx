/**
 * STRUCTURED DATA
 * ===============
 * Schema.org JSON-LD, which is how a search engine learns that this company
 * was founded in 1995, exports from Faisalabad and can be reached on these
 * numbers. The prose on the page says all of it, but only to a reader.
 *
 * A server component with no interactivity, so the markup ships in the HTML
 * where a crawler will actually see it -- a script written in by a `useEffect`
 * is often indexed before it runs.
 */

/** JSON that is about to sit inside a <script> tag in an HTML document. */
function serialise(data: unknown): string {
  // `</script>` anywhere in the data would close the tag early and let the
  // rest of it be parsed as markup. Escaping the slash keeps it valid JSON and
  // harmless HTML.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialise(data) }}
    />
  );
}
