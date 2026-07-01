import { notFound } from "next/navigation";
import {
  blogArchiveLabel,
  blogArchivePath,
  parseArchiveRouteParams,
} from "@/lib/blog-archive";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BlogArchivePage } from "@/components/site/blog/blog-archive-page";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; month: string }>;
}) {
  const { slug, month } = await params;
  const parsed = parseArchiveRouteParams(slug, month);
  if (!parsed) return {};
  const label = blogArchiveLabel(parsed.year, parsed.month);
  return buildPageMetadata(
    {
      title: `Month: ${label}`,
      metaDescription: `Blog posts published in ${label} from Esthetica Spa Furniture.`,
    },
    blogArchivePath(parsed.year, parsed.month),
  );
}

export default async function BlogMonthlyArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; month: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug, month } = await params;
  const parsed = parseArchiveRouteParams(slug, month);
  if (!parsed) notFound();

  return (
    <BlogArchivePage
      year={parsed.year}
      month={parsed.month}
      archiveKey={parsed.key}
      searchParams={searchParams}
    />
  );
}
