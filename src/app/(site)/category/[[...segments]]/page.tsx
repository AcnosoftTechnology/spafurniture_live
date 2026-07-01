import { notFound } from "next/navigation";
import { getBlogCategoryByPath } from "@/lib/services/blog.service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BlogListingPage } from "@/components/site/blog/blog-listing-page";
import { blogCategoryPath } from "@/lib/blog-paths";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments = [] } = await params;
  const category = await getBlogCategoryByPath(segments).catch(() => null);
  if (!category) return {};
  return buildPageMetadata(
    { title: `Category: ${category.name}`, metaDescription: `Articles in ${category.name}` },
    blogCategoryPath(category),
  );
}

export default async function BlogCategoryArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { segments = [] } = await params;
  const category = await getBlogCategoryByPath(segments).catch(() => null);
  if (!category) notFound();

  return (
    <BlogListingPage
      heroTitle={`Category: ${category.name}`}
      categorySlug={category.slug}
      paginationBasePath={blogCategoryPath(category)}
      searchParams={searchParams}
    />
  );
}
