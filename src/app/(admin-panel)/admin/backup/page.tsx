import { AdminHeader } from "@/components/admin/admin-header";
import { BackupPanel } from "@/components/admin/backup/backup-panel";

export const dynamic = "force-dynamic";

export default function AdminBackupPage() {
  return (
    <>
      <AdminHeader title="Backup" />
      <main className="flex-1 overflow-y-auto p-6">
        <BackupPanel />
      </main>
    </>
  );
}
