import { AdminHeader } from "@/components/admin/admin-header";
import { ClientsEditor } from "@/components/admin/clients/clients-editor";
import { getAdminClientsEditorData } from "@/features/clients/get-clients-data";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const initialData = await getAdminClientsEditorData();

  return (
    <>
      <AdminHeader title="Clients" />
      <main className="flex-1 overflow-y-auto p-6">
        <ClientsEditor initialData={initialData} />
      </main>
    </>
  );
}
