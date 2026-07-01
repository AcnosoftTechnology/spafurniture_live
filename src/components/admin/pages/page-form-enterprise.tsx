"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlugField } from "@/components/admin/cms/slug-field";
import { SeoScorePanel, type SeoTabValue } from "@/components/admin/cms/seo-score-panel";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import { FormToolbar } from "@/components/admin/cms/form-toolbar";
import { PublishSidebar } from "@/components/admin/cms/publish-sidebar";
import { CmsEditorLayout } from "@/components/admin/cms/cms-editor-layout";
import { MediaPickerDialog, type MediaItem } from "@/components/admin/cms/media-picker-dialog";
import { pageCanonicalUrl } from "@/lib/paths";
import { adminApiUrl, slugify } from "@/lib/utils";
import {
  useAutoSeo,
  defaultManual,
  initialManualFromSeo,
  type SeoManualOverrides,
} from "@/hooks/use-auto-seo";
import { toast } from "sonner";

type PageInitial = {
  id?: string;
  title?: string;
  slug?: string;
  content?: unknown;
  template?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string | null;
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

const PROTECTED_SLUGS = new Set(["home"]);

export function PageFormEnterprise({ initial }: { initial?: PageInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [content, setContent] = useState<unknown>(
    initial?.content ?? { type: "doc", content: [] },
  );
  const [contentHtml, setContentHtml] = useState(
    typeof initial?.content === "string" ? initial.content : "",
  );
  const [plainExcerpt, setPlainExcerpt] = useState("");
  const [template, setTemplate] = useState(initial?.template ?? "DEFAULT");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [ogImageId, setOgImageId] = useState<string | null>(initial?.ogImageId ?? null);
  const [ogImagePreview, setOgImagePreview] = useState(initial?.ogImage ?? null);
  const [ogPicker, setOgPicker] = useState(false);
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

  const isProtected = PROTECTED_SLUGS.has(slug);
  const canonicalDefault = useMemo(
    () => (slug ? pageCanonicalUrl(slug) : ""),
    [slug],
  );
  const previewUrl = canonicalDefault || null;
  const pageDescription = (plainExcerpt || "").trim();

  useAutoSeo({
    pageTitle: title,
    pageDescription,
    canonicalUrl: canonicalDefault,
    seo,
    setSeo,
    manual: seoManual,
    setManual: setSeoManual,
  });

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug || slugify(title),
      content,
      contentHtml: contentHtml || undefined,
      template,
      status,
      seoTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl || canonicalDefault,
      robots: seo.robots,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImageId: seo.ogImageId ?? ogImageId,
      twitterCard: seo.twitterCard,
      schemaJson: seo.schemaJson,
    };

    const url = initial?.id
      ? adminApiUrl(`/api/v1/admin/pages/${initial.id}`)
      : adminApiUrl("/api/v1/admin/pages");
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
    const json = await res.json();
    toast.success("Page saved");
    if (!initial?.id && json?.data?.id) router.push(`/admin/seo-pages/${json.data.id}`);
    else router.refresh();
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm(`Delete page "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl(`/api/v1/admin/pages/${initial.id}`), { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Page deleted");
    router.push("/admin/seo-pages");
    router.refresh();
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
        backHref="/admin/seo-pages"
      />

      {isProtected && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          The home page is also managed under <strong>Homepage</strong> in the sidebar. SEO fields here
          apply to the site root.
        </p>
      )}

      <SlugField
        title={title}
        slug={slug}
        onTitleChange={setTitle}
        onSlugChange={setSlug}
        previewPath={slug === "home" ? "/" : slug === "about" ? "/about/" : "/{slug}/"}
        autoSync={!initial?.id}
        slugDisabled={isProtected}
      />

      <CmsEditorLayout
        main={
          <>
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-3 block text-sm font-semibold">Page content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                onPlainTextChange={setPlainExcerpt}
                onHtmlChange={setContentHtml}
                placeholder="Headings, paragraphs, lists, links, images…"
              />
              <p className="mt-2 text-xs text-stone-500">
                For category URLs (e.g. massage-beds), saving updates the matching category SEO block on
                the live site.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
              <Label className="mb-2 block text-sm font-semibold">Template</Label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-stone-200 px-2 text-sm"
              >
                <option value="DEFAULT">Default</option>
                <option value="FULL_WIDTH">Full width</option>
              </select>
            </div>
          </>
        }
        sidebar={
          <>
            <PublishSidebar
              entityLabel="Page"
              status={status}
              onStatusChange={setStatus}
              createdAt={initial?.createdAt}
              updatedAt={initial?.updatedAt}
              publishedAt={initial?.publishedAt}
              featuredImage={ogImagePreview}
              onFeaturedPick={() => setOgPicker(true)}
              onFeaturedClear={() => {
                setOgImageId(null);
                setOgImagePreview(null);
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
            {initial?.id && !isProtected && (
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
                  {deleting ? "Deleting…" : "Delete page"}
                </Button>
              </div>
            )}
          </>
        }
      />

      <MediaPickerDialog
        open={ogPicker}
        onOpenChange={setOgPicker}
        onSelect={(m: MediaItem) => {
          setOgImageId(m.id);
          setOgImagePreview({ path: m.path, webpPath: m.webpPath });
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
