import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductsIndexEditor } from "@/components/admin/products/products-index-editor";
import { getAdminProductsIndexEditorData } from "@/features/products-index/get-products-index-data";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsIndexPage() {
  const initialData = await getAdminProductsIndexEditorData().catch(() => null);

  return (
    <>
      <AdminHeader title="Products Page Layout" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/products/">Back to products</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/products/" target="_blank">
              View live page
            </Link>
          </Button>
        </div>
        {initialData ? (
          <ProductsIndexEditor initialData={initialData} />
        ) : (
          <p className="text-sm text-stone-500">Unable to load layout settings.</p>
        )}
      </main>
    </>
  );
}
