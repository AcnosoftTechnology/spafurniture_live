import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ShowsExhibitionsEditor } from "@/components/admin/events/shows-exhibitions-editor";
import { getAdminShowsExhibitionsEditorData } from "@/features/shows-exhibitions/get-shows-exhibitions-data";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminShowsExhibitionsPage() {
  const initialData = await getAdminShowsExhibitionsEditorData().catch(() => null);

  return (
    <>
      <AdminHeader title="Shows & Exhibitions" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/events/">Manage events</Link>
          </Button>
        </div>
        {initialData ? <ShowsExhibitionsEditor initialData={initialData} /> : <p className="text-sm text-stone-500">Unable to load page settings.</p>}
      </main>
    </>
  );
}
