"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutBannerSliderField } from "@/components/admin/about/about-banner-slider-field";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import { LogoListField } from "@/components/admin/cms/logo-list-field";
import type { AboutContent } from "@/features/about/schemas/about-content.schema";
import type { AdminAboutEditorData } from "@/features/about/get-about-data";
import { slugify } from "@/lib/utils";

function pathToMedia(path: string, mediaId?: string | null, alt?: string | null): MediaFieldValue | null {
  if (!path) return null;
  return { path, mediaId: mediaId ?? null, alt: alt ?? null };
}

function ParagraphList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-stone-500">HTML allowed for links (e.g. &lt;a href=&quot;/products/&quot;&gt;spa&lt;/a&gt;).</p>
      {items.map((paragraph, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            rows={3}
            value={paragraph}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        Add paragraph
      </Button>
    </div>
  );
}

export function AboutEditor({ initialData }: { initialData: AdminAboutEditorData }) {
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState(initialData);

  const { content, page } = payload;

  function setContent(next: AboutContent) {
    setPayload({ ...payload, content: next });
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/v1/admin/about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: payload.content, page: payload.page }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string }; data?: { slug?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to save");
      return;
    }
    if (json.data?.slug) {
      setPayload((current) => ({
        ...current,
        page: { ...current.page, slug: json.data?.slug ?? current.page.slug },
      }));
    }
    toast.success("About page saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Public URL:{" "}
          <Link
            href={`/${page.slug.replace(/^\/+|\/+$/g, "")}/`}
            target="_blank"
            className="font-medium text-stone-900 underline"
          >
            /{page.slug.replace(/^\/+|\/+$/g, "")}/
          </Link>
          . Upload team photo via Media if the default path is missing.
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save about page"}
        </Button>
      </div>

      <Tabs defaultValue="intro">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="intro">Intro</TabsTrigger>
          <TabsTrigger value="team">Banner slider</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="intro" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input
              value={content.intro.eyebrow}
              onChange={(e) => setContent({ ...content, intro: { ...content.intro, eyebrow: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input
              value={content.intro.title}
              onChange={(e) => setContent({ ...content, intro: { ...content.intro, title: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Introduction</Label>
            <Textarea
              rows={5}
              value={content.intro.body}
              onChange={(e) => setContent({ ...content, intro: { ...content.intro, body: e.target.value } })}
            />
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-600">
            Full-width hero slider below the intro. Add multiple banners with overlay text, pick a transition
            effect, and set how long each slide stays visible.
          </p>
          <AboutBannerSliderField
            value={content.teamBanner}
            onChange={(teamBanner) => setContent({ ...content, teamBanner })}
          />
        </TabsContent>

        <TabsContent value="body" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Subheading</Label>
            <Textarea
              rows={2}
              value={content.body.subheading}
              onChange={(e) => setContent({ ...content, body: { ...content.body, subheading: e.target.value } })}
            />
          </div>
          <ParagraphList
            label="Body paragraphs"
            items={content.body.paragraphs}
            onChange={(paragraphs) => setContent({ ...content, body: { ...content.body, paragraphs } })}
          />
        </TabsContent>

        <TabsContent value="gallery" className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
          <LogoListField
            label="Process / workshop images (carousel + lightbox; 4+ recommended)"
            items={content.body.gallery.map((g) => ({
              title: g.alt ?? "",
              imagePath: g.imagePath,
              mediaId: g.mediaId,
            }))}
            onChange={(items) =>
              setContent({
                ...content,
                body: {
                  ...content.body,
                  gallery: items.map((item) => ({
                    imagePath: item.imagePath,
                    mediaId: item.mediaId,
                    alt: item.title || undefined,
                  })),
                },
              })
            }
          />
        </TabsContent>

        <TabsContent value="cta" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>CTA text</Label>
            <Textarea
              rows={3}
              value={content.cta.text}
              onChange={(e) => setContent({ ...content, cta: { ...content.cta, text: e.target.value } })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Button label</Label>
              <Input
                value={content.cta.buttonLabel}
                onChange={(e) => setContent({ ...content, cta: { ...content.cta, buttonLabel: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>Button link</Label>
              <Input
                value={content.cta.buttonHref}
                onChange={(e) => setContent({ ...content, cta: { ...content.cta, buttonHref: e.target.value } })}
              />
            </div>
          </div>
          <MediaField
            label="Background texture (optional)"
            value={pathToMedia(content.cta.backgroundImagePath, content.cta.mediaId)}
            onChange={(media) =>
              setContent({
                ...content,
                cta: {
                  ...content.cta,
                  backgroundImagePath: media?.path ?? content.cta.backgroundImagePath,
                  mediaId: media?.mediaId ?? null,
                },
              })
            }
            previewClassName="h-24 w-40"
          />
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>URL slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">/</span>
              <Input
                value={page.slug}
                onChange={(e) =>
                  setPayload({
                    ...payload,
                    page: { ...page, slug: slugify(e.target.value) || page.slug },
                  })
                }
                placeholder="about-us"
              />
              <span className="text-sm text-stone-500">/</span>
            </div>
            <p className="text-xs text-stone-500">
              Example: <code className="text-stone-700">about-us</code> → /about-us/
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Page title</Label>
              <Input value={page.title} onChange={(e) => setPayload({ ...payload, page: { ...page, title: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input value={page.seoTitle} onChange={(e) => setPayload({ ...payload, page: { ...page, seoTitle: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meta description</Label>
            <Textarea
              value={page.metaDescription}
              onChange={(e) => setPayload({ ...payload, page: { ...page, metaDescription: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Keywords (comma separated)</Label>
            <Input
              value={page.keywords.join(", ")}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  page: { ...page, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) },
                })
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>OG title</Label>
              <Input
                value={page.ogTitle}
                onChange={(e) => setPayload({ ...payload, page: { ...page, ogTitle: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>OG description</Label>
              <Input
                value={page.ogDescription}
                onChange={(e) => setPayload({ ...payload, page: { ...page, ogDescription: e.target.value } })}
              />
            </div>
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
                    ? {
                        path: media.path,
                        webpPath: media.webpPath,
                        mediaId: media.mediaId ?? null,
                      }
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
