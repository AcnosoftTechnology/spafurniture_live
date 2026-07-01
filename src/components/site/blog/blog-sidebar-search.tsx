"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function BlogSidebarSearch({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/blog/?q=${encodeURIComponent(trimmed)}` : "/blog/");
  }

  return (
    <form className="esth-blog-widget-search" onSubmit={onSubmit} role="search">
      <label className="esth-blog-widget-label" htmlFor="blog-sidebar-search">
        Search
      </label>
      <div className="esth-blog-widget-search-row">
        <input
          id="blog-sidebar-search"
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          className="esth-blog-widget-search-input"
        />
        <button type="submit" className="esth-blog-widget-search-btn">
          Go
        </button>
      </div>
    </form>
  );
}
