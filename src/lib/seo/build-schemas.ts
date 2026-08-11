import type { PublicSiteConfig } from "@/features/settings/get-settings-data";
import {
  breadcrumbSchema,
  catalogProductSchema,
  faqSchema,
  itemListSchema,
  jsonLdDocument,
  jsonLdGraph,
  localBusinessSchema,
  organizationSchema,
  webPageSchema,
  websiteSchema,
  type SchemaNode,
} from "@/lib/seo/schema";
import { resolveCategoryFaqsForSchema, resolveProductFaqsForSchema } from "@/lib/seo/resolve-faqs";
import { manualSchemaScript, normalizeManualSchema } from "@/lib/seo/manual-schema";
import { isGlobalManualSchemaActive } from "@/features/settings/get-site-schema";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import { mediaUrl } from "@/lib/utils";
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

export async function buildSiteLayoutSchemas(
  site: PublicSiteConfig,
  baseUrl: string,
  globalSchemaJson: string,
  homepageFaqs?: Array<{ question: string; answer: string; schemaEnabled?: boolean }>,
) {
  const manual = manualSchemaScript(globalSchemaJson);
  if (manual) return [manual];

  const scripts: { __html: string }[] = [jsonLdDocument(organizationSchema(site, baseUrl))];

  const globalManual = await isGlobalManualSchemaActive();
  if (!globalManual) {
    scripts.push(jsonLdDocument(websiteSchema(baseUrl)));
  }

  if (homepageFaqs?.length) {
    const schemaFaqs = homepageFaqs.filter((f) => f.schemaEnabled !== false);
    if (schemaFaqs.length) {
      scripts.push(jsonLdDocument(faqSchema(schemaFaqs)));
    }
  }

  return scripts;
}

/** @deprecated Use buildSiteLayoutSchemas — returns first script only. */
export async function buildSiteLayoutSchema(
  site: PublicSiteConfig,
  baseUrl: string,
  globalSchemaJson: string,
  homepageFaqs?: Array<{ question: string; answer: string; schemaEnabled?: boolean }>,
) {
  const scripts = await buildSiteLayoutSchemas(site, baseUrl, globalSchemaJson, homepageFaqs);
  return scripts[0] ?? jsonLdDocument(organizationSchema(site, baseUrl));
}

/** Homepage-only extras (e.g. streamed in page) — prefer layout `buildSiteLayoutSchema` with FAQs. */
export async function buildHomepageSchemas(
  faqs: Array<{ question: string; answer: string; schemaEnabled?: boolean }>,
) {
  const schemaFaqs = faqs.filter((f) => f.schemaEnabled !== false);
  if (!schemaFaqs.length) return null;
  return jsonLdDocument(faqSchema(schemaFaqs));
}

function isProductType(type: unknown): boolean {
  if (type === "Product") return true;
  return Array.isArray(type) && type.includes("Product");
}

/** Google Product snippets need offers, review, or aggregateRating. */
function ensureProductSnippetFields(
  doc: Record<string, unknown>,
  fallbackProduct: SchemaNode,
): Record<string, unknown> {
  const patch = (node: unknown): unknown => {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map(patch);

    const obj = { ...(node as Record<string, unknown>) };
    if (Array.isArray(obj["@graph"])) {
      obj["@graph"] = obj["@graph"].map(patch);
    }

    if (isProductType(obj["@type"])) {
      const hasOffers = obj.offers != null;
      const hasReview = obj.review != null;
      const hasAggregate = obj.aggregateRating != null;
      if (!hasOffers && !hasReview && !hasAggregate) {
        obj.offers = fallbackProduct.offers;
        if (fallbackProduct.aggregateRating) obj.aggregateRating = fallbackProduct.aggregateRating;
        if (fallbackProduct.review) obj.review = fallbackProduct.review;
      } else if (hasOffers && typeof obj.offers === "object" && !Array.isArray(obj.offers)) {
        const offer = obj.offers as Record<string, unknown>;
        if (offer.price == null && offer.priceSpecification == null && fallbackProduct.offers) {
          obj.offers = { ...offer, ...(fallbackProduct.offers as Record<string, unknown>) };
        }
      }
    }
    return obj;
  };

  return patch(doc) as Record<string, unknown>;
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
  reviews?: Array<{
    authorName: string;
    rating: number;
    title?: string | null;
    body?: string | null;
  }>;
}) {
  const baseUrl = await getSiteBaseUrl();
  const images = product.gallery
    .map((g) => `${baseUrl}${mediaUrl(g.media.path)}`)
    .filter(Boolean);

  const productSchemaNode = catalogProductSchema(
    {
      title: product.title,
      slug: product.slug,
      description: productDescription(product),
      priceDisplay: product.priceDisplay,
      images,
      image: images[0],
      reviews: product.reviews,
    },
    baseUrl,
  );

  const manual = normalizeManualSchema(product.schemaJson);
  if (manual) {
    const patched = ensureProductSnippetFields(manual, productSchemaNode);
    return { __html: JSON.stringify(patched) };
  }

  const nodes: SchemaNode[] = [
    productSchemaNode,
    breadcrumbSchema([
      { name: "Home", url: `${baseUrl}/` },
      { name: "Products", url: `${baseUrl}/products/` },
      { name: product.title, url: productCanonicalUrl(product.slug, baseUrl) },
    ]),
    webPageSchema({
      name: product.title,
      description: productDescription(product),
      url: productCanonicalUrl(product.slug, baseUrl),
    }),
  ];

  const faqs = await resolveProductFaqsForSchema({
    id: product.id,
    fullDesc: product.fullDesc,
  });
  if (faqs.length) nodes.push(faqSchema(faqs));

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
  const baseUrl = await getSiteBaseUrl();
  const nodes: SchemaNode[] = [
    webPageSchema({
      name: category.title,
      description: category.description ?? undefined,
      url: categoryCanonicalUrl(category.slug, baseUrl),
    }),
    breadcrumbSchema([
      { name: "Home", url: `${baseUrl}/` },
      { name: category.title, url: categoryCanonicalUrl(category.slug, baseUrl) },
    ]),
  ];

  if (products.length) {
    nodes.push(
      itemListSchema({
        name: `${category.title} products`,
        items: products.map((p) => ({
          name: p.title,
          url: productCanonicalUrl(p.slug, baseUrl),
        })),
      }),
    );
  }

  const faqs = await resolveCategoryFaqsForSchema(category);
  if (faqs.length) nodes.push(faqSchema(faqs));

  appendExtraSchema(nodes, category.schemaJson);
  return jsonLdGraph(...nodes);
}

export async function buildProductsIndexSchemas(
  products: Array<{ title: string; slug: string }>,
) {
  const baseUrl = await getSiteBaseUrl();
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
        url: productCanonicalUrl(p.slug, baseUrl),
      })),
    }),
  );
}

export async function buildContactPageSchemas(site: PublicSiteConfig) {
  if (await isGlobalManualSchemaActive()) return null;

  const baseUrl = await getSiteBaseUrl();
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
    localBusinessSchema(site, baseUrl),
  );
}
