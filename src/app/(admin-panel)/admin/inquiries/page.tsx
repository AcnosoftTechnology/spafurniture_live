"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableCell } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: string;
  createdAt: string;
  product?: { title: string } | null;
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/inquiries")
      .then((r) => r.json())
      .then((d) => {
        setInquiries(d.data ?? []);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/v1/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  return (
    <>
      <AdminHeader title="Inquiries" />
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <ShimmerSkeleton className="h-64" />
        ) : (
          <DataTable>
            <table className="w-full">
              <DataTableHeader>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </DataTableHeader>
              <DataTableBody>
                {inquiries.map((inq) => (
                  <DataTableRow key={inq.id}>
                    <DataTableCell>
                      <p className="font-medium">{inq.name}</p>
                      <p className="text-stone-500">{inq.email}</p>
                    </DataTableCell>
                    <DataTableCell>{inq.subject ?? "—"}</DataTableCell>
                    <DataTableCell>{inq.product?.title ?? "—"}</DataTableCell>
                    <DataTableCell>
                      <select
                        value={inq.status}
                        onChange={(e) => updateStatus(inq.id, e.target.value)}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        <option value="NEW">New</option>
                        <option value="READ">Read</option>
                        <option value="REPLIED">Replied</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </DataTableCell>
                    <DataTableCell className="text-stone-500">
                      {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        )}
      </main>
    </>
  );
}
