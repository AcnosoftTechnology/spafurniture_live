import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { blogCategoryPath } from "@/lib/blog-paths";

/** Legacy /blog/category/{slug}/ → /category/.../ */
export default async function LegacyBlogCategoryRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    include: { parent: { include: { parent: true } } },
  });
  if (!category) notFound();
  redirect(blogCategoryPath(category));
}
