import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { BlogFormEnterprise } from "@/components/admin/blog/blog-form-enterprise";
import { prisma } from "@/lib/prisma";
import { listBlogCategories, listBlogTags } from "@/lib/services/blog.service";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, blogCategories, blogTags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: { featuredMedia: true, ogImage: true, categories: true, tags: true },
    }).catch(() => null),
    listBlogCategories().catch(() => []),
    listBlogTags().catch(() => []),
  ]);
  if (!post) notFound();

  return (
    <>
      <AdminHeader title="Edit Post" />
      <main className="flex-1 overflow-y-auto p-6">
        <BlogFormEnterprise
          initial={{
            ...post,
            categories: post.categories,
            tags: post.tags,
          }}
          blogCategories={blogCategories}
          blogTags={blogTags}
        />
      </main>
    </>
  );
}
