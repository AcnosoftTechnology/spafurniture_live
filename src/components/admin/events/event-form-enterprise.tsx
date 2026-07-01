"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import { RichTextEditor } from "@/components/admin/cms/rich-text-editor";
import { FormToolbar } from "@/components/admin/cms/form-toolbar";
import { PublishSidebar } from "@/components/admin/cms/publish-sidebar";
import { CmsEditorLayout } from "@/components/admin/cms/cms-editor-layout";
import { adminApiUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  defaultEventSidebar,
  type EventSidebar,
} from "@/features/events/schemas/event-sidebar.schema";

type ReadMoreMode = "none" | "link" | "html";

type EventInitial = {
  id?: string;
  title?: string;
  eventDate?: string | Date;
  findUsTitle?: string;
  findUsBody?: string;
  contactTitle?: string;
  contactBody?: string;
  phone?: string;
  phoneHref?: string;
  readMoreUrl?: string | null;
  readMoreHtml?: string | null;
  status?: string;
  imageMediaId?: string | null;
  imageMedia?: { path: string; webpPath?: string | null; filename?: string } | null;
};

function toDatetimeLocal(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function resolveReadMoreMode(initial?: EventInitial): ReadMoreMode {
  if (initial?.readMoreUrl?.trim()) return "link";
  if (initial?.readMoreHtml?.trim()) return "html";
  return "none";
}

function resolveSidebar(initial?: EventInitial): EventSidebar {
  return {
    findUsTitle: initial?.findUsTitle ?? defaultEventSidebar.findUsTitle,
    findUsBody: initial?.findUsBody ?? defaultEventSidebar.findUsBody,
    contactTitle: initial?.contactTitle ?? defaultEventSidebar.contactTitle,
    contactBody: initial?.contactBody ?? defaultEventSidebar.contactBody,
    phone: initial?.phone ?? defaultEventSidebar.phone,
    phoneHref: initial?.phoneHref ?? defaultEventSidebar.phoneHref,
  };
}

export function EventFormEnterprise({ initial }: { initial?: EventInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [eventDate, setEventDate] = useState(toDatetimeLocal(initial?.eventDate));
  const [sidebar, setSidebar] = useState<EventSidebar>(() => resolveSidebar(initial));
  const [readMoreMode, setReadMoreMode] = useState<ReadMoreMode>(() => resolveReadMoreMode(initial));
  const [readMoreUrl, setReadMoreUrl] = useState(initial?.readMoreUrl ?? "");
  const [readMoreHtml, setReadMoreHtml] = useState(initial?.readMoreHtml ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [image, setImage] = useState<MediaFieldValue | null>(
    initial?.imageMedia
      ? {
          mediaId: initial.imageMediaId ?? null,
          path: initial.imageMedia.path,
          webpPath: initial.imageMedia.webpPath,
          filename: initial.imageMedia.filename,
        }
      : null,
  );

  function updateSidebar<K extends keyof EventSidebar>(key: K, value: EventSidebar[K]) {
    setSidebar((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!image?.mediaId) {
      toast.error("Event image is required");
      return;
    }
    if (!eventDate) {
      toast.error("Event date is required");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      eventDate,
      imageMediaId: image.mediaId,
      ...sidebar,
      readMoreUrl: readMoreMode === "link" ? readMoreUrl.trim() || null : null,
      readMoreHtml: readMoreMode === "html" ? readMoreHtml.trim() || null : null,
      status,
    };

    const url = initial?.id
      ? adminApiUrl(`/api/v1/admin/events/${initial.id}`)
      : adminApiUrl("/api/v1/admin/events");
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
    toast.success("Event saved");
    if (!initial?.id && data?.data?.id) router.push(`/admin/events/${data.data.id}/`);
    else router.refresh();
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm(`Delete event "${title}"?`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl(`/api/v1/admin/events/${initial.id}`), { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Event deleted");
    router.push("/admin/events/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <FormToolbar
        title={title || "Event"}
        status={status}
        saving={saving}
        onSave={save}
        backHref="/admin/events/"
        previewUrl="/shows-and-exhibitions/"
      />
      <CmsEditorLayout
        main={
          <div className="space-y-8 rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-950">
            <div className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-700">
              <div>
                <Label className="text-base">1. Find Us</Label>
                <p className="mt-1 text-xs text-stone-500">
                  Left sidebar block for this event. Default text is pre-filled for new events.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="find-us-title">Title</Label>
                <Input
                  id="find-us-title"
                  value={sidebar.findUsTitle}
                  onChange={(e) => updateSidebar("findUsTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="find-us-body">Content</Label>
                <Textarea
                  id="find-us-body"
                  rows={3}
                  value={sidebar.findUsBody}
                  onChange={(e) => updateSidebar("findUsBody", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-700">
              <div>
                <Label className="text-base">2. Get in Touch</Label>
                <p className="mt-1 text-xs text-stone-500">
                  Contact block below Find Us for this event.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-title">Title</Label>
                <Input
                  id="contact-title"
                  value={sidebar.contactTitle}
                  onChange={(e) => updateSidebar("contactTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-body">Content</Label>
                <Textarea
                  id="contact-body"
                  rows={2}
                  value={sidebar.contactBody}
                  onChange={(e) => updateSidebar("contactBody", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone display</Label>
                  <Input
                    id="contact-phone"
                    value={sidebar.phone}
                    onChange={(e) => updateSidebar("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone-href">Phone link</Label>
                  <Input
                    id="contact-phone-href"
                    value={sidebar.phoneHref}
                    onChange={(e) => updateSidebar("phoneHref", e.target.value)}
                    placeholder="tel:+919873144051"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-title">3. Event title</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event 1"
              />
              <p className="text-xs text-stone-500">Used as the heading and image alt text on the public page.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">Event date (sorting)</Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
              <p className="text-xs text-stone-500">Latest dates appear first. Not shown on the public layout.</p>
            </div>

            <MediaField
              label="4. Event image"
              value={image}
              onChange={setImage}
              previewClassName="aspect-[16/10] w-full max-w-xl"
            />

            <div className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-700">
              <div>
                <Label>5. Read more</Label>
                <p className="mt-1 text-xs text-stone-500">
                  Choose an external link (opens in a new tab) or HTML content (opens in a modal).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={readMoreMode === "none" ? "default" : "outline"}
                  onClick={() => setReadMoreMode("none")}
                >
                  None
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={readMoreMode === "link" ? "default" : "outline"}
                  onClick={() => setReadMoreMode("link")}
                >
                  External link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={readMoreMode === "html" ? "default" : "outline"}
                  onClick={() => setReadMoreMode("html")}
                >
                  HTML content
                </Button>
              </div>

              {readMoreMode === "link" ? (
                <div className="space-y-2">
                  <Label htmlFor="event-read-more-url">External URL</Label>
                  <Input
                    id="event-read-more-url"
                    value={readMoreUrl}
                    onChange={(e) => setReadMoreUrl(e.target.value)}
                    placeholder="https://example.com/event-details"
                  />
                </div>
              ) : null}

              {readMoreMode === "html" ? (
                <div className="space-y-2">
                  <Label>Read more content</Label>
                  <RichTextEditor
                    value={readMoreHtml}
                    onChange={() => {}}
                    onHtmlChange={setReadMoreHtml}
                    placeholder="Write event details for the Read More modal…"
                  />
                </div>
              ) : null}
            </div>
          </div>
        }
        sidebar={
          <>
            <PublishSidebar status={status} onStatusChange={setStatus} onSave={save} saving={saving} entityLabel="Event" />
            {initial?.id ? (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                <Button type="button" variant="destructive" size="sm" className="w-full" disabled={deleting} onClick={remove}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {deleting ? "Deleting…" : "Delete event"}
                </Button>
              </div>
            ) : null}
          </>
        }
      />
    </div>
  );
}
