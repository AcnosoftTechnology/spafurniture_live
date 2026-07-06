"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaField } from "@/components/admin/cms/media-field";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import type { AdminRegionalPageEditorData } from "@/features/regional-pages/regional-page.service";
import type { RegionalPageContent } from "@/features/regional-pages/schemas/regional-content.schema";

export function RegionalPageEditor({ initialData }: { initialData: AdminRegionalPageEditorData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [payload, setPayload] = useState(initialData);
  const { slug, content, page } = payload;

  function setContent(next: RegionalPageContent) {
    setPayload({ ...payload, content: next });
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/v1/admin/regional-pages/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, page }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to save");
      return;
    }

    toast.success("Regional page saved");
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete regional page "${page.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/v1/admin/regional-pages/${slug}`, { method: "DELETE" });
    setDeleting(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to delete");
      return;
    }

    toast.success("Regional page deleted");
    router.push("/admin/regional-pages/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-stone-500">
            Public page:{" "}
            <Link href={`/${slug}/`} target="_blank" className="font-medium text-stone-900 underline">
              /{slug}/
            </Link>
          </p>
          <p className="text-xs text-stone-400">Slug cannot be changed after creation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={remove} disabled={deleting || saving}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
          <Button onClick={save} disabled={saving || deleting}>
            {saving ? "Saving..." : "Save page"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="banner">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="banner">Banner</TabsTrigger>
          <TabsTrigger value="arabic">Arabic content</TabsTrigger>
          <TabsTrigger value="english">English content</TabsTrigger>
          <TabsTrigger value="products">Products intro</TabsTrigger>
          <TabsTrigger value="seo">SEO &amp; publish</TabsTrigger>
        </TabsList>

        <TabsContent value="banner" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <MediaField
            label="Banner image / GIF"
            value={
              content.hero.imagePath
                ? {
                    path: content.hero.imagePath,
                    mediaId: content.hero.mediaId ?? null,
                  }
                : null
            }
            onChange={(media) =>
              setContent({
                ...content,
                hero: {
                  ...content.hero,
                  imagePath: media?.path ?? content.hero.imagePath,
                  mediaId: media?.mediaId ?? null,
                },
              })
            }
            previewClassName="h-48 w-full max-w-xl"
          />
          <div className="space-y-2">
            <Label>Image alt text</Label>
            <Input
              value={content.hero.alt}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, alt: e.target.value } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Banner caption (below GIF)</Label>
            <Input
              value={content.hero.caption ?? ""}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, caption: e.target.value } })
              }
              placeholder="Featured Here The Shirodhara Massage Bed"
            />
          </div>
        </TabsContent>

        <TabsContent value="arabic" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">
            Shown by default (right-to-left). Use grid shortcodes for address boxes, e.g.{" "}
            <code className="rounded bg-stone-100 px-1">
              [grid col=&quot;6&quot; border=&quot;1&quot;]Title… Address…[/grid]
            </code>{" "}
            — <code className="rounded bg-stone-100 px-1">col=&quot;6&quot;</code> is half width,{" "}
            <code className="rounded bg-stone-100 px-1">col=&quot;4&quot;</code> is one-third.
          </p>
          <RichTextEditor
            value={content.intro.arabicHtml}
            onChange={() => {}}
            onHtmlChange={(html) =>
              setContent({
                ...content,
                intro: { ...content.intro, arabicHtml: html },
              })
            }
            placeholder="Arabic regional content…"
          />
        </TabsContent>

        <TabsContent value="english" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">
            Shown when visitor clicks the ENGLISH button. For side-by-side address boxes use{" "}
            <code className="rounded bg-stone-100 px-1">
              [grid col=&quot;6&quot; border=&quot;1&quot;]DUBAI… Address…[/grid]
            </code>{" "}
            twice in a row. Optional: <code className="rounded bg-stone-100 px-1">style=&quot;…&quot;</code>{" "}
            for inline CSS on the box.
          </p>
          <RichTextEditor
            value={content.intro.englishHtml}
            onChange={() => {}}
            onHtmlChange={(html) =>
              setContent({
                ...content,
                intro: { ...content.intro, englishHtml: html },
              })
            }
            placeholder="English regional content…"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>English toggle button label</Label>
              <Input
                value={content.intro.englishButtonLabel}
                onChange={(e) =>
                  setContent({
                    ...content,
                    intro: { ...content.intro, englishButtonLabel: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Arabic toggle button label</Label>
              <Input
                value={content.intro.arabicButtonLabel}
                onChange={(e) =>
                  setContent({
                    ...content,
                    intro: { ...content.intro, arabicButtonLabel: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input
              value={content.productsIntro.tag}
              onChange={(e) =>
                setContent({
                  ...content,
                  productsIntro: { ...content.productsIntro, tag: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Heading (use Enter for line break)</Label>
            <Textarea
              value={content.productsIntro.heading}
              onChange={(e) =>
                setContent({
                  ...content,
                  productsIntro: { ...content.productsIntro, heading: e.target.value },
                })
              }
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={content.productsIntro.body}
              onChange={(e) =>
                setContent({
                  ...content,
                  productsIntro: { ...content.productsIntro, body: e.target.value },
                })
              }
              rows={5}
            />
          </div>
          <p className="text-xs text-stone-500">
            Product category blocks below use the same featured categories as the homepage (Homepage →
            featured categories).
          </p>
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Page title</Label>
              <Input
                value={page.title}
                onChange={(e) => setPayload({ ...payload, page: { ...page, title: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={page.status}
                onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
                  setPayload({ ...payload, page: { ...page, status: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>SEO title</Label>
              <Input
                value={page.seoTitle}
                onChange={(e) =>
                  setPayload({ ...payload, page: { ...page, seoTitle: e.target.value } })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meta description</Label>
            <Textarea
              value={page.metaDescription}
              onChange={(e) =>
                setPayload({ ...payload, page: { ...page, metaDescription: e.target.value } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Keywords (comma separated)</Label>
            <Input
              value={page.keywords.join(", ")}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  page: {
                    ...page,
                    keywords: e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Canonical URL</Label>
            <Input
              value={page.canonicalUrl}
              onChange={(e) =>
                setPayload({ ...payload, page: { ...page, canonicalUrl: e.target.value } })
              }
              placeholder="https://www.spafurniture.in/uae/"
            />
          </div>
          <MediaField
            label="OG image"
            value={page.ogImagePreview}
            onChange={(media) =>
              setPayload({
                ...payload,
                page: {
                  ...page,
                  ogImageId: media?.mediaId ?? null,
                  ogImagePreview: media
                    ? { path: media.path, webpPath: media.webpPath, mediaId: media.mediaId }
                    : null,
                },
              })
            }
            previewClassName="h-32 w-56"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
