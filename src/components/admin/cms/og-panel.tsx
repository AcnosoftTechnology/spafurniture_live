"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OgFields } from "@/types/cms";
import { MediaField, type MediaFieldValue } from "./media-field";

export type OgPanelValue = OgFields & {
  ogImagePreview?: MediaFieldValue | null;
};

type OgPanelProps = {
  value: OgPanelValue;
  onChange: (v: OgPanelValue) => void;
};

export function OgPanel({ value, onChange }: OgPanelProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs text-stone-500">Open Graph / social share preview (Facebook, LinkedIn, WhatsApp).</p>
      <div className="space-y-2">
        <Label>OG title</Label>
        <Input value={value.ogTitle ?? ""} onChange={(e) => onChange({ ...value, ogTitle: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>OG description</Label>
        <Textarea rows={2} value={value.ogDescription ?? ""} onChange={(e) => onChange({ ...value, ogDescription: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Twitter card</Label>
        <select
          value={value.twitterCard ?? "summary_large_image"}
          onChange={(e) => onChange({ ...value, twitterCard: e.target.value })}
          className="flex h-10 w-full rounded-md border border-stone-200 px-3 text-sm"
        >
          <option value="summary_large_image">Large image</option>
          <option value="summary">Summary</option>
        </select>
      </div>
      <MediaField
        label="OG image"
        value={value.ogImagePreview ?? null}
        onChange={(media) =>
          onChange({
            ...value,
            ogImageId: media?.mediaId ?? null,
            ogImagePreview: media,
          })
        }
        previewClassName="h-32 w-56"
      />
    </div>
  );
}
