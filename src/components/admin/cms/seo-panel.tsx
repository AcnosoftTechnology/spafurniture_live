"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SeoFields } from "@/types/cms";

type SeoPanelProps = {
  value: SeoFields;
  onChange: (v: SeoFields) => void;
};

export function SeoPanel({ value, onChange }: SeoPanelProps) {
  const keywordsStr = (value.keywords ?? []).join(", ");

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-xs text-stone-500">
        Search engine listing. Leave blank to use title and excerpt as defaults on the public site.
      </p>
      <div className="space-y-2">
        <Label>SEO title</Label>
        <Input
          value={value.seoTitle ?? ""}
          onChange={(e) => onChange({ ...value, seoTitle: e.target.value })}
          placeholder="Custom meta title (50–60 chars)"
        />
        <p className="text-[10px] text-stone-400">{(value.seoTitle ?? "").length} characters</p>
      </div>
      <div className="space-y-2">
        <Label>Meta description</Label>
        <Textarea
          rows={3}
          value={value.metaDescription ?? ""}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
          placeholder="155–160 characters recommended"
        />
        <p className="text-[10px] text-stone-400">{(value.metaDescription ?? "").length} characters</p>
      </div>
      <div className="space-y-2">
        <Label>Focus keywords</Label>
        <Input
          value={keywordsStr}
          onChange={(e) =>
            onChange({
              ...value,
              keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
            })
          }
          placeholder="spa bed, massage table, comma separated"
        />
      </div>
      <div className="space-y-2">
        <Label>Canonical URL</Label>
        <Input
          value={value.canonicalUrl ?? ""}
          onChange={(e) => onChange({ ...value, canonicalUrl: e.target.value })}
          placeholder="https://www.spafurniture.in/products/wooden-shirodhara-stand/"
        />
      </div>
      <div className="space-y-2">
        <Label>Robots</Label>
        <select
          value={value.robots ?? "index,follow"}
          onChange={(e) => onChange({ ...value, robots: e.target.value })}
          className="flex h-10 w-full rounded-md border border-stone-200 px-3 text-sm"
        >
          <option value="index,follow">index, follow</option>
          <option value="noindex,follow">noindex, follow</option>
          <option value="index,nofollow">index, nofollow</option>
          <option value="noindex,nofollow">noindex, nofollow</option>
        </select>
      </div>
    </div>
  );
}
