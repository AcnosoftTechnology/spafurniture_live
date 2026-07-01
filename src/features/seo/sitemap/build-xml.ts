import type { SitemapIndexEntry, SitemapUrlEntry } from "./types";

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1";
const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatLastmod(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

function xmlStylesheet(): string {
  return `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`;
}

function buildImageNodes(images: string[]): string {
  return images
    .map(
      (url) =>
        `    <image:image>\n      <image:loc>${escapeXml(url)}</image:loc>\n    </image:image>`,
    )
    .join("\n");
}

export function buildUrlsetXml(entries: SitemapUrlEntry[]): string {
  const urls = entries
    .map((item) => {
      const imageBlock = item.images.length ? `\n${buildImageNodes(item.images)}` : "";
      return `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${formatLastmod(item.lastmod)}</lastmod>${imageBlock}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlStylesheet()}\n<urlset xmlns:xsi="${XSI_NS}" xmlns:image="${IMAGE_NS}" xsi:schemaLocation="${SITEMAP_NS} http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd ${IMAGE_NS} http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="${SITEMAP_NS}">\n${urls}\n</urlset>\n`;
}

export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const items = entries
    .map(
      (item) =>
        `  <sitemap>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${formatLastmod(item.lastmod)}</lastmod>\n  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlStylesheet()}\n<sitemapindex xmlns="${SITEMAP_NS}">\n${items}\n</sitemapindex>\n`;
}

export function maxLastmod(entries: Array<{ lastmod: Date }>): Date {
  if (!entries.length) return new Date();
  return entries.reduce((max, e) => (e.lastmod > max ? e.lastmod : max), entries[0].lastmod);
}
