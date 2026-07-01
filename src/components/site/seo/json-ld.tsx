/** Renders JSON-LD for crawlers — use in Server Components only. */
export function JsonLd({ data }: { data: { __html: string } | null | undefined }) {
  if (!data?.__html) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: data.__html.replace(/</g, "\\u003c"),
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
