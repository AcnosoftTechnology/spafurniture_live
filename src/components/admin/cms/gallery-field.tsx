"use client";

import Image from "next/image";
import { useState } from "react";
import { GripVertical, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog, type MediaItem } from "./media-picker-dialog";
import { mediaUrl } from "@/lib/utils";

export type GalleryItem = { mediaId: string; path: string; webpPath?: string | null; filename?: string };

type GalleryFieldProps = {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  label?: string;
};

export function GalleryField({ items, onChange, label = "Gallery" }: GalleryFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <ImagePlus className="mr-1 h-3.5 w-3.5" />
          Add Media
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 py-12 text-center text-xs text-stone-400">
          No images yet. Click Add Media to upload or select from library.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.mediaId} className="group relative aspect-square overflow-hidden rounded-lg border bg-stone-50">
              <GripVertical className="absolute left-1 top-1 z-10 h-4 w-4 text-white drop-shadow" />
              <Image src={mediaUrl(item.webpPath ?? item.path)} alt="" fill className="object-cover" sizes="150px" />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-6 flex-1 text-[10px]"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    onChange(next);
                  }}
                >
                  ←
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-6 px-2"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        multiple
        onSelect={() => {}}
        onSelectMultiple={(selected) => {
          const existing = new Set(items.map((i) => i.mediaId));
          const added = selected
            .filter((m) => !existing.has(m.id))
            .map((m) => ({ mediaId: m.id, path: m.path, webpPath: m.webpPath, filename: m.filename }));
          onChange([...items, ...added]);
        }}
      />
    </div>
  );
}
