"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlugField } from "@/components/admin/cms/slug-field";
import { SeoScorePanel, type SeoTabValue } from "@/components/admin/cms/seo-score-panel";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import { GalleryField, type GalleryItem } from "@/components/admin/cms/gallery-field";
import { FormToolbar } from "@/components/admin/cms/form-toolbar";
import { PublishSidebar } from "@/components/admin/cms/publish-sidebar";
import { CmsEditorLayout } from "@/components/admin/cms/cms-editor-layout";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import { MediaPickerDialog } from "@/components/admin/cms/media-picker-dialog";
import { categoryCanonicalUrl } from "@/lib/paths";
import { excerptFromHtml } from "@/lib/services/wxr-seo";
import { adminApiUrl, slugify } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import {
  useAutoSeo,
  defaultManual,
  initialManualFromSeo,
  type SeoManualOverrides,
} from "@/hooks/use-auto-seo";
import { toast } from "sonner";

type CategoryInitial = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  homepageFeatureContent?: string | null;
  homepageFeatureBgMediaId?: string | null;
  homepageFeatureBgMedia?: { path: string; webpPath?: string | null } | null;
  pageContent?: unknown;
  status?: string;
  sortOrder?: number;
  showInProductNav?: boolean;
  menuLabel?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string | null;
  thumbMediaId?: string | null;
  thumbMedia?: { path: string; webpPath?: string | null } | null;
  gallery?: { media: { id: string; path: string; webpPath?: string | null } }[];
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

