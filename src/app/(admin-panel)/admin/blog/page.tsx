import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlogPostsListTable } from "@/components/admin/blog/blog-posts-list-table";
import { Button } from "@/components/ui/button";

export default function AdminBlogPage() {
  return (
    <>
      <AdminHeader title="Blog" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex justify-end">
          <Button asChild size="sm">
            <Link href="/admin/blog/new">New post</Link>
          </Button>
        </div>
        <BlogPostsListTable />
      </main>
    </>
  );
}
