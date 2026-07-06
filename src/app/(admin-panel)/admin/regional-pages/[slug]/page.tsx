import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { RegionalPageEditor } from "@/components/admin/regional-pages/regional-page-editor";
import { getAdminRegionalPageEditorData } from "@/features/regional-pages/regional-page.service";

export const dynamic = "force-dynamic";

export default async function AdminRegionalPageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialData = await getAdminRegionalPageEditorData(slug);
  if (!initialData) notFound();

  return (
    <>
      <AdminHeader title={`Regional: ${initialData.page.title}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <RegionalPageEditor initialData={initialData} />
      </main>
    </>
  );
}
