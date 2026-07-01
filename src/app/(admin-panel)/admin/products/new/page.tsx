import { AdminHeader } from "@/components/admin/admin-header";
import { ProductFormEnterprise } from "@/components/admin/products/product-form-enterprise";
import { listCategories } from "@/lib/services/category.service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await listCategories().catch(() => []);

  return (
    <>
      <AdminHeader title="New Product" />
      <main className="flex-1 overflow-y-auto p-6">
        <ProductFormEnterprise categories={categories.map((c) => ({ id: c.id, title: c.title }))} />
      </main>
    </>
  );
}
