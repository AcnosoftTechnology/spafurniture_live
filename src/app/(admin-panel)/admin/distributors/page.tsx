import { AdminHeader } from "@/components/admin/admin-header";
import { DistributorsEditor } from "@/components/admin/distributors/distributors-editor";
import { getAdminDistributorsEditorData } from "@/features/distributors/get-distributors-data";

export const dynamic = "force-dynamic";

export default async function AdminDistributorsPage() {
  const initialData = await getAdminDistributorsEditorData();

  return (
    <>
      <AdminHeader title="International Distributors" />
      <main className="flex-1 overflow-y-auto p-6">
        <DistributorsEditor initialData={initialData} />
      </main>
    </>
  );
}
