"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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

type EventRow = {
  id: string;
  title: string;
  eventDate: string;
  status: string;
};

const PAGE_SIZE = 20;

export function EventsListTable() {
  const router = useRouter();
  const [items, setItems] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search) params.set("search", search);

    const res = await fetch(adminApiUrl(`/api/v1/admin/events?${params}`));
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to load events");
      return;
    }

    const data = json.data ?? json;
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteOne(id: string, title: string) {
    if (!confirm(`Delete event "${title}"?`)) return;
    setDeleting(true);
    const res = await fetch(adminApiUrl(`/api/v1/admin/events/${id}`), { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error?.message ?? "Delete failed");
      return;
    }
    toast.success("Event deleted");
    router.refresh();
    await load();
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <Input
          placeholder="Search events..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <DataTable>
        <DataTableHeader>
          <DataTableRow>
            <DataTableCell>Title</DataTableCell>
            <DataTableCell>Event date</DataTableCell>
            <DataTableCell>Status</DataTableCell>
            <DataTableCell className="text-right">Actions</DataTableCell>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {loading ? (
            <DataTableRow>
              <DataTableCell colSpan={4}>Loading...</DataTableCell>
            </DataTableRow>
          ) : items.length === 0 ? (
            <DataTableRow>
              <DataTableCell colSpan={4}>No events yet.</DataTableCell>
            </DataTableRow>
          ) : (
            items.map((event) => (
              <DataTableRow key={event.id}>
                <DataTableCell>
                  <Link href={`/admin/events/${event.id}/`} className="font-medium hover:underline">
                    {event.title}
                  </Link>
                </DataTableCell>
                <DataTableCell>{format(new Date(event.eventDate), "d MMM yyyy")}</DataTableCell>
                <DataTableCell>
                  <Badge variant={event.status === "PUBLISHED" ? "default" : "secondary"}>{event.status}</Badge>
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    onClick={() => deleteOne(event.id, event.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <AdminListPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
