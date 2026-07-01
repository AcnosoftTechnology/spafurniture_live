"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaField } from "@/components/admin/cms/media-field";
import {
  countClientNames,
  editableTextToSections,
  sectionsToEditableText,
} from "@/features/clients/parse-client-list";
import type { AdminClientsEditorData } from "@/features/clients/get-clients-data";
import type { ClientsPageContent } from "@/features/clients/schemas/clients-content.schema";

export function ClientsEditor({ initialData }: { initialData: AdminClientsEditorData }) {
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState(initialData);
  const [namesText, setNamesText] = useState(() => sectionsToEditableText(initialData.content.sections));

  const { content, page } = payload;

  const previewStats = useMemo(() => {
    const sections = editableTextToSections(namesText);
    return { sections: sections.length, names: countClientNames(sections) };
  }, [namesText]);

  function setContent(next: ClientsPageContent) {
    setPayload({ ...payload, content: next });
  }

  async function save() {
    const sections = editableTextToSections(namesText);
    if (!sections.length) {
      toast.error("Add at least one client name");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/v1/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { ...content, sections },
        page,
      }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to save");
      return;
    }
    setPayload({ ...payload, content: { ...content, sections } });
    toast.success(`Saved ${previewStats.names} clients`);
  }

  function reloadFromSaved() {
    setNamesText(sectionsToEditableText(payload.content.sections));
    toast.message("List reset to last saved version");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Public page:{" "}
          <Link href="/clients/" target="_blank" className="font-medium text-stone-900 underline">
            /clients/
          </Link>
        </p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save clients page"}
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="list">Client list</TabsTrigger>
          <TabsTrigger value="intro">Intro</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            <p className="font-medium text-stone-800">Easy editing</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>One client name per line</li>
              <li>
                Put a line with only <code className="text-xs">---</code> to start a new block (horizontal divider on
                site)
              </li>
              <li>
                Optional: use <code className="text-xs">|||</code> on its own line between left and right column names
              </li>
              <li>
                Without <code className="text-xs">|||</code>, names split automatically into two columns (50/50)
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span>
              Preview: {previewStats.names} names in {previewStats.sections} section
              {previewStats.sections === 1 ? "" : "s"}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={reloadFromSaved}>
              Reset list
            </Button>
          </div>

          <Textarea
            rows={22}
            className="font-mono text-xs leading-relaxed"
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder={"Six Senses Fort, Barwara\nSix Senses Con Dao, Vietnam\n---\nRaffles, Singapore\n..."}
          />
        </TabsContent>

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
              rows={4}
              value={content.intro.body}
              onChange={(e) => setContent({ ...content, intro: { ...content.intro, body: e.target.value } })}
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
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
