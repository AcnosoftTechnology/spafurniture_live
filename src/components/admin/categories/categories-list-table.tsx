"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableRow,
} from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApiUrl } from "@/lib/utils";
import { categoryPath } from "@/lib/paths";

export type CategoryListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  productCount: number;
  showInProductNav: boolean;
};

export function CategoriesListTable({ categories }: { categories: CategoryListItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const filtered = categories.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(filtered.map((c) => c.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function deleteOne(id: string, title: string) {
    if (!confirm(`Delete category "${title}"? Products will be unlinked from this category.`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl(`/api/v1/admin/categories/${id}`), { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} category(ies)? Products will be unlinked.`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl("/api/v1/admin/categories/bulk-delete"), {
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
    toast.success(`Deleted ${json.data?.deleted ?? selected.size} category(ies)`);
    setSelected(new Set());
    router.refresh();
  }

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
          }}
        >
          <Input
            placeholder="Search categories…"
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
                aria-label="Select all"
              />
            </th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Products</th>
            <th className="px-4 py-3">Tab</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </DataTableHeader>
          <DataTableBody>
            {filtered.length === 0 ? (
              <DataTableRow>
                <DataTableCell colSpan={7} className="text-center text-stone-500">
                  No categories found
                </DataTableCell>
              </DataTableRow>
            ) : (
              filtered.map((c) => (
                <DataTableRow key={c.id}>
                  <DataTableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={(e) => toggleOne(c.id, e.target.checked)}
                      aria-label={`Select ${c.title}`}
                    />
                  </DataTableCell>
                  <DataTableCell>
                    <Link
                      href={`/admin/categories/${c.id}/`}
                      className="font-medium hover:underline"
                    >
                      {c.title}
                    </Link>
                  </DataTableCell>
                  <DataTableCell>
                    <a
                      href={categoryPath(c.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-500 hover:underline"
                    >
                      {categoryPath(c.slug)}
                    </a>
                  </DataTableCell>
                  <DataTableCell>{c.productCount}</DataTableCell>
                  <DataTableCell>
                    {c.showInProductNav ? (
                      <Badge variant="secondary">Shown</Badge>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={c.status === "PUBLISHED" ? "success" : "secondary"}>
                      {c.status}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/categories/${c.id}/`}
                        className="text-sm text-stone-900 hover:underline dark:text-stone-100"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        disabled={deleting}
                        onClick={() => deleteOne(c.id, c.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </table>
      </DataTable>
    </div>
  );
}
