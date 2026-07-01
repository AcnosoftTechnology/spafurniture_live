"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import type { AdminShowsExhibitionsEditorData } from "@/features/shows-exhibitions/get-shows-exhibitions-data";
import type { ShowsExhibitionsPageContent } from "@/features/shows-exhibitions/schemas/shows-exhibitions-content.schema";
import { adminApiUrl } from "@/lib/utils";

export function ShowsExhibitionsEditor({ initialData }: { initialData: AdminShowsExhibitionsEditorData }) {
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState(initialData);
  const [banner, setBanner] = useState<MediaFieldValue | null>(
    initialData.bannerPreview
      ? {
          mediaId: initialData.content.bannerMediaId ?? initialData.bannerPreview.mediaId ?? null,
          path: initialData.bannerPreview.path,
          webpPath: initialData.bannerPreview.webpPath,
        }
      : null,
  );

  const { content, page } = payload;

  function setContent(next: ShowsExhibitionsPageContent) {
    setPayload({ ...payload, content: next });
  }

  async function save() {
    setSaving(true);
    const res = await fetch(adminApiUrl("/api/v1/admin/shows-exhibitions"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          ...content,
          bannerMediaId: banner?.mediaId ?? null,
        },
        page,
      }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to save");
      return;
    }
    toast.success("Shows & Exhibitions page saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Public page:{" "}
          <Link href="/shows-and-exhibitions/" target="_blank" className="font-medium text-stone-900 underline">
            /shows-and-exhibitions/
          </Link>
          {" · "}
          <Link href="/admin/events/" className="font-medium text-stone-900 underline">
            Manage events
          </Link>
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save page"}
        </Button>
      </div>

      <Tabs defaultValue="page">
        <TabsList>
          <TabsTrigger value="page">Page</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="page" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <MediaField
            label="Top banner image"
            value={banner}
            onChange={setBanner}
            previewClassName="aspect-[21/9] w-full max-w-3xl"
          />
          <div className="space-y-2">
            <Label>Banner overlay title</Label>
            <Input
              value={content.bannerTitle}
              onChange={(e) => setContent({ ...content, bannerTitle: e.target.value })}
              placeholder="Get in Touch"
            />
          </div>
          <div className="space-y-2">
            <Label>Page heading</Label>
            <Input
              value={content.pageHeading}
              onChange={(e) => setContent({ ...content, pageHeading: e.target.value })}
              placeholder="Shows & Exhibitions"
            />
          </div>
          <div className="space-y-2">
            <Label>Events per page</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={content.pageSize}
              onChange={(e) =>
                setContent({
                  ...content,
                  pageSize: Math.min(50, Math.max(1, Number(e.target.value) || 10)),
                })
              }
            />
            <p className="text-xs text-stone-500">How many events to show on each page before pagination.</p>
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
            <textarea
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm"
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
              onChange={(e) => setPayload({ ...payload, page: { ...page, canonicalUrl: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Robots</Label>
            <Input
              value={page.robots}
              onChange={(e) => setPayload({ ...payload, page: { ...page, robots: e.target.value } })}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
