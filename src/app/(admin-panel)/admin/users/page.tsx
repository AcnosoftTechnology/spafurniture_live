import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableCell } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: Array<{ id: string; name: string; email: string; role: string; status: string }> = [];
  try {
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, lastLoginAt: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // empty
  }

  return (
    <>
      <AdminHeader title="Users" />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable>
          <table className="w-full">
            <DataTableHeader>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </DataTableHeader>
            <DataTableBody>
              {users.map((u) => (
                <DataTableRow key={u.id}>
                  <DataTableCell>{u.name}</DataTableCell>
                  <DataTableCell>{u.email}</DataTableCell>
                  <DataTableCell><Badge variant="secondary">{u.role}</Badge></DataTableCell>
                  <DataTableCell>{u.status}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
      </main>
    </>
  );
}
