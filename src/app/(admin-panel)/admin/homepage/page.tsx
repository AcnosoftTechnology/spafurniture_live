import { AdminHeader } from "@/components/admin/admin-header";
import { HomepageEditor } from "@/components/admin/homepage/homepage-editor";
import { getAdminHomepageEditorData } from "@/features/homepage/get-homepage-data";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const initialData = await getAdminHomepageEditorData();

  return (
    <>
      <AdminHeader title="Homepage" />
      <main className="flex-1 overflow-y-auto p-6">
        <HomepageEditor initialData={initialData} />
      </main>
    </>
  );
}
