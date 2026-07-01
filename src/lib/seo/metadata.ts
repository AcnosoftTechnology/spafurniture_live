import type { Metadata } from "next";
import { getSiteFaviconMetadata } from "@/lib/favicon";
import { getSiteBaseUrl } from "@/lib/site-url.server";

export type SeoFields = {
  title: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: string | null;
  robots?: string | null;
};

function buildMetadataCore(fields: SeoFields, path = "", baseUrl: string): Metadata {
  const title = fields.seoTitle || fields.title;
  const description = fields.metaDescription || undefined;
  const canonical = fields.canonicalUrl || `${baseUrl}${path}`;
  const ogImage = fields.ogImage ? (fields.ogImage.startsWith("http") ? fields.ogImage : `${baseUrl}${fields.ogImage}`) : `${baseUrl}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords: fields.keywords?.length ? fields.keywords : undefined,
    alternates: { canonical },
    robots: {
      index: !(fields.robots ?? "index,follow").includes("noindex"),
      follow: !(fields.robots ?? "index,follow").includes("nofollow"),
      googleBot: {
        index: !(fields.robots ?? "index,follow").includes("noindex"),
        follow: !(fields.robots ?? "index,follow").includes("nofollow"),
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: fields.ogTitle || title,
      description: fields.ogDescription || description,
      url: canonical,
      siteName: "Esthetica Spa Furniture",
      images: [{ url: ogImage, width: 1200, height: 630, alt: fields.ogTitle || title }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: (fields.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: fields.ogTitle || title,
      description: fields.ogDescription || description,
      images: [ogImage],
    },
  };
}

/** Sync metadata without favicon — prefer buildPageMetadata() for pages. */
export function buildMetadata(fields: SeoFields, path = "", baseUrl?: string): Metadata {
  return buildMetadataCore(fields, path, baseUrl ?? "http://localhost:3000");
}

/** Page metadata with admin favicon from site settings on every route. */
export async function buildPageMetadata(fields: SeoFields, path = ""): Promise<Metadata> {
  const [baseUrl, icons] = await Promise.all([getSiteBaseUrl(), getSiteFaviconMetadata()]);
  const core = buildMetadataCore(fields, path, baseUrl);
  return icons ? { ...core, icons } : core;
}
