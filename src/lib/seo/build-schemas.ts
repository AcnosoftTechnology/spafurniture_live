import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";
import {
  breadcrumbSchema,
  catalogProductSchema,
  faqSchema,
  itemListSchema,
  jsonLdGraph,
  localBusinessSchema,
  webPageSchema,
  websiteSchema,
  type SchemaNode,
} from "@/lib/seo/schema";
import { resolveCategoryFaqsForSchema, resolveProductFaqsForSchema } from "@/lib/seo/resolve-faqs";
import { getBaseUrl, mediaUrl } from "@/lib/utils";
import { categoryCanonicalUrl, productCanonicalUrl } from "@/lib/paths";
import { tiptapToPlainText } from "@/lib/seo/tiptap-plain";

function productDescription(input: {
  shortDesc?: string | null;
  fullDesc?: unknown;
}): string | undefined {
  const short = input.shortDesc?.trim();
  if (short) return short;
  const fromDoc = tiptapToPlainText(input.fullDesc, 320);
  if (fromDoc) return fromDoc;
  if (typeof input.fullDesc === "string" && input.fullDesc.trim()) {
    return input.fullDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 320);
  }
  return undefined;
}

function appendExtraSchema(nodes: SchemaNode[], extra?: unknown) {
  if (!extra || typeof extra !== "object") return;
  nodes.push(extra as SchemaNode);
}

export function buildHomepageSchemas(faqs: Array<{ question: string; answer: string; schemaEnabled?: boolean }>) {
  const baseUrl = getBaseUrl();
  const nodes: SchemaNode[] = [websiteSchema(baseUrl)];
  const schemaFaqs = faqs.filter((f) => f.schemaEnabled !== false);
  if (schemaFaqs.length) nodes.push(faqSchema(schemaFaqs));
  return jsonLdGraph(...nodes);
}

export async function buildProductPageSchemas(product: {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string | null;
  fullDesc?: unknown;
  priceDisplay?: string | null;
  schemaJson?: unknown;
  gallery: Array<{ media: { path: string } }>;
}) {
  const baseUrl = getBaseUrl();
  const images = product.gallery
    .map((g) => `${baseUrl}${mediaUrl(g.media.path)}`)
    .filter(Boolean);

  const nodes: SchemaNode[] = [
    catalogProductSchema({
      title: product.title,
      slug: product.slug,
      description: productDescription(product),
      images,
      image: images[0],
    }),
    breadcrumbSchema([
      { name: "Home", url: `${baseUrl}/` },
      { name: "Products", url: `${baseUrl}/products/` },
      { name: product.title, url: productCanonicalUrl(product.slug) },
    ]),
    webPageSchema({
      name: product.title,
      description: productDescription(product),
      url: productCanonicalUrl(product.slug),
    }),
  ];

  const faqs = await resolveProductFaqsForSchema({
    id: product.id,
    fullDesc: product.fullDesc,
  });
  if (faqs.length) nodes.push(faqSchema(faqs));

  appendExtraSchema(nodes, product.schemaJson);
  return jsonLdGraph(...nodes);
}

export async function buildCategoryPageSchemas(
  category: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    pageContent?: unknown;
    schemaJson?: unknown;
  },
  products: Array<{ title: string; slug: string }>,
) {
  const baseUrl = getBaseUrl();
  const nodes: SchemaNode[] = [
    webPageSchema({
      name: category.title,
      description: category.description ?? undefined,
      url: categoryCanonicalUrl(category.slug),
    }),
    breadcrumbSchema([
      { name: "Home", url: `${baseUrl}/` },
      { name: category.title, url: categoryCanonicalUrl(category.slug) },
    ]),
  ];

  if (products.length) {
    nodes.push(
      itemListSchema({
        name: `${category.title} products`,
        items: products.map((p) => ({
          name: p.title,
          url: productCanonicalUrl(p.slug),
        })),
      }),
    );
  }

  const faqs = await resolveCategoryFaqsForSchema(category);
  if (faqs.length) nodes.push(faqSchema(faqs));

  appendExtraSchema(nodes, category.schemaJson);
  return jsonLdGraph(...nodes);
}

export function buildProductsIndexSchemas(
  products: Array<{ title: string; slug: string }>,
) {
  const baseUrl = getBaseUrl();
  return jsonLdGraph(
    webPageSchema({
      name: "Our Products",
      description:
        "Browse Esthetica spa and salon furniture catalogue. Enquire for pricing and worldwide shipping.",
      url: `${baseUrl}/products/`,
    }),
    breadcrumbSchema([
      { name: "Home", url: `${baseUrl}/` },
      { name: "Products", url: `${baseUrl}/products/` },
    ]),
    itemListSchema({
      name: "Spa furniture catalogue",
      items: products.map((p) => ({
        name: p.title,
        url: productCanonicalUrl(p.slug),
      })),
    }),
  );
}

export function buildContactPageSchemas(site: SiteConfig) {
  const baseUrl = getBaseUrl();
  return jsonLdGraph(
    webPageSchema({
      name: "Contact Us",
      description: "Contact Esthetica for spa furniture enquiries, quotes and international orders.",
      url: `${baseUrl}/contact-us/`,
    }),
    breadcrumbSchema([
      { name: "Home", url: `${baseUrl}/` },
      { name: "Contact", url: `${baseUrl}/contact-us/` },
    ]),
    localBusinessSchema(site),
  );
}