export function CategoryFormEnterprise({ initial }: { initial?: CategoryInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [homepageFeatureContent, setHomepageFeatureContent] = useState(
    initial?.homepageFeatureContent ?? "",
  );
  const [homepageFeatureBg, setHomepageFeatureBg] = useState<MediaFieldValue | null>(
    initial?.homepageFeatureBgMedia
      ? {
          mediaId: initial.homepageFeatureBgMediaId ?? null,
          path: initial.homepageFeatureBgMedia.path,
          webpPath: initial.homepageFeatureBgMedia.webpPath,
        }
      : null,
  );
  const [pageContent, setPageContent] = useState<unknown>(
    initial?.pageContent ?? { type: "doc", content: [] },
  );
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [showInProductNav, setShowInProductNav] = useState(initial?.showInProductNav ?? false);
  const [menuLabel, setMenuLabel] = useState(initial?.menuLabel ?? "");
  const [thumbId, setThumbId] = useState<string | null>(initial?.thumbMediaId ?? null);
  const [thumbPreview, setThumbPreview] = useState(initial?.thumbMedia ?? null);
  const [thumbPicker, setThumbPicker] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>(
    initial?.gallery?.map((g) => ({
      mediaId: g.media.id,
      path: g.media.path,
      webpPath: g.media.webpPath,
      filename: "",
    })) ?? [],
  );
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
    ogImagePreview: initial?.ogImage ?? initial?.thumbMedia ?? null,
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
    () => (slug ? categoryCanonicalUrl(slug) : ""),
    [slug],
  );

  const introExcerpt = useMemo(() => excerptFromHtml(description, 300), [description]);

  useAutoSeo({
    pageTitle: title,
    pageDescription: introExcerpt,
    canonicalUrl: canonicalDefault,
    seo,
    setSeo,
    manual: seoManual,
    setManual: setSeoManual,
  });

  const previewUrl = useMemo(() => (slug ? categoryCanonicalUrl(slug) : null), [slug]);

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug || slugify(title),
      description: description.trim() || null,
      homepageFeatureContent: homepageFeatureContent.trim() || null,
      homepageFeatureBgMediaId: homepageFeatureBg?.mediaId ?? null,
      pageContent,
      status,
      sortOrder,
      showInProductNav,
      menuLabel: menuLabel.trim() || null,
      thumbMediaId: thumbId,
      galleryMediaIds: gallery.map((g) => g.mediaId),
      seoTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl || canonicalDefault,
      robots: seo.robots,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImageId: seo.ogImageId ?? thumbId,
      twitterCard: seo.twitterCard,
      schemaJson: seo.schemaJson,
    };

    const url = initial?.id
      ? adminApiUrl(`/api/v1/admin/categories/${initial.id}`)
      : adminApiUrl("/api/v1/admin/categories");
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Failed to save");
      return;
    }
    const data = await res.json();
    toast.success("Category saved");
    if (!initial?.id && data?.data?.id) router.push(`/admin/categories/${data.data.id}/`);
    else router.refresh();
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm(`Delete category "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl(`/api/v1/admin/categories/${initial.id}`), {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Category deleted");
    router.push("/admin/categories/");
    router.refresh();
  }

  function resetSeoFromPage() {
    setSeoManual(defaultManual);
    setSeo((prev) => ({
      ...prev,
      seoTitle: title,
      ogTitle: title,
      metaDescription: introExcerpt.slice(0, 160),
      ogDescription: introExcerpt.slice(0, 200),
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
        backHref="/admin/categories/"
      />
      <SlugField
        title={title}
        slug={slug}
        onTitleChange={setTitle}
        onSlugChange={setSlug}
        previewPath="/{slug}/"
        autoSync={!initial?.id}
      />

      <CmsEditorLayout
        main={
          <>
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-1 block text-sm font-semibold">Home page features content</Label>
              <p className="mb-3 text-sm text-stone-500">
                Shown only in the featured category section on the homepage. Not used on the category page.
              </p>
              <RichTextEditor
                value={homepageFeatureContent}
                onChange={() => {}}
                onHtmlChange={setHomepageFeatureContent}
                placeholder="Short formatted copy for the homepage feature block…"
              />
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-3 block text-sm font-semibold">Short intro (above product grid)</Label>
              <RichTextEditor
                value={description}
                onChange={() => {}}
                onHtmlChange={setDescription}
                placeholder="Brief intro for the category page…"
              />
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-3 block text-sm font-semibold">SEO content (below grid)</Label>
              <RichTextEditor
                value={pageContent}
                onChange={setPageContent}
                placeholder="Long-form content with headings, lists, images…"
              />
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <div className="mb-4 space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  className="max-w-[120px]"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <GalleryField items={gallery} onChange={setGallery} />
            </div>
          </>
        }
        sidebar={
          <>
            <PublishSidebar
              entityLabel="Category"
              status={status}
              onStatusChange={setStatus}
              createdAt={initial?.createdAt}
              updatedAt={initial?.updatedAt}
              publishedAt={initial?.publishedAt}
              featuredImage={thumbPreview}
              onFeaturedPick={() => setThumbPicker(true)}
              onFeaturedClear={() => {
                setThumbId(null);
                setThumbPreview(null);
              }}
              saving={saving}
              onSave={save}
            />
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Homepage feature background
              </h3>
              <p className="mb-3 text-xs text-stone-500">
                Decorative splash behind the featured product image on the homepage.
              </p>
              <MediaField
                value={homepageFeatureBg}
                onChange={setHomepageFeatureBg}
                previewClassName="aspect-video w-full"
              />
            </div>
            <SeoScorePanel
              pageTitle={title}
              value={seo}
              onChange={setSeo}
              manual={seoManual}
              setManual={setSeoManual}
              onResetAuto={resetSeoFromPage}
            />
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Product page tabs
              </h3>
              <p className="mb-3 text-xs text-stone-500">
                Show this category in the tab bar on /products/ and category pages. Category must be published. Order uses sort order below.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInProductNav}
                  onChange={(e) => setShowInProductNav(e.target.checked)}
                />
                Show in product tabs
              </label>
              <div className="mt-4 space-y-2">
                <Label htmlFor="category-menu-label">Menu label (optional)</Label>
                <Input
                  id="category-menu-label"
                  value={menuLabel}
                  onChange={(e) => setMenuLabel(e.target.value)}
                  placeholder={title.trim() || "Short name for product tabs / menu"}
                />
                <p className="text-xs text-stone-500">
                  Shown in the product category tab bar instead of the category title. Also editable from Homepage → Categories.
                </p>
              </div>
            </div>
            {initial?.id && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-800">
                  Danger zone
                </h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={deleting}
                  onClick={remove}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {deleting ? "Deleting…" : "Delete category"}
                </Button>
              </div>
            )}
          </>
        }
      />

      <MediaPickerDialog
        open={thumbPicker}
        onOpenChange={setThumbPicker}
        onSelect={(m) => {
          setThumbId(m.id);
          setThumbPreview({ path: m.path, webpPath: m.webpPath });
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
