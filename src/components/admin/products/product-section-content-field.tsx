"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";

export type ProductSectionContentMode = "text" | "image";

type ProductSectionContentFieldProps = {
  label: string;
  mode: ProductSectionContentMode;
  onModeChange: (mode: ProductSectionContentMode) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  textPlaceholder?: string;
  textRows?: number;
  imageValue: MediaFieldValue | null;
  onImageChange: (value: MediaFieldValue | null) => void;
  imageHint?: string;
  textContent?: ReactNode;
};

export function ProductSectionContentField({
  label,
  mode,
  onModeChange,
  textValue,
  onTextChange,
  textPlaceholder,
  textRows = 5,
  imageValue,
  onImageChange,
  imageHint,
  textContent,
}: ProductSectionContentFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex rounded-lg border border-stone-200 p-0.5 text-xs">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "text" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
            }`}
            onClick={() => onModeChange("text")}
          >
            Text
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "image" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
            }`}
            onClick={() => onModeChange("image")}
          >
            Image
          </button>
        </div>
      </div>

      {mode === "text" ? (
        textContent ?? (
          <Textarea
            rows={textRows}
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={textPlaceholder}
          />
        )
      ) : (
        <div className="space-y-2">
          <MediaField value={imageValue} onChange={onImageChange} previewClassName="aspect-[4/3] w-full max-w-md" />
          {imageHint ? <p className="text-xs text-stone-500">{imageHint}</p> : null}
        </div>
      )}
    </div>
  );
}

export function initialSectionMode(
  mediaId?: string | null,
  media?: { path: string } | null,
): ProductSectionContentMode {
  return mediaId || media?.path ? "image" : "text";
}
