import { AdminHeader } from "@/components/admin/admin-header";
import { BrochureEditor } from "@/components/admin/brochure/brochure-editor";
import { getAdminBrochureEditorData } from "@/features/brochure/get-brochure-data";

export const dynamic = "force-dynamic";

export default async function AdminBrochurePage() {
  const initialData = await getAdminBrochureEditorData();

  return (
    <>
      <AdminHeader title="Brochure" />
      <main className="flex-1 overflow-y-auto p-6">
        <BrochureEditor initialData={initialData} />
      </main>
    </>
  );
}
