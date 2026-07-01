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
import { PdfBrochureField } from "@/components/admin/brochure/pdf-brochure-field";
import {
  DEFAULT_BROCHURE_EMBED_HTML,
  DEFAULT_ISSUU_EMBED_URL,
} from "@/features/brochure/schemas/brochure-content.schema";
import type { AdminBrochureEditorData } from "@/features/brochure/get-brochure-data";
import type { BrochurePageContent } from "@/features/brochure/schemas/brochure-content.schema";
import { adminApiUrl } from "@/lib/utils";

export function BrochureEditor({ initialData }: { initialData: AdminBrochureEditorData }) {
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState(initialData);
  const [pdfFilename, setPdfFilename] = useState(initialData.pdf?.filename ?? null);

  const { content, page } = payload;

  function setContent(next: BrochurePageContent) {
    setPayload({ ...payload, content: next });
  }

  async function save() {
    if (!content.embedHtml.trim()) {
      toast.error("Iframe embed code is required");
      return;
    }
    if (!content.embedHtml.toLowerCase().includes("<iframe")) {
      toast.error("Embed code must include an iframe tag");
      return;
    }

    setSaving(true);
    const res = await fetch(adminApiUrl("/api/v1/admin/brochure"), {
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
    toast.success("Brochure page saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Public page:{" "}
          <Link href="/brochure/" target="_blank" className="font-medium text-stone-900 underline">
            /brochure/
          </Link>
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save brochure page"}
        </Button>
      </div>

      <Tabs defaultValue="brochure">
        <TabsList>
          <TabsTrigger value="brochure">Brochure</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="brochure" className="mt-4 space-y-5 rounded-xl border border-stone-200 bg-white p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="brochure-embed-html">Iframe embed code</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setContent({ ...content, embedHtml: DEFAULT_BROCHURE_EMBED_HTML })}
              >
                Insert default Issuu embed
              </Button>
            </div>
            <Textarea
              id="brochure-embed-html"
              rows={14}
              className="font-mono text-xs leading-relaxed"
              value={content.embedHtml}
              onChange={(e) => setContent({ ...content, embedHtml: e.target.value })}
              placeholder={`<iframe src="${DEFAULT_ISSUU_EMBED_URL}" ...></iframe>`}
            />
            <p className="text-xs text-stone-500">
              Issuu (or any provider) se <strong>Embed</strong> → poora HTML copy karke yahan paste karo.
              Sirf <code className="text-[11px]">&lt;div&gt;</code> wrapper aur{" "}
              <code className="text-[11px]">&lt;iframe&gt;</code> allowed hai — scripts allow nahi hain.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Download button label</Label>
            <Input
              value={content.downloadLabel}
              onChange={(e) => setContent({ ...content, downloadLabel: e.target.value })}
            />
          </div>

          <PdfBrochureField
            mediaId={content.pdfMediaId ?? null}
            filename={pdfFilename}
            onChange={({ mediaId, filename }) => {
              setContent({ ...content, pdfMediaId: mediaId });
              setPdfFilename(filename ?? null);
            }}
          />
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Page title</Label>
              <Input value={page.title} onChange={(e) => setPayload({ ...payload, page: { ...page, title: e.target.value } })} />
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
              onChange={(e) => setPayload({ ...payload, page: { ...page, metaDescription: e.target.value } })}
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
                  ogImagePreview: media ? { path: media.path, webpPath: media.webpPath, mediaId: media.mediaId } : null,
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
