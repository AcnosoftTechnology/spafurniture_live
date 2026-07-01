import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { EventsListTable } from "@/components/admin/events/events-list-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  return (
    <>
      <AdminHeader title="Events" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            Events appear on{" "}
            <Link href="/shows-and-exhibitions/" target="_blank" className="underline">
              /shows-and-exhibitions/
            </Link>
            . Page title, banner and SEO:{" "}
            <Link href="/admin/shows-exhibitions/" className="underline">
              Shows & Exhibitions settings
            </Link>
            .
          </p>
          <Button asChild size="sm">
            <Link href="/admin/events/new/">New event</Link>
          </Button>
        </div>
        <EventsListTable />
      </main>
    </>
  );
}
