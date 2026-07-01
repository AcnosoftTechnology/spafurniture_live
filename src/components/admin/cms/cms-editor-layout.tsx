"use client";

import type { ReactNode } from "react";

type CmsEditorLayoutProps = {
  main: ReactNode;
  sidebar: ReactNode;
};

/** WordPress-style: main content (8 cols) + sidebar (4 cols) */
export function CmsEditorLayout({ main, sidebar }: CmsEditorLayoutProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">{main}</div>
      <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">{sidebar}</div>
    </div>
  );
}
