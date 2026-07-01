"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApiUrl } from "@/lib/utils";
import { toast } from "sonner";

type FaqGroupOption = {
  id: string;
  name: string;
  shortcodeId: number;
  shortcode: string;
  itemCount: number;
};

export function BlogFaqShortcodePanel({ onInsert }: { onInsert: (shortcode: string) => void }) {
  const [groups, setGroups] = useState<FaqGroupOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(adminApiUrl("/api/v1/admin/faq-groups"));
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Failed to load FAQ groups");
        if (!cancelled) {
          const list = (json.data ?? []) as FaqGroupOption[];
          setGroups(list);
          if (list[0]) setSelectedId(list[0].id);
        }
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Could not load FAQ groups");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = groups.find((g) => g.id === selectedId);

  function handleInsert() {
    if (!selected?.shortcode) {
      toast.error("Select an FAQ group first");
      return;
    }
    onInsert(selected.shortcode);
    toast.success("FAQ shortcode inserted into content");
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/80 p-4 dark:border-stone-700 dark:bg-stone-900/40">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-800 dark:text-stone-200">
        <HelpCircle className="h-4 w-4" />
        FAQ accordion (shortcode)
      </div>
      <p className="mb-3 text-xs text-stone-600 dark:text-stone-400">
        Inserts{" "}
        <code className="rounded bg-white px-1 dark:bg-stone-950">[sp_easyaccordion id=&quot;…&quot;]</code> into the
        post. FAQs are managed per group in{" "}
        <Link href="/admin/faq-groups/" className="underline">
          FAQ Groups
        </Link>
        .
      </p>

      {loading ? (
        <p className="text-xs text-stone-500">Loading groups…</p>
      ) : groups.length === 0 ? (
        <p className="text-xs text-stone-500">
          No FAQ groups yet.{" "}
          <Link href="/admin/faq-groups/new/" className="underline">
            Create one
          </Link>{" "}
          or import <code className="rounded bg-white px-1">faq_group.xml</code> from spadata.
        </p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1 space-y-1">
            <Label className="text-xs">FAQ group</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-9 bg-white text-sm dark:bg-stone-950">
                <SelectValue placeholder="Choose group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name} (id {g.shortcodeId}, {g.itemCount} FAQs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={handleInsert}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Insert shortcode
          </Button>
        </div>
      )}

      {selected?.shortcode ? (
        <p className="mt-2 font-mono text-[11px] text-stone-500">{selected.shortcode}</p>
      ) : null}
    </div>
  );
}
