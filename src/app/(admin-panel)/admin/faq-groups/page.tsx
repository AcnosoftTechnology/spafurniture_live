import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  FaqGroupsListTable,
  type FaqGroupListItem,
} from "@/components/admin/faq-groups/faq-groups-list-table";
import { Button } from "@/components/ui/button";
import { listFaqGroups, faqGroupShortcode } from "@/lib/services/faq-group.service";

export const dynamic = "force-dynamic";

export default async function AdminFaqGroupsPage() {
  let groups: FaqGroupListItem[] = [];
  let loadError: string | null = null;

  try {
    const rows = await listFaqGroups();
    groups = rows.map((g) => ({
      id: g.id,
      name: g.name,
      shortcodeId: g.shortcodeId,
      shortcode: faqGroupShortcode(g),
      itemCount: g._count.items,
      updatedAt: g.updatedAt.toISOString(),
    }));
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "Could not load FAQ groups. Restart the dev server after schema changes.";
  }

  return (
    <>
      <AdminHeader title="FAQ Groups" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-sm text-stone-500">
          Create accordion FAQ groups like WordPress Easy Accordion. Each group gets a shortcode{" "}
          <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">[sp_easyaccordion id=&quot;…&quot;]</code>{" "}
          — paste it in a blog post or page to show that group&apos;s FAQs.
        </p>
        <div className="mb-4 flex justify-end">
          <Button asChild size="sm">
            <Link href="/admin/faq-groups/new/">Add New FAQ Group</Link>
          </Button>
        </div>
        <FaqGroupsListTable initialGroups={groups} loadError={loadError} />
      </main>
    </>
  );
}
