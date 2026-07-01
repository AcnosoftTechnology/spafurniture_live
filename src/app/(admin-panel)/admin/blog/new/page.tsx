import { AdminHeader } from "@/components/admin/admin-header";
import { BlogFormEnterprise } from "@/components/admin/blog/blog-form-enterprise";
import { listBlogCategories, listBlogTags } from "@/lib/services/blog.service";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const [blogCategories, blogTags] = await Promise.all([
    listBlogCategories().catch(() => []),
    listBlogTags().catch(() => []),
  ]);

  return (
    <>
      <AdminHeader title="New Post" />
      <main className="flex-1 overflow-y-auto p-6">
        <BlogFormEnterprise blogCategories={blogCategories} blogTags={blogTags} />
      </main>
    </>
  );
}
