import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductsListTable } from "@/components/admin/products/products-list-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <>
      <AdminHeader title="Products" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/products-index/">Page layout</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus className="mr-1 h-3.5 w-3.5" />
              New product
            </Link>
          </Button>
        </div>
        <ProductsListTable />
      </main>
    </>
  );
}
