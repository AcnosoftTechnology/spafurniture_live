import { prisma } from "@/lib/prisma";
import { productPath, categoryPath, pagePath } from "@/lib/paths";
import { blogPostPath, blogIndexPath } from "@/lib/blog-paths";
import { getAboutPublicSlug } from "@/features/about/get-about-data";
import { getSitemapBaseUrl } from "./sitemap-base-url";
import type { SitemapData, SitemapUrlEntry } from "./types";
import { mediaAbsoluteUrl, uniqueUrls, type MediaRef } from "./media-url";

function maxDate(dates: Date[]): Date {
  if (!dates.length) return new Date();
  return dates.reduce((max, d) => (d > max ? d : max), dates[0]);
}

function entry(loc: string, lastmod: Date, images: string[] = []): SitemapUrlEntry {
  return { loc, lastmod, images: uniqueUrls(images) };
}

function categoryImages(
  baseUrl: string,
  row: {
    thumbMedia: MediaRef;
    bannerMedia: MediaRef;
    ogImage: MediaRef;
    gallery: Array<{ media: MediaRef }>;
  },
): string[] {
  return uniqueUrls([
    mediaAbsoluteUrl(baseUrl, row.thumbMedia),
    mediaAbsoluteUrl(baseUrl, row.bannerMedia),
    mediaAbsoluteUrl(baseUrl, row.ogImage),
    ...row.gallery.map((g) => mediaAbsoluteUrl(baseUrl, g.media)),
  ]);
}

export async function fetchSitemapData(): Promise<SitemapData> {
  const baseUrl = await getSitemapBaseUrl();
  const aboutSlug = await getAboutPublicSlug().catch(() => "about");

  const [posts, products, categories, pages] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        featuredMedia: { select: { path: true, cdnUrl: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { slug: "asc" }],
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        gallery: {
          orderBy: { sortOrder: "asc" },
          select: { media: { select: { path: true, cdnUrl: true } } },
        },
        ogImage: { select: { path: true, cdnUrl: true } },
      },
      orderBy: { slug: "asc" },
    }),
    prisma.category.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        thumbMedia: { select: { path: true, cdnUrl: true } },
        bannerMedia: { select: { path: true, cdnUrl: true } },
        ogImage: { select: { path: true, cdnUrl: true } },
        gallery: { select: { media: { select: { path: true, cdnUrl: true } } } },
      },
      orderBy: { slug: "asc" },
    }),
    prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        ogImage: { select: { path: true, cdnUrl: true } },
      },
      orderBy: { slug: "asc" },
    }),
  ]);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const pageBySlug = new Map(pages.map((p) => [p.slug, p]));

  const postEntries: SitemapUrlEntry[] = [];
  const latestPostDate = posts.length
    ? maxDate(posts.map((p) => p.updatedAt))
    : new Date();

  postEntries.push(
    entry(`${baseUrl}${blogIndexPath()}`, latestPostDate, []),
  );

  for (const post of posts) {
    const image = mediaAbsoluteUrl(baseUrl, post.featuredMedia);
    postEntries.push(
      entry(`${baseUrl}${blogPostPath(post.slug)}`, post.updatedAt, image ? [image] : []),
    );
  }

  const productEntries: SitemapUrlEntry[] = products.map((product) => {
    const galleryImages = product.gallery
      .map((g) => mediaAbsoluteUrl(baseUrl, g.media))
      .filter((u): u is string => Boolean(u));
    const og = mediaAbsoluteUrl(baseUrl, product.ogImage);
    return entry(
      `${baseUrl}${productPath(product.slug)}`,
      product.updatedAt,
      uniqueUrls([...galleryImages, og]),
    );
  });

  const pageEntries: SitemapUrlEntry[] = [];
  const seenLocs = new Set<string>();

  function addPage(e: SitemapUrlEntry) {
    if (seenLocs.has(e.loc)) return;
    seenLocs.add(e.loc);
    pageEntries.push(e);
  }

  const staticDefs: Array<{ slug: string; path: string }> = [
    { slug: "home", path: "/" },
    { slug: aboutSlug, path: `/${aboutSlug}/` },
    { slug: "clients", path: "/clients/" },
    { slug: "brochure", path: "/brochure/" },
    { slug: "contact-us", path: "/contact-us/" },
    { slug: "international-distributors", path: "/international-distributors/" },
    { slug: "products", path: "/products/" },
  ];

  for (const def of staticDefs) {
    const record = pageBySlug.get(def.slug) ?? pageBySlug.get(def.slug.replace(/-/g, ""));
    const lastmod = record?.updatedAt ?? new Date();
    const images = record?.ogImage ? [mediaAbsoluteUrl(baseUrl, record.ogImage)].filter(Boolean) as string[] : [];
    addPage(entry(`${baseUrl}${def.path}`, lastmod, images));
  }

  for (const category of categories) {
    addPage(
      entry(
        `${baseUrl}${categoryPath(category.slug)}`,
        category.updatedAt,
        categoryImages(baseUrl, category),
      ),
    );
  }

  const excludedPageSlugs = new Set([
    "home",
    "about",
    "about-us",
    aboutSlug,
    "clients",
    "brochure",
    "contact-us",
    "international-distributors",
    "products",
    "thank-you",
  ]);

  for (const page of pages) {
    if (excludedPageSlugs.has(page.slug)) continue;
    if (categorySlugs.has(page.slug)) continue;

    const loc = `${baseUrl}${pagePath(page.slug)}`;
    if (seenLocs.has(loc)) continue;

    const image = mediaAbsoluteUrl(baseUrl, page.ogImage);
    addPage(entry(loc, page.updatedAt, image ? [image] : []));
  }

  return {
    baseUrl,
    posts: postEntries,
    pages: pageEntries,
    products: productEntries,
  };
}
