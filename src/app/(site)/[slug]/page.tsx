import { notFound } from "next/navigation";
import { AboutPageView } from "@/components/site/about/about-page-view";
import {
  buildAboutPageMetadata,
  getAboutPageData,
  getAboutPublicSlug,
  isAboutPageSlug,
} from "@/features/about/get-about-data";
import { getPostBySlug } from "@/lib/services/blog.service";
import { getCategoryBySlug, listCategoriesForProductNav } from "@/lib/services/category.service";
import {
  BlogPostPublicPage,
  buildBlogPostMetadata,
  normalizeBlogPostSlug,
} from "@/features/blog/blog-post-public-page";
import { buildProductNavCategories } from "@/lib/product-nav-categories";
import { countProducts, listProducts } from "@/lib/services/product.service";
import { CategoryNav } from "@/components/site/category-nav";
import {
  ProductsInfiniteGrid,
  PRODUCTS_PAGE_SIZE,
} from "@/components/site/products-infinite-grid";
import { CategoryCopySection } from "@/components/site/category-copy-section";
import { RegionalLandingView } from "@/components/site/regional/regional-landing-view";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { buildRegionalPageMetadata } from "@/features/regional-pages/build-regional-metadata";
import { getRegionalPageData } from "@/features/regional-pages/get-regional-page-data";
import { isRegionalPageSlug } from "@/features/regional-pages/regional-page.service";
import { getCategoryCopyHtml } from "@/lib/category-page-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCategoryPageSchemas } from "@/lib/seo/build-schemas";
import { JsonLd } from "@/components/site/seo/json-ld";
import { mediaUrl } from "@/lib/utils";
import { categoryPath } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const RESERVED = [
  "products",
  "blog",
  "about",
  "clients",
  "brochure",
  "shows-and-exhibitions",
  "contact-us",
  "international-distributors",
  "admin",
  "api",
  "thank-you",
  "tag",
  "category",
  "sitemap.xml",
  "sitemap_index.xml",
  "post-sitemap.xml",
  "page-sitemap.xml",
  "products-sitemap.xml",
  "sitemap.xsl",
];

function isBlogArchiveYearSegment(slug: string) {
  return /^\d{4}$/.test(slug);
}

export async function generateStaticParams() {
  try {
    const [categories, posts] = await Promise.all([
      prisma.category.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
      }),
    ]);
    const aboutSlug = await getAboutPublicSlug();
    const slugs = new Set<string>();
    for (const c of categories) slugs.add(c.slug);
    for (const p of posts) slugs.add(p.slug);
    if (aboutSlug !== "about") slugs.add(aboutSlug);
    return [...slugs].map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.includes(slug) || isBlogArchiveYearSegment(slug)) return {};
  const postMeta = await buildBlogPostMetadata(normalizeBlogPostSlug(slug));
  if (Object.keys(postMeta).length > 0) return postMeta;
  if (await isAboutPageSlug(slug)) return buildAboutPageMetadata();
  if (await isRegionalPageSlug(slug)) return buildRegionalPageMetadata(slug);
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return {};
  return buildPageMetadata(
    {
      title: category.title,
      seoTitle: category.seoTitle,
      metaDescription: category.metaDescription ?? category.description,
      keywords: category.keywords,
      canonicalUrl: category.canonicalUrl,
      ogTitle: category.ogTitle,
      ogDescription: category.ogDescription,
      robots: category.robots,
      ogImage: category.ogImage
        ? mediaUrl(category.ogImage.path)
        : category.bannerMedia
          ? mediaUrl(category.bannerMedia.path)
          : undefined,
      twitterCard: category.twitterCard,
    },
    categoryPath(slug),
  );
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.includes(slug) || isBlogArchiveYearSegment(slug)) notFound();

  const post = await getPostBySlug(normalizeBlogPostSlug(slug)).catch(() => null);
  if (post) return <BlogPostPublicPage slug={slug} />;

  if (await isAboutPageSlug(slug)) {
    const { content } = await getAboutPageData();
    return <AboutPageView content={content} />;
  }

  if (await isRegionalPageSlug(slug)) {
    const data = await getRegionalPageData(slug);
    if (!data) notFound();
    return <RegionalLandingView slug={slug} {...data} />;
  }

  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug).catch(() => null),
    listCategoriesForProductNav().catch(() => []),
  ]);

  if (!category) notFound();

  let gridProducts: { id: string; title: string; slug: string; imagePath?: string }[] = [];
  let hasMore = false;
  let loadError: string | null = null;

  try {
    const [products, total] = await Promise.all([
      listProducts({
        status: "PUBLISHED",
        categoryId: category.id,
        take: PRODUCTS_PAGE_SIZE,
        skip: 0,
      }),
      countProducts({ status: "PUBLISHED", categoryId: category.id }),
    ]);
    gridProducts = products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      imagePath: p.gallery[0]?.media?.path,
    }));
    hasMore = gridProducts.length < total;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[CategoryPage] Failed to load products:", err);
    }
    loadError = "Unable to load products. Please check that the database is running and try again.";
  }

  const categoryCopyHtml = await getCategoryCopyHtml(slug, category);
  const schemaScript = await buildCategoryPageSchemas(
    {
      id: category.id,
      title: category.title,
      slug: category.slug,
      description: category.description,
      pageContent: category.pageContent,
      schemaJson: category.schemaJson,
    },
    gridProducts.map((p) => ({ title: p.title, slug: p.slug })),
  );

  return (
    <>
      <JsonLd data={schemaScript} />

      <main className="esth-products-page-main">
        <section className="esth-products-hero-section">
          <EsthPageShell>
            <div className="esth-products-hero-head esth-products-hero-head--category">
              <h1>{category.title}</h1>
            </div>

            <CategoryNav
              categories={buildProductNavCategories(allCategories)}
              activeSlug={slug}
            />

            <div className="esth-products-grid-section">
              <ProductsInfiniteGrid
                initialProducts={gridProducts}
                initialHasMore={hasMore}
                categorySlug={slug}
                loadError={loadError}
                emptyVariant="category"
              />
            </div>
          </EsthPageShell>
        </section>

        {categoryCopyHtml ? <CategoryCopySection html={categoryCopyHtml} /> : null}
      </main>
    </>
  );
}
