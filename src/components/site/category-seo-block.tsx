"use client";

import { useState } from "react";
import { ContentRenderer } from "@/components/site/content-renderer";

export function CategorySeoBlock({
  title,
  description,
  pageContent,
}: {
  title?: string;
  description?: string | null;
  pageContent?: unknown;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasRich = pageContent != null;
  const hasText = Boolean(description);

  if (!hasRich && !hasText) return null;

  return (
    <section className="mt-16 border-t border-stone-200 pt-12">
      {title && (
        <h2 className="font-display text-2xl font-semibold text-stone-900">{title}</h2>
      )}
      <div
        className={`prose prose-stone mt-6 max-w-none text-stone-600 ${!expanded && hasRich ? "max-h-64 overflow-hidden relative" : ""}`}
      >
        {description && <p className="text-base leading-relaxed">{description}</p>}
        {hasRich && <ContentRenderer content={pageContent} />}
        {!expanded && hasRich && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fafaf9] to-transparent" />
        )}
      </div>
      {hasRich && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-6 rounded-sm bg-stone-900 px-6 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-stone-800"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </section>
  );
}
