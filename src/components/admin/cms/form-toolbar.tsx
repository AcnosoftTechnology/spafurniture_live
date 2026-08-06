"use client";

import Link from "next/link";
import { ExternalLink, Save, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type FormToolbarProps = {
  title: string;
  status: string;
  previewUrl?: string | null;
  saving?: boolean;
  onSave: () => void;
  backHref: string;
  /** WordPress-style publish controls in the sticky bar */
  onStatusChange?: (status: string) => void;
  publishedAt?: string;
  onPublishedAtChange?: (value: string) => void;
  createdAt?: Date | string | null;
  /** When true, primary button says Publish / Save draft / Update */
  publishMode?: boolean;
  /** True when this post was already published (button shows Update). */
  alreadyPublished?: boolean;
};

function formatCreated(d?: Date | string | null) {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function saveButtonLabel(
  status: string,
  saving: boolean | undefined,
  publishMode: boolean | undefined,
  alreadyPublished: boolean | undefined,
) {
  if (saving) return "Saving…";
  if (!publishMode) return "Save";
  if (status === "PUBLISHED") return alreadyPublished ? "Update" : "Publish";
  if (status === "ARCHIVED") return "Save";
  return "Save draft";
}

export function FormToolbar({
  title,
  status,
  previewUrl,
  saving,
  onSave,
  backHref,
  onStatusChange,
  publishedAt,
  onPublishedAtChange,
  createdAt,
  publishMode,
  alreadyPublished,
}: FormToolbarProps) {
  const statusVariant =
    status === "PUBLISHED" ? "success" : status === "ARCHIVED" ? "secondary" : "warning";
  const createdLabel = formatCreated(createdAt);
  const buttonLabel = saveButtonLabel(status, saving, publishMode, alreadyPublished);
  const SaveIcon = publishMode && status === "PUBLISHED" && !alreadyPublished ? Send : Save;

  return (
    <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-6 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <Link href={backHref} className="text-xs text-stone-500 hover:text-stone-900">
          ← Back
        </Link>
        <h2 className="truncate text-sm font-semibold">{title || "Untitled"}</h2>
        <Badge variant={statusVariant}>{status}</Badge>
        {createdLabel ? (
          <span className="hidden text-[11px] text-stone-500 sm:inline">Created {createdLabel}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onStatusChange ? (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="flex h-8 rounded-md border border-stone-200 bg-white px-2 text-xs font-medium dark:border-stone-700 dark:bg-stone-950"
            aria-label="Post status"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        ) : null}
        {onPublishedAtChange ? (
          <Input
            type="datetime-local"
            value={publishedAt ?? ""}
            onChange={(e) => onPublishedAtChange(e.target.value)}
            className="h-8 w-auto max-w-[11.5rem] px-2 text-xs"
            title="Publish date"
            aria-label="Publish date"
          />
        ) : null}
        {previewUrl ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              View page
            </a>
          </Button>
        ) : null}
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <SaveIcon className="mr-1 h-3.5 w-3.5" />
          )}
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
