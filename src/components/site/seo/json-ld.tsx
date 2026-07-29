function escapeJsonLd(html: string) {
  return html.replace(/</g, "\\u003c");
}

/**
 * Page-level JSON-LD (product, blog, contact, etc.).
 * Rendered once in the document — do not use useServerInsertedHTML
 * (Next streaming re-invokes it on every flush and duplicates schema).
 */
export function JsonLd({ data }: { data: { __html: string } | null | undefined }) {
  if (!data?.__html) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: escapeJsonLd(data.__html),
      }}
    />
  );
}

export function JsonLdGroup({ scripts }: { scripts: Array<{ __html: string } | null | undefined> }) {
  return (
    <>
      {scripts.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}
    </>
  );
}
