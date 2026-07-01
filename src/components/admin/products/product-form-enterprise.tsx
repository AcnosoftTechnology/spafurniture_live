"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SlugField } from "@/components/admin/cms/slug-field";
import { SeoScorePanel, type SeoTabValue } from "@/components/admin/cms/seo-score-panel";
import { GalleryField, type GalleryItem } from "@/components/admin/cms/gallery-field";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import { FormToolbar } from "@/components/admin/cms/form-toolbar";
import { PublishSidebar } from "@/components/admin/cms/publish-sidebar";
import { CmsEditorLayout } from "@/components/admin/cms/cms-editor-layout";
import { MediaPickerDialog, type MediaItem } from "@/components/admin/cms/media-picker-dialog";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { productCanonicalUrl } from "@/lib/paths";
import {
  useAutoSeo,
  defaultManual,
  initialManualFromSeo,
  type SeoManualOverrides,
} from "@/hooks/use-auto-seo";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  ProductSpecificationsField,
  initialProductSpecificationsValue,
  type ProductSpecificationsValue,
} from "@/components/admin/products/product-specifications-field";
import {
  ProductSectionContentField,
  initialSectionMode,
  type ProductSectionContentMode,
} from "@/components/admin/products/product-section-content-field";
import type { MediaFieldValue } from "@/components/admin/cms/media-field";

type CategoryOption = { id: string; title: string };

type ProductInitial = {
  id?: string;
  title?: string;
  slug?: string;
  shortDesc?: string | null;
  fullDesc?: unknown;
  dimensions?: string | null;
  dimensionsMediaId?: string | null;
  dimensionsMedia?: { path: string; webpPath?: string | null; filename?: string } | null;
  featuresMediaId?: string | null;
  featuresMedia?: { path: string; webpPath?: string | null; filename?: string } | null;
  priceDisplay?: string | null;
  featured?: boolean;
  status?: string;
  sortOrder?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string | null;
  brochureMediaId?: string | null;
  brochureMedia?: { path: string; webpPath?: string | null; filename?: string } | null;
  brochureExternalUrl?: string | null;
  brochureExternalLabel?: string | null;
  youtubeUrl?: string | null;
  youtubeLabel?: string | null;
  schemaJson?: unknown;
  seoTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  canonicalUrl?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
  ogImage?: { path: string; webpPath?: string | null } | null;
  twitterCard?: string | null;
  gallery?: { mediaId: string; media: { id: string; path: string; webpPath?: string | null; filename: string } }[];
  features?: { label: string; value: string }[];
  categories?: { categoryId: string }[];
};

function schemaToString(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}

