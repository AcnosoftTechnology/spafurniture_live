import { AdminHeader } from "@/components/admin/admin-header";
import { MediaManager } from "@/components/admin/media-manager";

export default function AdminMediaPage() {
  return (
    <>
      <AdminHeader title="Media Library" />
      <main className="flex-1 overflow-y-auto p-6">
        <MediaManager />
      </main>
    </>
  );
}
