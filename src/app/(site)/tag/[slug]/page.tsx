import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BlogListingPage } from "@/components/site/blog/blog-listing-page";
import { blogTagPath } from "@/lib/blog-paths";

export const revalidate = 3600;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const tag = await prisma.blogTag.findUnique({ where: { slug } }).catch(() => null);
  if (!tag) return {};
  return buildPageMetadata(
    { title: `Tag: ${tag.name}`, metaDescription: `Articles tagged ${tag.name}` },
    blogTagPath(slug),
    { page },
  );
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const tag = await prisma.blogTag.findUnique({ where: { slug } }).catch(() => null);
  if (!tag) notFound();

  return (
    <BlogListingPage
      heroTitle={`Tag: ${tag.name}`}
      tagSlug={slug}
      paginationBasePath={blogTagPath(slug)}
      searchParams={searchParams}
    />
  );
}
