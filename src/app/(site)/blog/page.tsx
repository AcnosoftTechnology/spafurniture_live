import { redirect } from "next/navigation";
import { blogArchivePathFromKey } from "@/lib/blog-archive";
import { blogTagPath } from "@/lib/blog-paths";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BlogListingPage } from "@/components/site/blog/blog-listing-page";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function generateMetadata() {
  return buildPageMetadata({
    title: "Blog",
    metaDescription:
      "News, guides and insights on spa furniture, wellness design and salon furniture from Esthetica.",
  }, "/blog/");
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; archive?: string; tag?: string }>;
}) {
  const params = await searchParams;

  if (params.tag && !params.q) {
    redirect(blogTagPath(params.tag));
  }

  if (params.archive && !params.q) {
    const archivePath = blogArchivePathFromKey(params.archive);
    if (archivePath) {
      const qs = params.page && Number(params.page) > 1 ? `?page=${params.page}` : "";
      redirect(`${archivePath}${qs}`);
    }
  }

  let heroTitle = "Our Blog";
  if (params.tag) {
    const tag = await prisma.blogTag.findUnique({ where: { slug: params.tag }, select: { name: true } }).catch(() => null);
    heroTitle = tag?.name ? `Tag: ${tag.name}` : `Tag: ${params.tag}`;
  }

  return (
    <BlogListingPage
      heroTitle={heroTitle}
      tagSlug={params.tag}
      searchParams={Promise.resolve({ q: params.q, page: params.page })}
    />
  );
}
