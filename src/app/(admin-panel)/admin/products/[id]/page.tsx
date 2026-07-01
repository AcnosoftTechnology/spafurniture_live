import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductFormEnterprise } from "@/components/admin/products/product-form-enterprise";
import { getProductById } from "@/lib/services/product.service";
import { listCategories } from "@/lib/services/category.service";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id).catch(() => null),
    listCategories().catch(() => []),
  ]);
  if (!product) notFound();

  return (
    <>
      <AdminHeader title="Edit Product" />
      <main className="flex-1 overflow-y-auto p-6">
        <ProductFormEnterprise
          initial={{
            ...product,
            categories: product.categories.map((c) => ({ categoryId: c.categoryId })),
            gallery: product.gallery.map((g) => ({
              mediaId: g.mediaId,
              media: g.media,
            })),
          }}
          categories={categories.map((c) => ({ id: c.id, title: c.title }))}
        />
      </main>
    </>
  );
}
