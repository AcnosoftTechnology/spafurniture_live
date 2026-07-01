import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { PagesListTable } from "@/components/admin/pages/pages-list-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function SeoPagesAdmin() {
  return (
    <>
      <AdminHeader title="SEO Pages" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-stone-500">
            Manage static and category-style pages with full SEO controls. Content syncs to matching
            category listings when the slug matches (e.g. massage-beds).
          </p>
          <Button asChild size="sm">
            <Link href="/admin/seo-pages/new">New page</Link>
          </Button>
        </div>
        <PagesListTable />
      </main>
    </>
  );
}
