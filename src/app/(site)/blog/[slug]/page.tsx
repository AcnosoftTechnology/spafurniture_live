import { notFound } from "next/navigation";
import {
  BlogPostPublicPage,
  buildBlogPostMetadata,
  normalizeBlogPostSlug,
} from "@/features/blog/blog-post-public-page";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return buildBlogPostMetadata(normalizeBlogPostSlug(slug));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalized = normalizeBlogPostSlug(slug);
  if (!normalized || normalized === "category") notFound();
  return <BlogPostPublicPage slug={normalized} />;
}
