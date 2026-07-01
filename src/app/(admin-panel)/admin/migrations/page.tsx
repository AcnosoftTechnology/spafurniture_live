import { AdminHeader } from "@/components/admin/admin-header";
import { MigrationsPanel } from "@/components/admin/migrations/migrations-panel";

export const dynamic = "force-dynamic";

export default function AdminMigrationsPage() {
  return (
    <>
      <AdminHeader title="Database Migrations" />
      <main className="flex-1 overflow-y-auto p-6">
        <MigrationsPanel />
      </main>
    </>
  );
}
