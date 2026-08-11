import type { Metadata } from "next";
import { getSiteFaviconMetadata } from "@/lib/favicon";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import { mediaUrl } from "@/lib/utils";

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

function absoluteAssetUrl(pathOrUrl: string, baseUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Image URLs must not pick up site trailingSlash (…png/)
    return trimmed.replace(/\/+$/, "");
  }
  const path = mediaUrl(trimmed);
  const origin = baseUrl.replace(/\/+$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function withTrailingSlash(path: string) {
  if (path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

function pageUrlFromPath(origin: string, path: string) {
  const raw = path.trim();
  if (!raw || raw === "/") return `${origin}/`;
  const normalized = withTrailingSlash(raw.startsWith("/") ? raw : `/${raw}`);
  return `${origin}${normalized}`;
}

function isSiteHomeUrl(value: string, origin: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed === origin || trimmed === `${origin}/` || trimmed === "/";
}

/** Prefer this page's URL. Ignore empty or accidental homepage canonicals on inner pages. */
function resolveCanonical(fields: SeoFields, path: string, origin: string) {
  const pageUrl = pageUrlFromPath(origin, path);
  const override = fields.canonicalUrl?.trim();
  if (!override) return pageUrl;

  const pageIsHome = !path.trim() || path.trim() === "/";
  if (!pageIsHome && isSiteHomeUrl(override, origin)) return pageUrl;

  if (override.startsWith("http://") || override.startsWith("https://")) {
    try {
      const url = new URL(override);
      if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
        url.pathname = `${url.pathname}/`;
      }
      return url.toString();
    } catch {
      return pageUrl;
    }
  }

  return pageUrlFromPath(origin, override);
}

function buildMetadataCore(fields: SeoFields, path = "", baseUrl: string): Metadata {
  const title = fields.seoTitle || fields.title;
  const description = fields.metaDescription || undefined;
  const origin = baseUrl.replace(/\/+$/, "");
  const canonical = resolveCanonical(fields, path, origin);
  const ogImage = fields.ogImage?.trim()
    ? absoluteAssetUrl(fields.ogImage, origin)
    : `${origin}/api/og?title=${encodeURIComponent(title)}`;

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
