"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPickerDialog, type MediaItem } from "./media-picker-dialog";
import { mediaUrl } from "@/lib/utils";

export type CertificationItem = {
  imagePath: string;
  alt?: string;
  href?: string;
  openInNewTab?: boolean;
  mediaId?: string | null;
};

type CertificationListFieldProps = {
  label: string;
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
};

function itemFromMedia(m: MediaItem): CertificationItem {
  return {
    imagePath: m.path,
    alt: m.alt ?? m.filename.replace(/\.[^.]+$/, ""),
    mediaId: m.id,
  };
}

export function CertificationListField({ label, items, onChange }: CertificationListFieldProps) {
  const [multiOpen, setMultiOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => setMultiOpen(true)}>
          <ImagePlus className="mr-1 h-3.5 w-3.5" />
          Add Media
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed py-10 text-center text-xs text-stone-400">
          No certification badges yet. Click Add Media to select from the library.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <CertRow
              key={`${item.mediaId ?? item.imagePath}-${index}`}
              item={item}
              onChange={(next) => {
                const copy = [...items];
                copy[index] = next;
                onChange(copy);
              }}
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}

      <MediaPickerDialog
        open={multiOpen}
        onOpenChange={setMultiOpen}
        multiple
        onSelect={() => {}}
        onSelectMultiple={(selected) => onChange([...items, ...selected.map(itemFromMedia)])}
      />
    </div>
  );
}

function CertRow({
  item,
  onChange,
  onRemove,
}: {
  item: CertificationItem;
  onChange: (item: CertificationItem) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-stone-50"
        >
          {item.imagePath ? (
            <Image src={mediaUrl(item.imagePath)} alt="" fill className="object-contain p-1" sizes="64px" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-stone-400">Add Media</span>
          )}
        </button>
        <Input
          value={item.alt ?? ""}
          onChange={(e) => onChange({ ...item, alt: e.target.value })}
          placeholder="Alt text"
          className="h-9 max-w-xs flex-1 text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {item.imagePath ? "Replace" : "Add Media"}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[76px]">
        <Input
          value={item.href ?? ""}
          onChange={(e) => onChange({ ...item, href: e.target.value })}
          placeholder="Link URL (leave blank for no link)"
          className="h-9 min-w-[220px] flex-1 text-sm"
        />
        <label className="flex shrink-0 items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={item.openInNewTab ?? false}
            onChange={(e) => onChange({ ...item, openInNewTab: e.target.checked })}
          />
          Open in new tab
        </label>
      </div>

      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(m) =>
          onChange({
            ...item,
            alt: item.alt || m.alt || m.filename.replace(/\.[^.]+$/, ""),
            imagePath: m.path,
            mediaId: m.id,
          })
        }
      />
    </div>
  );
}
