import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { PageFormEnterprise } from "@/components/admin/pages/page-form-enterprise";
import { getPageById } from "@/lib/services/page-admin.service";

export const dynamic = "force-dynamic";

export default async function EditSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPageById(id).catch(() => null);
  if (!page) notFound();

  return (
    <>
      <AdminHeader title="Edit SEO Page" />
      <main className="flex-1 overflow-y-auto p-6">
        <PageFormEnterprise initial={page} />
      </main>
    </>
  );
}
