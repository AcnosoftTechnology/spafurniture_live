"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogViewMode } from "@/components/site/blog/blog-view";

type BlogViewSwitcherProps = {
  view: BlogViewMode;
  onChange: (view: BlogViewMode) => void;
};

export function BlogViewSwitcher({ view, onChange }: BlogViewSwitcherProps) {
  return (
    <div className="esth-blog-view-switcher" role="group" aria-label="Blog layout">
      <button
        type="button"
        className={cn(
          "esth-blog-view-btn",
          view === "list" && "esth-blog-view-btn--active",
        )}
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
      >
        <LayoutList className="esth-blog-view-btn-icon" strokeWidth={1.75} />
        List
      </button>
      <button
        type="button"
        className={cn(
          "esth-blog-view-btn",
          view === "grid" && "esth-blog-view-btn--active",
        )}
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="esth-blog-view-btn-icon" strokeWidth={1.75} />
        Grid
      </button>
    </div>
  );
}
