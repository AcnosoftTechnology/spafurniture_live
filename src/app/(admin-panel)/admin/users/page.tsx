import { AdminHeader } from "@/components/admin/admin-header";
import { AdminUsersTable } from "@/components/admin/users/admin-users-table";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { canManageUsers } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  const canEditUsers = session?.user?.role ? canManageUsers(session.user.role) : false;
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
        <AdminUsersTable users={users} canEditUsers={canEditUsers} />
      </main>
    </>
  );
}
