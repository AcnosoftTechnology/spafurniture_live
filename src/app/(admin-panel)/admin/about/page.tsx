import { AdminHeader } from "@/components/admin/admin-header";
import { AboutEditor } from "@/components/admin/about/about-editor";
import { getAdminAboutEditorData } from "@/features/about/get-about-data";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const initialData = await getAdminAboutEditorData();

  return (
    <>
      <AdminHeader title="About Us" />
      <main className="flex-1 overflow-y-auto p-6">
        <AboutEditor initialData={initialData} />
      </main>
    </>
  );
}
