import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryFormEnterprise } from "@/components/admin/categories/category-form-enterprise";
import { getLinkedPageSeoForCategory } from "@/lib/category-page-copy";
import { getCategoryById } from "@/lib/services/category.service";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id).catch(() => null);
  if (!category) notFound();

  const linkedSeo = await getLinkedPageSeoForCategory(category.slug);
  const initial = {
    ...category,
    seoTitle: category.seoTitle?.trim() || linkedSeo?.seoTitle || category.seoTitle,
    metaDescription:
      category.metaDescription?.trim() || linkedSeo?.metaDescription || category.metaDescription,
    keywords: category.keywords.length ? category.keywords : (linkedSeo?.keywords ?? []),
    canonicalUrl: category.canonicalUrl?.trim() || linkedSeo?.canonicalUrl || category.canonicalUrl,
    ogTitle: category.ogTitle?.trim() || linkedSeo?.ogTitle || category.ogTitle,
    ogDescription:
      category.ogDescription?.trim() || linkedSeo?.ogDescription || category.ogDescription,
  };

  return (
    <>
      <AdminHeader title="Edit Category" />
      <main className="flex-1 overflow-y-auto p-6">
        <CategoryFormEnterprise initial={initial} />
      </main>
    </>
  );
}
