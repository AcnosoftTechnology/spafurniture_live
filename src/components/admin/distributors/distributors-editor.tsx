"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaField } from "@/components/admin/cms/media-field";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import type { AdminDistributorsEditorData } from "@/features/distributors/get-distributors-data";
import { hasVisibleHtml } from "@/features/distributors/normalize-distributors-content";
import type { DistributorsPageContent } from "@/features/distributors/schemas/distributors-content.schema";

export function DistributorsEditor({ initialData }: { initialData: AdminDistributorsEditorData }) {
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState(initialData);

  const { content, page } = payload;

  function setContent(next: DistributorsPageContent) {
    setPayload({ ...payload, content: next });
  }

  async function save() {
    if (!hasVisibleHtml(content.sidebar.regionsHtml)) {
      toast.error("Add sidebar content for distributor regions");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/v1/admin/distributors", {
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

    toast.success("Distributors page saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Public page:{" "}
          <Link
            href="/international-distributors/"
            target="_blank"
            className="font-medium text-stone-900 underline"
          >
            /international-distributors/
          </Link>
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save page"}
        </Button>
      </div>

      <Tabs defaultValue="intro">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="intro">Page header</TabsTrigger>
          <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="intro" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Eyebrow</Label>
            <Input
              value={content.intro.eyebrow}
              onChange={(e) =>
                setContent({ ...content, intro: { ...content.intro, eyebrow: e.target.value } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input
              value={content.intro.title}
              onChange={(e) =>
                setContent({ ...content, intro: { ...content.intro, title: e.target.value } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Introduction</Label>
            <RichTextEditor
              value={content.intro.body}
              onChange={() => {}}
              onHtmlChange={(html) =>
                setContent({ ...content, intro: { ...content.intro, body: html } })
              }
              placeholder="Intro text below the page heading…"
            />
          </div>
        </TabsContent>

        <TabsContent value="sidebar" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Regions heading</Label>
            <Input
              value={content.sidebar.heading}
              onChange={(e) =>
                setContent({
                  ...content,
                  sidebar: { ...content.sidebar, heading: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Regions content</Label>
            <p className="text-xs text-stone-500">
              Use lists, bold, links, or any formatted HTML. This replaces the old one-line-per-country list.
            </p>
            <RichTextEditor
              value={content.sidebar.regionsHtml}
              onChange={() => {}}
              onHtmlChange={(html) =>
                setContent({
                  ...content,
                  sidebar: { ...content.sidebar, regionsHtml: html },
                })
              }
              placeholder="Country list, links, etc."
            />
          </div>
          <div className="space-y-2">
            <Label>Call to action</Label>
            <RichTextEditor
              value={content.sidebar.ctaHtml}
              onChange={() => {}}
              onHtmlChange={(html) =>
                setContent({
                  ...content,
                  sidebar: { ...content.sidebar, ctaHtml: html },
                })
              }
              placeholder="Text below the regions list…"
            />
          </div>
          <div className="space-y-2">
            <Label>Social section title</Label>
            <Input
              value={content.sidebar.socialTitle}
              onChange={(e) =>
                setContent({
                  ...content,
                  sidebar: { ...content.sidebar, socialTitle: e.target.value },
                })
              }
            />
          </div>
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
              <Label>SEO title</Label>
              <Input
                value={page.seoTitle}
                onChange={(e) => setPayload({ ...payload, page: { ...page, seoTitle: e.target.value } })}
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
