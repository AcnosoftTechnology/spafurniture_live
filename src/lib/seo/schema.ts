import { blogPostPath } from "@/lib/blog-paths";
import { getBaseUrl, mediaUrl } from "@/lib/utils";
import { productCanonicalUrl } from "@/lib/paths";
import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";

export type SchemaNode = Record<string, unknown>;

export function stripHtmlForSchema(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isEnquiryOnlyPrice(priceDisplay?: string | null): boolean {
  if (!priceDisplay?.trim()) return true;
  const lower = priceDisplay.toLowerCase();
  return /enquir|quote|contact|call|price on request|poa/.test(lower);
}

function parseNumericPrice(priceDisplay?: string | null): number | undefined {
  if (!priceDisplay?.trim() || isEnquiryOnlyPrice(priceDisplay)) return undefined;
  const num = Number.parseFloat(priceDisplay.replace(/[^\d.]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

export function organizationSchema(site?: Pick<SiteConfig, "name" | "branding">) {
  const baseUrl = getBaseUrl();
  const logoPath = site?.branding?.siteLogoPath;
  return {
    "@type": "Organization",
    name: site?.name ?? "Esthetica Spa Furniture",
    url: baseUrl,
    logo: logoPath ? `${baseUrl}${mediaUrl(logoPath)}` : `${baseUrl}/logo.svg`,
  };
}

export function websiteSchema(baseUrl = getBaseUrl()) {
  return {
    "@type": "WebSite",
    name: "Esthetica Spa Furniture",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/products/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessSchema(site: SiteConfig) {
  const baseUrl = getBaseUrl();
  const logoPath = site.branding?.siteLogoPath;
  return {
    "@type": "LocalBusiness",
    name: site.contact.businessName || site.name,
    url: baseUrl,
    email: site.contact.email || undefined,
    telephone: site.contact.phone || undefined,
    image: logoPath ? `${baseUrl}${mediaUrl(logoPath)}` : undefined,
    address: site.contact.address
      ? {
          "@type": "PostalAddress",
          streetAddress: site.contact.address,
        }
      : undefined,
  };
}

export function webPageSchema(page: { name: string; description?: string; url: string }) {
  return {
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: page.url,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Catalogue / enquiry product — no fake ecommerce Offer unless a real numeric price exists. */
export function catalogProductSchema(product: {
  title: string;
  slug: string;
  description?: string | null;
  priceDisplay?: string | null;
  image?: string | null;
  images?: string[];
  brand?: string;
}) {
  const url = productCanonicalUrl(product.slug);
  const price = parseNumericPrice(product.priceDisplay);
  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : undefined;

  return {
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: images,
    url,
    brand: {
      "@type": "Brand",
      name: product.brand ?? "Esthetica Spa Furniture",
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url,
        }
      : undefined,
  };
}

/** @deprecated Use catalogProductSchema — kept for backwards compatibility. */
export function productSchema(product: {
  title: string;
  slug: string;
  description?: string | null;
  priceDisplay?: string | null;
  image?: string | null;
}) {
  return catalogProductSchema(product);
}

export function itemListSchema(input: {
  name: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@type": "ItemList",
    name: input.name,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtmlForSchema(faq.answer),
      },
    })),
  };
}

export function blogPostSchema(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
  authorName?: string;
  image?: string;
}) {
  const baseUrl = getBaseUrl();
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.image,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    author: post.authorName ? { "@type": "Person", name: post.authorName } : undefined,
    url: `${baseUrl}${blogPostPath(post.slug)}`,
  };
}

export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data) };
}

/** Combine multiple schema.org nodes for a single script tag. */
export function jsonLdGraph(...nodes: Record<string, unknown>[]) {
  const graph = nodes.map((node) => {
    const { ["@context"]: _ctx, ...rest } = node;
    return rest;
  });
  return jsonLdScript({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}
