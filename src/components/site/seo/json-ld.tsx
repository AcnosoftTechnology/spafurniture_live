import { JsonLdHeadInjector } from "@/components/site/seo/json-ld-head-injector";

function escapeJsonLd(html: string) {
  return html.replace(/</g, "\\u003c");
}

/** Renders JSON-LD into &lt;head&gt; for crawlers — use in Server Components only. */
export function JsonLd({ data }: { data: { __html: string } | null | undefined }) {
  if (!data?.__html) return null;
  return <JsonLdHeadInjector htmls={[escapeJsonLd(data.__html)]} />;
}

export function JsonLdGroup({ scripts }: { scripts: Array<{ __html: string } | null | undefined> }) {
  const htmls = scripts
    .map((data) => (data?.__html ? escapeJsonLd(data.__html) : null))
    .filter((html): html is string => Boolean(html));

  if (!htmls.length) return null;
  return <JsonLdHeadInjector htmls={htmls} />;
}
