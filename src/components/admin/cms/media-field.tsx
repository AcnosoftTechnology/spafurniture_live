"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog, type MediaItem } from "./media-picker-dialog";
import { mediaUrl } from "@/lib/utils";

export type MediaFieldValue = {
  mediaId?: string | null;
  path: string;
  webpPath?: string | null;
  alt?: string | null;
  filename?: string | null;
};

type MediaFieldProps = {
  label?: string;
  value?: MediaFieldValue | null;
  onChange: (value: MediaFieldValue | null) => void;
  previewClassName?: string;
};

export function mediaFromItem(item: MediaItem): MediaFieldValue {
  return {
    mediaId: item.id,
    path: item.path,
    webpPath: item.webpPath,
    alt: item.alt,
    filename: item.filename,
  };
}

export function MediaField({ label, value, onChange, previewClassName = "h-32 w-48" }: MediaFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      {value?.path ? (
        <div className="flex flex-wrap items-start gap-3">
          <div className={`relative overflow-hidden rounded-lg border bg-stone-50 ${previewClassName}`}>
            <Image
              src={mediaUrl(
                value.path.toLowerCase().endsWith(".gif") ? value.path : (value.webpPath ?? value.path),
              )}
              alt={value.alt ?? value.filename ?? ""}
              fill
              className="object-contain p-2"
              sizes="200px"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="mr-1 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <ImagePlus className="mr-1 h-3.5 w-3.5" />
          Add Media
        </Button>
      )}
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => onChange(mediaFromItem(item))}
      />
    </div>
  );
}
