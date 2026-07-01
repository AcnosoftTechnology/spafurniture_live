"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, CopyPlus, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { AdminListPagination } from "@/components/admin/admin-list-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApiUrl } from "@/lib/utils";
import { formatSpEasyAccordionShortcode } from "@/lib/faq-shortcode";

export type FaqGroupListItem = {
  id: string;
  name: string;
  shortcodeId: number;
  shortcode: string;
  itemCount: number;
  updatedAt: string;
};

const PAGE_SIZE = 20;

export function FaqGroupsListTable({
  initialGroups = [],
  loadError = null,
}: {
  initialGroups?: FaqGroupListItem[];
  loadError?: string | null;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<FaqGroupListItem[]>(initialGroups);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/faq-groups"));
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to load FAQ groups");
        return;
      }
      setGroups(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error("Failed to load FAQ groups");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        String(g.shortcodeId).includes(q) ||
        g.shortcode.toLowerCase().includes(q),
    );
  }, [groups, search]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function copyShortcode(shortcode: string) {
    void navigator.clipboard.writeText(shortcode);
    toast.success("Shortcode copied");
  }

  async function duplicateGroup(id: string) {
    setDuplicating(id);
    const res = await fetch(adminApiUrl(`/api/v1/admin/faq-groups/${id}/duplicate`), { method: "POST" });
    setDuplicating(null);
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.message ?? "Duplicate failed");
      return;
    }
    toast.success("FAQ group duplicated");
    await load();
    const newId = json.data?.id;
    if (newId) router.push(`/admin/faq-groups/${newId}/`);
  }

  async function deleteGroup(id: string, name: string) {
    if (!confirm(`Delete FAQ group "${name}"? Posts using its shortcode will show an empty accordion.`)) return;
    setDeleting(id);
    const res = await fetch(adminApiUrl(`/api/v1/admin/faq-groups/${id}`), { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("FAQ group deleted");
    load();
  }

  return (
    <div className="space-y-4">
      {loadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}. Try <code className="rounded bg-white px-1">npm run dev:stop</code> then{" "}
          <code className="rounded bg-white px-1">npx prisma generate</code> and{" "}
          <code className="rounded bg-white px-1">npm run dev</code>.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          All ({groups.length})
          {search ? ` · ${total} matching` : null}
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <Input
              className="h-9 w-56 pl-8 text-sm"
              placeholder="Search FAQ group"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <DataTable>
        <table className="w-full min-w-[720px]">
          <DataTableHeader>
            <DataTableCell className="px-4 py-3">Accordion group title</DataTableCell>
            <DataTableCell className="px-4 py-3 w-[280px]">Shortcode</DataTableCell>
            <DataTableCell className="px-4 py-3 w-20">Items</DataTableCell>
            <DataTableCell className="px-4 py-3 w-36">Date</DataTableCell>
            <DataTableCell className="px-4 py-3 w-32 text-right">Actions</DataTableCell>
          </DataTableHeader>
          <DataTableBody>
            {loading ? (
              <DataTableRow>
                <DataTableCell colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  Loading…
                </DataTableCell>
              </DataTableRow>
            ) : pageItems.length === 0 ? (
              <DataTableRow>
                <DataTableCell colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No FAQ groups found. Create one or import faq_group.xml from spadata.
                </DataTableCell>
              </DataTableRow>
            ) : (
              pageItems.map((group) => {
                const shortcode = group.shortcode || formatSpEasyAccordionShortcode(group.shortcodeId);
                const date = new Date(group.updatedAt);
                return (
                  <DataTableRow key={group.id}>
                    <DataTableCell className="px-4 py-3">
                      <Link
                        href={`/admin/faq-groups/${group.id}/`}
                        className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                      >
                        {group.name || "(no title)"}
                      </Link>
                    </DataTableCell>
                    <DataTableCell className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Input
                          readOnly
                          value={shortcode}
                          className="h-8 font-mono text-[11px] text-stone-700"
                          onFocus={(e) => e.target.select()}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          title="Copy shortcode"
                          onClick={() => copyShortcode(shortcode)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="px-4 py-3 text-stone-600">{group.itemCount}</DataTableCell>
                    <DataTableCell className="px-4 py-3 text-stone-500">
                      Published
                      <br />
                      <span className="text-[11px]">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </DataTableCell>
                    <DataTableCell className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="ghost" asChild title="Edit">
                          <Link href={`/admin/faq-groups/${group.id}/`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          title="Duplicate group"
                          disabled={duplicating === group.id}
                          onClick={() => duplicateGroup(group.id)}
                        >
                          <CopyPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                          disabled={deleting === group.id}
                          onClick={() => deleteGroup(group.id, group.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </table>
      </DataTable>

      <AdminListPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
