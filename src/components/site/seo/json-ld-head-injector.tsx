"use client";

import { useServerInsertedHTML } from "next/navigation";

/**
 * Injects JSON-LD into the document &lt;head&gt; during SSR
 * (same mechanism Next uses for CSS-in-JS). Body stays clean; crawlers/tools
 * that only scan &lt;head&gt; can see the schema.
 */
export function JsonLdHeadInjector({ htmls }: { htmls: string[] }) {
  useServerInsertedHTML(() => {
    if (!htmls.length) return null;
    return (
      <>
        {htmls.map((html, index) => (
          <script
            key={`ld-json-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </>
    );
  });

  return null;
}
