"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

type SlugFieldProps = {
  title: string;
  slug: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  previewPath: string;
  autoSync?: boolean;
  slugDisabled?: boolean;
};

export function SlugField({
  title,
  slug,
  onTitleChange,
  onSlugChange,
  previewPath,
  autoSync = true,
  slugDisabled = false,
}: SlugFieldProps) {
  const [manualSlug, setManualSlug] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const path = previewPath.replace("{slug}", slug || "…");
  const previewUrl = slug ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}` : null;

  useEffect(() => {
    if (autoSync && !manualSlug && title) {
      onSlugChange(slugify(title));
    }
  }, [title, autoSync, manualSlug, onSlugChange]);

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/30">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Product or page title"
            className="text-base"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">URL slug *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[10px]"
              disabled={slugDisabled}
              onClick={() => {
                setManualSlug(false);
                onSlugChange(slugify(title));
              }}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate
            </Button>
          </div>
          <div className="flex gap-2">
            <span className="flex h-10 items-center rounded-l-md border border-r-0 border-stone-200 bg-white px-2 text-xs text-stone-400">
              /
            </span>
            <Input
              id="slug"
              value={slug}
              disabled={slugDisabled}
              onChange={(e) => {
                setManualSlug(true);
                onSlugChange(slugify(e.target.value));
              }}
              className="rounded-l-none font-mono text-sm"
            />
          </div>
        </div>
      </div>
      {previewUrl && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="truncate">{previewUrl}</span>
          <Button type="button" variant="outline" size="sm" className="h-7 shrink-0" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              View page
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
