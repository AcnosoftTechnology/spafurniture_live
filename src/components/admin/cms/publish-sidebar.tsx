"use client";

import Image from "next/image";
import { Calendar, Clock, ImagePlus, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

function formatDate(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type PublishSidebarProps = {
  status: string;
  onStatusChange: (status: string) => void;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  publishedAt?: Date | string | null;
  featuredImage?: { path: string; webpPath?: string | null } | null;
  onFeaturedPick?: () => void;
  onFeaturedClear?: () => void;
  saving?: boolean;
  onSave: () => void;
  entityLabel?: string;
};

export function PublishSidebar({
  status,
  onStatusChange,
  createdAt,
  updatedAt,
  publishedAt,
  featuredImage,
  onFeaturedPick,
  onFeaturedClear,
  saving,
  onSave,
  entityLabel = "Page",
}: PublishSidebarProps) {
  const statusVariant =
    status === "PUBLISHED" ? "success" : status === "ARCHIVED" ? "secondary" : "warning";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Publish</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-stone-200 px-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Current</span>
            <Badge variant={statusVariant}>{status}</Badge>
          </div>
          <Button type="button" className="w-full" size="sm" onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            {saving ? "Saving…" : status === "PUBLISHED" ? "Update" : "Save draft"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <Clock className="h-3.5 w-3.5" />
          {entityLabel} info
        </h3>
        <dl className="space-y-2.5 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-stone-500">Created</dt>
            <dd className="text-right font-medium text-stone-800">{formatDate(createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-stone-500">Last updated</dt>
            <dd className="text-right font-medium text-stone-800">{formatDate(updatedAt)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="flex items-center gap-1 text-stone-500">
              <Calendar className="h-3 w-3" />
              Published
            </dt>
            <dd className="text-right font-medium text-stone-800">{formatDate(publishedAt)}</dd>
          </div>
        </dl>
      </div>

      {(onFeaturedPick || featuredImage) && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Featured image
          </h3>
          {featuredImage ? (
            <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border bg-stone-50">
              <Image
                src={mediaUrl(featuredImage.webpPath ?? featuredImage.path)}
                alt="Featured"
                fill
                className="object-cover"
              />
              {onFeaturedClear && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={onFeaturedClear}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "mb-3 flex aspect-video items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 text-xs text-stone-400",
              )}
            >
              No image set
            </div>
          )}
          {onFeaturedPick && (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={onFeaturedPick}>
              <ImagePlus className="mr-1 h-3.5 w-3.5" />
              {featuredImage ? "Replace image" : "Set featured image"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
