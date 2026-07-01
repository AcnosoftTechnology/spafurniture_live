import { redirect } from "next/navigation";
import { blogPostPath } from "@/lib/blog-paths";
import { normalizeBlogPostSlug } from "@/features/blog/blog-post-public-page";

/** Legacy /blog/{slug}/ → /{slug}/ */
export default async function LegacyBlogPostRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(blogPostPath(normalizeBlogPostSlug(slug)));
}
