"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

type ProductFormProps = {
  initial?: {
    id?: string;
    title?: string;
    slug?: string;
    shortDesc?: string;
    priceDisplay?: string;
    status?: string;
    featured?: boolean;
  };
};

export function ProductForm({ initial }: ProductFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [priceDisplay, setPriceDisplay] = useState(initial?.priceDisplay ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [loading, setLoading] = useState(false);

  // NEW: Track whether slug has been manually edited
  const [slugEdited, setSlugEdited] = useState(!!initial?.slug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = initial?.id
      ? `/api/v1/admin/products/${initial.id}`
      : "/api/v1/admin/products";

    const method = initial?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slug || slugify(title),
        shortDesc,
        priceDisplay,
        status,
        featured,
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success(initial?.id ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error("Failed to save product");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => {
            const value = e.target.value;
            setTitle(value);

            // Auto-generate slug only until user edits it manually
            if (!slugEdited) {
              setSlug(slugify(value));
            }
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Short description</Label>
        <Textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Price display</Label>
        <Input
          value={priceDisplay}
          onChange={(e) => setPriceDisplay(e.target.value)}
          placeholder="Enquire for price"
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-10 w-full rounded-md border border-stone-200 px-3 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        Featured product
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}