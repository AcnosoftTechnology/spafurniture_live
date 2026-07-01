"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlugField } from "@/components/admin/cms/slug-field";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import { SeoPanel } from "@/components/admin/cms/seo-panel";
import { OgPanel } from "@/components/admin/cms/og-panel";
import { FormToolbar } from "@/components/admin/cms/form-toolbar";
import { MediaPickerDialog, type MediaItem } from "@/components/admin/cms/media-picker-dialog";
import { Button } from "@/components/ui/button";
import { getBaseUrl, slugify, mediaUrl } from "@/lib/utils";
import { blogPostPath } from "@/lib/blog-paths";
import type { SeoFields } from "@/types/cms";
import type { OgPanelValue } from "@/components/admin/cms/og-panel";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { extractSpEasyAccordionIds } from "@/lib/faq-shortcode";
import { BlogFaqShortcodePanel } from "@/components/admin/blog/blog-faq-shortcode-panel";

type BlogInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: unknown;
  status?: string;
  publishedAt?: string | Date | null;
  scheduledAt?: string | Date | null;
  featuredMediaId?: string | null;
  featuredMedia?: { path: string; webpPath?: string | null } | null;
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
  categories?: { categoryId: string }[];
  tags?: { tagId: string }[];
};

export function BlogFormEnterprise({
  initial,
  blogCategories,
  blogTags,
}: {
  initial?: BlogInitial;
  blogCategories: { id: string; name: string }[];
  blogTags: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState<unknown>(initial?.content ?? { type: "doc", content: [] });
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ? new Date(initial.publishedAt).toISOString().slice(0, 16) : "",
  );
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0, 16) : "",
  );
  const [categoryIds, setCategoryIds] = useState(initial?.categories?.map((c) => c.categoryId) ?? []);
  const [tagIds, setTagIds] = useState(initial?.tags?.map((t) => t.tagId) ?? []);
  const [featuredId, setFeaturedId] = useState<string | null>(initial?.featuredMediaId ?? null);
  const [featuredPreview, setFeaturedPreview] = useState(initial?.featuredMedia ?? null);
  const [featuredPicker, setFeaturedPicker] = useState(false);
  const [seo, setSeo] = useState<SeoFields>({
    seoTitle: initial?.seoTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
    keywords: initial?.keywords ?? [],
    canonicalUrl: initial?.canonicalUrl ?? "",
    robots: initial?.robots ?? "index,follow",
  });
  const [og, setOg] = useState<OgPanelValue>({
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
    ogImageId: initial?.ogImageId ?? null,
    twitterCard: initial?.twitterCard ?? "summary_large_image",
    ogImagePreview: initial?.ogImage ?? null,
  });

  const previewUrl = useMemo(() => (slug ? `${getBaseUrl()}${blogPostPath(slug)}` : null), [slug]);

  function contentForSave(): unknown {
    if (typeof content === "string") return content;
    if (contentHtml && extractSpEasyAccordionIds(contentHtml).length > 0) return contentHtml;
    return content;
  }

  function insertFaqShortcode(shortcode: string) {
    const base = typeof content === "string" ? content : contentHtml;
    const snippet = `<p>${shortcode}</p>`;
    const next = base.trim() ? `${base}\n${snippet}` : snippet;
    setContent(next);
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt,
      content: contentForSave(),
      status,
      publishedAt: publishedAt || null,
      scheduledAt: scheduledAt || null,
      featuredMediaId: featuredId,
      authorId: session?.user?.id,
      categoryIds,
      tagIds,
      ...seo,
      ogTitle: og.ogTitle,
      ogDescription: og.ogDescription,
      ogImageId: og.ogImageId,
      twitterCard: og.twitterCard,
    };

    const url = initial?.id ? `/api/v1/admin/blog/${initial.id}` : "/api/v1/admin/blog";
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);

    if (!res.ok) {
      toast.error("Failed to save post");
      return;
    }
    const data = await res.json();
    toast.success("Post saved");
    if (!initial?.id && data?.data?.id) router.push(`/admin/blog/${data.data.id}`);
    else router.refresh();
  }

  return (
    <div className="pb-12">
      <FormToolbar title={title} status={status} previewUrl={previewUrl} saving={saving} onSave={save} backHref="/admin/blog" />
      <SlugField title={title} slug={slug} onTitleChange={setTitle} onSlugChange={setSlug} previewPath="/{slug}" autoSync={!initial?.id} />

      <Tabs defaultValue="content" className="mt-6">
        <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {["content", "settings", "seo", "social"].map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-lg border px-4 py-2 text-xs capitalize data-[state=active]:border-stone-900 data-[state=active]:bg-stone-900 data-[state=active]:text-white"
            >
              {t === "social" ? "Open Graph" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2 rounded-xl border bg-white p-4 dark:bg-stone-950">
            <Label>Excerpt</Label>
            <Textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <BlogFaqShortcodePanel onInsert={insertFaqShortcode} />
          <RichTextEditor
            value={content}
            onChange={setContent}
            onHtmlChange={setContentHtml}
            placeholder="Write your article..."
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 rounded-xl border bg-white p-6 dark:bg-stone-950">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Publish date</Label>
              <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Schedule for</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-10 w-full max-w-xs rounded-md border px-3 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Featured image</Label>
            {featuredPreview && (
              <div className="relative mb-2 h-32 w-48 overflow-hidden rounded-lg">
                <Image src={mediaUrl(featuredPreview.webpPath ?? featuredPreview.path)} alt="" fill className="object-cover" />
                <Button type="button" size="icon" variant="destructive" className="absolute right-1 top-1 h-6 w-6" onClick={() => { setFeaturedId(null); setFeaturedPreview(null); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => setFeaturedPicker(true)}>
              <ImagePlus className="mr-1 h-3.5 w-3.5" /> Add Media
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                  <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={(e) => {
                    if (e.target.checked) setCategoryIds([...categoryIds, c.id]);
                    else setCategoryIds(categoryIds.filter((id) => id !== c.id));
                  }} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {blogTags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                  <input type="checkbox" checked={tagIds.includes(t.id)} onChange={(e) => {
                    if (e.target.checked) setTagIds([...tagIds, t.id]);
                    else setTagIds(tagIds.filter((id) => id !== t.id));
                  }} />
                  {t.name}
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="rounded-xl border bg-white p-6 dark:bg-stone-950">
          <SeoPanel value={seo} onChange={setSeo} />
        </TabsContent>

        <TabsContent value="social" className="rounded-xl border bg-white p-6 dark:bg-stone-950">
          <OgPanel value={og} onChange={setOg} />
        </TabsContent>
      </Tabs>

      <MediaPickerDialog open={featuredPicker} onOpenChange={setFeaturedPicker} onSelect={(m: MediaItem) => {
        setFeaturedId(m.id);
        setFeaturedPreview({ path: m.path, webpPath: m.webpPath });
      }} />
    </div>
  );
}
