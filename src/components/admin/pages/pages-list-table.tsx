"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { AdminListPagination } from "@/components/admin/admin-list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApiUrl } from "@/lib/utils";
import { pagePath } from "@/lib/paths";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
};

const PAGE_SIZE = 20;
const PROTECTED = new Set(["home"]);

export function PagesListTable() {
  const router = useRouter();
  const [items, setItems] = useState<PageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (search) params.set("search", search);

    const res = await fetch(adminApiUrl(`/api/v1/admin/pages?${params}`));
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to load pages");
      return;
    }

    const data = json.data ?? json;
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setSelected(new Set());
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleAll(checked: boolean) {
    const deletable = items.filter((p) => !PROTECTED.has(p.slug));
    setSelected(checked ? new Set(deletable.map((p) => p.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function deleteOne(id: string, title: string, slug: string) {
    if (PROTECTED.has(slug)) {
      toast.error("Home page cannot be deleted");
      return;
    }
    if (!confirm(`Delete page "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl(`/api/v1/admin/pages/${id}`), { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Page deleted");
    router.refresh();
    await load();
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} page(s)? This cannot be undone.`)) return;

    setDeleting(true);
    const res = await fetch(adminApiUrl("/api/v1/admin/pages/bulk-delete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected] }),
    });
    setDeleting(false);
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.message ?? "Bulk delete failed");
      return;
    }
    toast.success(`Deleted ${json.data?.deleted ?? selected.size} page(s)`);
    router.refresh();
    await load();
  }

  const deletableOnPage = items.filter((p) => !PROTECTED.has(p.slug));
  const allSelected =
    deletableOnPage.length > 0 && deletableOnPage.every((p) => selected.has(p.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Input
            placeholder="Search pages…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 max-w-xs text-xs"
          />
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
        {selected.size > 0 && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={deleting}
            onClick={bulkDelete}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete selected ({selected.size})
          </Button>
        )}
      </div>

      <DataTable>
        <table className="w-full">
          <DataTableHeader>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleAll(e.target.checked)}
                aria-label="Select all deletable"
              />
            </th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </DataTableHeader>
          <DataTableBody>
            {loading ? (
              <DataTableRow>
                <DataTableCell colSpan={5} className="text-center text-stone-500">
                  Loading…
                </DataTableCell>
              </DataTableRow>
            ) : items.length === 0 ? (
              <DataTableRow>
                <DataTableCell colSpan={5} className="text-center text-stone-500">
                  No pages found. Import from WordPress or create a new page.
                </DataTableCell>
              </DataTableRow>
            ) : (
              items.map((p) => {
                const protectedPage = PROTECTED.has(p.slug);
                return (
                  <DataTableRow key={p.id}>
                    <DataTableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        disabled={protectedPage}
                        onChange={(e) => toggleOne(p.id, e.target.checked)}
                        aria-label={`Select ${p.title}`}
                      />
                    </DataTableCell>
                    <DataTableCell>
                      <Link href={`/admin/seo-pages/${p.id}`} className="font-medium hover:underline">
                        {p.title}
                      </Link>
                    </DataTableCell>
                    <DataTableCell>
                      <a
                        href={pagePath(p.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-500 hover:underline"
                      >
                        {pagePath(p.slug)}
                      </a>
                    </DataTableCell>
                    <DataTableCell>
                      <Badge variant={p.status === "PUBLISHED" ? "success" : "secondary"}>
                        {p.status}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="ghost" asChild>
                          <Link href={`/admin/seo-pages/${p.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {!protectedPage && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            disabled={deleting}
                            onClick={() => deleteOne(p.id, p.title, p.slug)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </table>
      </DataTable>

      <AdminListPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
