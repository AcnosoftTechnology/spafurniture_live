import { notFound } from "next/navigation";
import { getNextPublishedProduct, getProductBySlug } from "@/lib/services/product.service";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/site/product-detail-view";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildProductPageSchemas } from "@/lib/seo/build-schemas";
import { mediaUrl } from "@/lib/utils";
import { productPath } from "@/lib/paths";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      take: 100,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return {};
  return buildPageMetadata(
    {
      title: product.title,
      seoTitle: product.seoTitle,
      metaDescription: product.metaDescription ?? product.shortDesc,
      keywords: product.keywords,
      canonicalUrl: product.canonicalUrl,
      ogTitle: product.ogTitle,
      ogDescription: product.ogDescription,
      robots: product.robots,
      ogImage: product.ogImage
        ? mediaUrl(product.ogImage.path)
        : product.gallery[0]
          ? mediaUrl(product.gallery[0].media.path)
          : undefined,
      twitterCard: product.twitterCard,
    },
    productPath(slug),
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const schemaScript = await buildProductPageSchemas(product);

  const brochureUrl = product.brochureMedia
    ? mediaUrl(product.brochureMedia.path)
    : product.brochureExternalUrl?.trim() || null;
  const brochureLabel = product.brochureMedia
    ? "Download Cut Sheet"
    : product.brochureExternalLabel?.trim() || "Download Cut Sheet";
  const brochureFilename = product.brochureMedia?.filename ?? null;

  const nextProduct = await getNextPublishedProduct(slug).catch(() => null);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={schemaScript} />
      <ProductDetailView
        nextProduct={nextProduct}
        product={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          shortDesc: product.shortDesc,
          fullDesc: product.fullDesc,
          dimensions: product.dimensions,
          dimensionsImage: product.dimensionsMedia
            ? {
                path: product.dimensionsMedia.path,
                webpPath: product.dimensionsMedia.webpPath,
                alt: product.dimensionsMedia.alt,
              }
            : null,
          featuresImage: product.featuresMedia
            ? {
                path: product.featuresMedia.path,
                webpPath: product.featuresMedia.webpPath,
                alt: product.featuresMedia.alt,
              }
            : null,
          brochureUrl,
          brochureLabel,
          brochureFilename,
          youtubeUrl: product.youtubeUrl,
          youtubeLabel: product.youtubeLabel,
          gallery: product.gallery.map((g) => ({
            id: g.id,
            path: g.media.path,
          })),
          features: product.features,
        }}
      />
    </>
  );
}
