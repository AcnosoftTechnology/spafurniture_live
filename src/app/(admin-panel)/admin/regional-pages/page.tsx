import { AdminHeader } from "@/components/admin/admin-header";
import { RegionalPagesList } from "@/components/admin/regional-pages/regional-pages-list";
import { listRegionalPages } from "@/features/regional-pages/regional-page.service";

export const dynamic = "force-dynamic";

export default async function AdminRegionalPagesPage() {
  const pages = await listRegionalPages();

  return (
    <>
      <AdminHeader title="Regional Pages" />
      <main className="flex-1 overflow-y-auto p-6">
        <RegionalPagesList initialPages={pages} />
      </main>
    </>
  );
}
