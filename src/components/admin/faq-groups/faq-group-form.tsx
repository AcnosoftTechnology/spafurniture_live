"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, CopyPlus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApiUrl } from "@/lib/utils";
import { formatSpEasyAccordionShortcode } from "@/lib/faq-shortcode";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FaqRow = {
  clientId: string;
  question: string;
  answer: string;
  open: boolean;
};

type FaqGroupInitial = {
  id?: string;
  name?: string;
  shortcodeId?: number;
  items?: Array<{ question: string; answer: string; sortOrder?: number }>;
};

function newRow(open = true): FaqRow {
  return { clientId: crypto.randomUUID(), question: "", answer: "", open };
}

function stripHtmlPreview(html: string, max = 48): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function FaqGroupForm({ initial }: { initial?: FaqGroupInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [shortcodeId, setShortcodeId] = useState<number | undefined>(initial?.shortcodeId);
  const [items, setItems] = useState<FaqRow[]>(
    initial?.items?.length
      ? initial.items.map((item) => ({
          clientId: crypto.randomUUID(),
          question: item.question,
          answer: item.answer,
          open: false,
        }))
      : [newRow(true)],
  );

  const shortcode =
    shortcodeId && shortcodeId > 0 ? formatSpEasyAccordionShortcode(shortcodeId) : "";

  function updateRow(clientId: string, patch: Partial<FaqRow>) {
    setItems((rows) => rows.map((r) => (r.clientId === clientId ? { ...r, ...patch } : r)));
  }

  function duplicateRow(clientId: string) {
    const row = items.find((r) => r.clientId === clientId);
    if (!row) return;
    const copy: FaqRow = {
      clientId: crypto.randomUUID(),
      question: row.question,
      answer: row.answer,
      open: true,
    };
    const index = items.findIndex((r) => r.clientId === clientId);
    setItems((rows) => [...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)]);
    toast.success("FAQ item duplicated");
  }

  function removeRow(clientId: string) {
    if (items.length <= 1) {
      updateRow(clientId, { question: "", answer: "" });
      return;
    }
    setItems((rows) => rows.filter((r) => r.clientId !== clientId));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        items: items
          .filter((row) => row.question.trim())
          .map((row, index) => ({
            question: row.question,
            answer: row.answer,
            sortOrder: index,
          })),
      };

      const url = initial?.id
        ? adminApiUrl(`/api/v1/admin/faq-groups/${initial.id}`)
        : adminApiUrl("/api/v1/admin/faq-groups");
      const res = await fetch(url, {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Save failed");

      const saved = json.data;
      if (saved?.shortcodeId) setShortcodeId(saved.shortcodeId);
      toast.success("FAQ group saved");

      if (!initial?.id && saved?.id) {
        router.push(`/admin/faq-groups/${saved.id}/`);
      } else {
        router.push("/admin/faq-groups/");
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateGroup() {
    if (!initial?.id) return;
    setSaving(true);
    try {
      const res = await fetch(adminApiUrl(`/api/v1/admin/faq-groups/${initial.id}/duplicate`), {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Duplicate failed");
      toast.success("Group duplicated with new shortcode");
      router.push(`/admin/faq-groups/${json.data.id}/`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Duplicate failed");
    } finally {
      setSaving(false);
    }
  }

  function copyShortcode() {
    if (!shortcode) {
      toast.error("Save the group first to generate a shortcode");
      return;
    }
    void navigator.clipboard.writeText(shortcode);
    toast.success("Shortcode copied — paste into any post or page");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px] flex-1 space-y-2">
          <Label htmlFor="faq-group-name">Accordion group title</Label>
          <Input
            id="faq-group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eco-Friendly Salon Equipment FAQs"
            className="text-base"
          />
        </div>
        {initial?.id ? (
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={duplicateGroup}>
            <CopyPlus className="mr-1 h-4 w-4" />
            Duplicate group
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-700 dark:bg-stone-900/40">
        <Label className="text-xs uppercase tracking-wider text-stone-500">Shortcode</Label>
        {shortcode ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Input readOnly value={shortcode} className="max-w-md font-mono text-sm" onFocus={(e) => e.target.select()} />
            <Button type="button" variant="outline" size="sm" onClick={copyShortcode}>
              <Copy className="mr-1 h-4 w-4" />
              Copy
            </Button>
            <span className="text-xs text-stone-500">ID {shortcodeId} — paste into blog post or page content</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-600">
            A unique ID and shortcode are created automatically when you save this group.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Custom content</h2>
        <p className="text-xs text-stone-500">Add questions and answers. Order is top to bottom on the site.</p>

        <div className="space-y-2">
          {items.map((row, index) => {
            const preview = row.question.trim() || stripHtmlPreview(row.answer) || "New item";
            return (
              <div
                key={row.clientId}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-950"
              >
                <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-3 py-2 dark:border-stone-800 dark:bg-stone-900/50">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-stone-800 dark:text-stone-200"
                    onClick={() => updateRow(row.clientId, { open: !row.open })}
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 text-stone-500 transition-transform", row.open && "rotate-180")}
                    />
                    <span className="truncate">
                      <span className="font-medium text-stone-500">{index + 1}. Item :</span> {preview}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    title="Duplicate item"
                    onClick={() => duplicateRow(row.clientId)}
                  >
                    <CopyPlus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-stone-500"
                    title="Remove item"
                    onClick={() => removeRow(row.clientId)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {row.open ? (
                  <div className="space-y-3 p-4">
                    <div>
                      <Label>Question</Label>
                      <Input
                        value={row.question}
                        onChange={(e) => updateRow(row.clientId, { question: e.target.value })}
                        placeholder="What is automated salon furniture?"
                      />
                    </div>
                    <div>
                      <Label>Answer (HTML allowed)</Label>
                      <Textarea
                        rows={5}
                        value={row.answer}
                        onChange={(e) => updateRow(row.clientId, { answer: e.target.value })}
                        placeholder="Your answer…"
                      />
                    </div>
                    {items.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeRow(row.clientId)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete item
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={() => setItems((rows) => [...rows, newRow(true)])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <div className="flex gap-3 border-t border-stone-200 pt-6">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : initial?.id ? "Update group" : "Publish group"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/faq-groups/")}>
          Back to list
        </Button>
      </div>
    </div>
  );
}
