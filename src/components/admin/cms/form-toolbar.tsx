"use client";

import Link from "next/link";
import { ExternalLink, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FormToolbarProps = {
  title: string;
  status: string;
  previewUrl?: string | null;
  saving?: boolean;
  onSave: () => void;
  backHref: string;
};

export function FormToolbar({ title, status, previewUrl, saving, onSave, backHref }: FormToolbarProps) {
  const statusVariant =
    status === "PUBLISHED" ? "success" : status === "ARCHIVED" ? "secondary" : "warning";

  return (
    <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-6 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={backHref} className="text-xs text-stone-500 hover:text-stone-900">
          ← Back
        </Link>
        <h2 className="truncate text-sm font-semibold">{title || "Untitled"}</h2>
        <Badge variant={statusVariant}>{status}</Badge>
      </div>
      <div className="flex items-center gap-2">
        {previewUrl && (
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              View page
            </a>
          </Button>
        )}
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
