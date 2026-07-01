import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { CategoriesListTable } from "@/components/admin/categories/categories-list-table";
import { listCategories } from "@/lib/services/category.service";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    categories = await listCategories();
  } catch {
    // empty
  }

  const items = categories.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status,
    productCount: c._count.products,
    showInProductNav: c.showInProductNav,
  }));

  return (
    <>
      <AdminHeader title="Categories" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            Use &quot;Show in product tabs&quot; on each category to control the tab bar on /products/ and category pages.
          </p>
          <Button asChild size="sm">
            <Link href="/admin/categories/new/">New category</Link>
          </Button>
        </div>
        <CategoriesListTable categories={items} />
      </main>
    </>
  );
}