export function ProductFormEnterprise({
  initial,
  categories,
}: {
  initial?: ProductInitial;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [fullDesc, setFullDesc] = useState<unknown>(initial?.fullDesc ?? { type: "doc", content: [] });
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? "");
  const [dimensionsMode, setDimensionsMode] = useState<ProductSectionContentMode>(() =>
    initialSectionMode(initial?.dimensionsMediaId, initial?.dimensionsMedia),
  );
  const [dimensionsMedia, setDimensionsMedia] = useState<MediaFieldValue | null>(
    initial?.dimensionsMedia
      ? {
          mediaId: initial.dimensionsMediaId ?? null,
          path: initial.dimensionsMedia.path,
          webpPath: initial.dimensionsMedia.webpPath,
          filename: initial.dimensionsMedia.filename,
        }
      : null,
  );
  const [featuresMode, setFeaturesMode] = useState<ProductSectionContentMode>(() =>
    initialSectionMode(initial?.featuresMediaId, initial?.featuresMedia),
  );
  const [featuresMedia, setFeaturesMedia] = useState<MediaFieldValue | null>(
    initial?.featuresMedia
      ? {
          mediaId: initial.featuresMediaId ?? null,
          path: initial.featuresMedia.path,
          webpPath: initial.featuresMedia.webpPath,
          filename: initial.featuresMedia.filename,
        }
      : null,
  );
  const [priceDisplay, setPriceDisplay] = useState(initial?.priceDisplay ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categories?.map((c) => c.categoryId) ?? [],
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(
    initial?.gallery?.map((g) => ({
      mediaId: g.media.id,
      path: g.media.path,
      webpPath: g.media.webpPath,
      filename: g.media.filename,
    })) ?? [],
  );
  const [features, setFeatures] = useState(
    initial?.features?.length ? initial.features : [{ label: "", value: "" }],
  );
  const [specAttachment, setSpecAttachment] = useState<ProductSpecificationsValue>(() =>
    initialProductSpecificationsValue(initial),
  );
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");
  const [youtubeLabel, setYoutubeLabel] = useState(initial?.youtubeLabel ?? "");
  const [featuredPicker, setFeaturedPicker] = useState(false);
  const [seo, setSeo] = useState<SeoTabValue>({
    seoTitle: initial?.seoTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
    keywords: initial?.keywords ?? [],
    canonicalUrl: initial?.canonicalUrl ?? "",
    robots: initial?.robots ?? "index,follow",
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
    ogImageId: initial?.ogImageId ?? null,
    twitterCard: initial?.twitterCard ?? "summary_large_image",
    ogImagePreview: initial?.ogImage ?? null,
    schemaJson: schemaToString(initial?.schemaJson),
  });
  const [seoManual, setSeoManual] = useState<SeoManualOverrides>(() =>
    initial?.id
      ? initialManualFromSeo({
          seoTitle: initial.seoTitle,
          metaDescription: initial.metaDescription,
          canonicalUrl: initial.canonicalUrl,
          ogTitle: initial.ogTitle,
          ogDescription: initial.ogDescription,
        })
      : defaultManual,
  );

  const canonicalDefault = useMemo(
    () => (slug ? productCanonicalUrl(slug) : ""),
    [slug],
  );

  const pageDescription = shortDesc.trim();

  useAutoSeo({
    pageTitle: title,
    pageDescription,
    canonicalUrl: canonicalDefault,
    seo,
    setSeo,
    manual: seoManual,
    setManual: setSeoManual,
  });

  const previewUrl = useMemo(() => (slug ? productCanonicalUrl(slug) : null), [slug]);
  const featuredImage = gallery[0]
    ? { path: gallery[0].path, webpPath: gallery[0].webpPath }
    : seo.ogImagePreview ?? null;

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug || slugify(title),
      shortDesc,
      fullDesc,
      dimensions: dimensionsMode === "text" ? dimensions : dimensions,
      dimensionsMediaId: dimensionsMode === "image" ? dimensionsMedia?.mediaId ?? null : null,
      featuresMediaId: featuresMode === "image" ? featuresMedia?.mediaId ?? null  : null,
      priceDisplay,
      featured,
      status,
      sortOrder,
      brochureMediaId: specAttachment.mode === "pdf" ? specAttachment.mediaId : null,
      brochureExternalUrl: specAttachment.mode === "external" ? specAttachment.externalUrl.trim() : null,
      brochureExternalLabel:
        specAttachment.mode === "external" ? specAttachment.externalLabel.trim() : null,
      youtubeUrl: youtubeUrl.trim() || null,
      youtubeLabel: youtubeLabel.trim() || null,
      categoryIds,
      galleryMediaIds: gallery.map((g) => g.mediaId),
      features: features.filter((f) => f.label.trim()),
      seoTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl || canonicalDefault,
      robots: seo.robots,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImageId: seo.ogImageId ?? gallery[0]?.mediaId ?? null,
      twitterCard: seo.twitterCard,
      schemaJson: seo.schemaJson,
    };

    const url = initial?.id ? `/api/v1/admin/products/${initial.id}` : "/api/v1/admin/products";
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error?.message ?? "Failed to save");
      return;
    }

    const data = await res.json();
    toast.success("Product saved");
    if (!initial?.id && data?.data?.id) router.push(`/admin/products/${data.data.id}`);
    else router.refresh();
  }

  function resetSeoFromPage() {
    setSeoManual(defaultManual);
    setSeo((prev) => ({
      ...prev,
      seoTitle: title,
      ogTitle: title,
      metaDescription: pageDescription.slice(0, 160),
      ogDescription: pageDescription.slice(0, 200),
      canonicalUrl: canonicalDefault,
    }));
  }

  return (
    <div className="pb-12">
      <FormToolbar
        title={title}
        status={status}
        previewUrl={previewUrl}
        saving={saving}
        onSave={save}
        backHref="/admin/products"
      />

      <SlugField
        title={title}
        slug={slug}
        onTitleChange={setTitle}
        onSlugChange={setSlug}
        previewPath="/products/{slug}/"
        autoSync={!initial?.id}
      />

      <CmsEditorLayout
        main={
          <>
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-3 block text-sm font-semibold">Description</Label>
              <RichTextEditor
                value={fullDesc}
                onChange={setFullDesc}
                onPlainTextChange={(text) => {
                  setShortDesc(text.slice(0, 2000));
                }}
                placeholder="Write product description (WordPress-style editor)…"
              />
              <p className="mt-2 text-[11px] text-stone-500">
                Shown on the product page accordion. Images can be uploaded inline or from the media library.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 space-y-4 shadow-sm dark:bg-stone-950">
              <h3 className="text-sm font-semibold text-stone-700">Product details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Price display</Label>
                  <Input
                    value={priceDisplay}
                    onChange={(e) => setPriceDisplay(e.target.value)}
                    placeholder="Enquire for price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
              </div>
              <ProductSectionContentField
                label="Dimensions (accordion)"
                mode={dimensionsMode}
                onModeChange={setDimensionsMode}
                textValue={dimensions}
                onTextChange={setDimensions}
                textPlaceholder={'Height: 64cm to 103cm\nLength: 210cm'}
                imageValue={dimensionsMedia}
                onImageChange={setDimensionsMedia}
                imageHint="Shown in the Dimensions accordion. Visitors can click to enlarge."
              />
              <ProductSectionContentField
                label="Features (accordion)"
                mode={featuresMode}
                onModeChange={setFeaturesMode}
                textValue=""
                onTextChange={() => undefined}
                imageValue={featuresMedia}
                onImageChange={setFeaturesMedia}
                imageHint="Upload a features sheet image, or use the text list below."
                textContent={
                  <div>
                    <div className="mb-2 flex items-center justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setFeatures([...features, { label: "", value: "" }])}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>
                    {features.map((f, i) => (
                      <div key={i} className="mb-2 flex gap-2">
                        <Input
                          placeholder="Feature"
                          className="flex-1"
                          value={f.label}
                          onChange={(e) => {
                            const n = [...features];
                            n[i] = { label: e.target.value, value: "" };
                            setFeatures(n);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                }
              />
              <ProductSpecificationsField value={specAttachment} onChange={setSpecAttachment} />
              <div className="space-y-3 border-t pt-4">
                <Label htmlFor="product-youtube-url">YouTube video URL</Label>
                <Input
                  id="product-youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-stone-500">
                  Adds a video button on the product page. Supports youtube.com and youtu.be links.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="product-youtube-label">Video button label (optional)</Label>
                  <Input
                    id="product-youtube-label"
                    value={youtubeLabel}
                    onChange={(e) => setYoutubeLabel(e.target.value)}
                    placeholder="See Video"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <GalleryField items={gallery} onChange={setGallery} />
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-2 block">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setCategoryIds([...categoryIds, c.id]);
                        else setCategoryIds(categoryIds.filter((id) => id !== c.id));
                      }}
                    />
                    {c.title}
                  </label>
                ))}
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <Switch checked={featured} onCheckedChange={setFeatured} />
                Featured product
              </label>
            </div>
          </>
        }
        sidebar={
          <>
            <PublishSidebar
              entityLabel="Product"
              status={status}
              onStatusChange={setStatus}
              createdAt={initial?.createdAt}
              updatedAt={initial?.updatedAt}
              publishedAt={initial?.publishedAt}
              featuredImage={featuredImage}
              onFeaturedPick={() => setFeaturedPicker(true)}
              onFeaturedClear={() => {
                if (gallery.length) setGallery(gallery.slice(1));
                setSeo((s) => ({ ...s, ogImageId: null, ogImagePreview: null }));
              }}
              saving={saving}
              onSave={save}
            />
            <SeoScorePanel
              pageTitle={title}
              value={seo}
              onChange={setSeo}
              manual={seoManual}
              setManual={setSeoManual}
              onResetAuto={resetSeoFromPage}
            />
          </>
        }
      />

      <MediaPickerDialog
        open={featuredPicker}
        onOpenChange={setFeaturedPicker}
        onSelect={(m: MediaItem) => {
          const item: GalleryItem = {
            mediaId: m.id,
            path: m.path,
            webpPath: m.webpPath,
            filename: m.filename,
          };
          setGallery((g) => [item, ...g.filter((x) => x.mediaId !== m.id)]);
          setSeo((s) => ({
            ...s,
            ogImageId: m.id,
            ogImagePreview: { path: m.path, webpPath: m.webpPath },
          }));
        }}
      />
    </div>
  );
}
