import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryFormEnterprise } from "@/components/admin/categories/category-form-enterprise";

export default function NewCategoryPage() {
  return (
    <>
      <AdminHeader title="New Category" />
      <main className="flex-1 overflow-y-auto p-6">
        <CategoryFormEnterprise />
      </main>
    </>
  );
}
