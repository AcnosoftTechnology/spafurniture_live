"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPickerDialog, type MediaItem } from "./media-picker-dialog";
import { mediaFromItem } from "./media-field";
import { mediaUrl } from "@/lib/utils";

export type LogoListItem = {
  title: string;
  imagePath: string;
  mediaId?: string | null;
};

type LogoListFieldProps = {
  label: string;
  items: LogoListItem[];
  onChange: (items: LogoListItem[]) => void;
};

function itemFromMedia(m: MediaItem): LogoListItem {
  const media = mediaFromItem(m);
  return {
    title: m.alt ?? m.filename.replace(/\.[^.]+$/, ""),
    imagePath: media.path,
    mediaId: media.mediaId,
  };
}

export function LogoListField({ label, items, onChange }: LogoListFieldProps) {
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
          No logos yet. Click Add Media to select from the library.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <LogoRow
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

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed"
        onClick={() => onChange([...items, { title: "", imagePath: "" }])}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add row
      </Button>

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

function LogoRow({
  item,
  onChange,
  onRemove,
}: {
  item: LogoListItem;
  onChange: (item: LogoListItem) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 p-3">
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
        value={item.title}
        onChange={(e) => onChange({ ...item, title: e.target.value })}
        placeholder="Title / alt text"
        className="h-9 max-w-xs flex-1 text-sm"
      />
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {item.imagePath ? "Replace" : "Add Media"}
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(m) =>
          onChange({
            ...item,
            title: item.title || m.alt || m.filename.replace(/\.[^.]+$/, ""),
            imagePath: m.path,
            mediaId: m.id,
          })
        }
      />
    </div>
  );
}
