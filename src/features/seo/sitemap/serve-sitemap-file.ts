import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPublicDir } from "@/lib/server-paths";
import { generateSitemaps } from "./generate-sitemaps";
import {
  getSitemapServeBaseUrl,
  rewriteSitemapHosts,
  sitemapHostMismatch,
} from "./sitemap-base-url";

export const SITEMAP_FILES = [
  "sitemap.xml",
  "sitemap_index.xml",
  "post-sitemap.xml",
  "page-sitemap.xml",
  "products-sitemap.xml",
  "sitemap.xsl",
] as const;

export type SitemapFileName = (typeof SITEMAP_FILES)[number];

function isSitemapFileName(name: string): name is SitemapFileName {
  return (SITEMAP_FILES as readonly string[]).includes(name);
}

function contentTypeFor(name: SitemapFileName): string {
  if (name.endsWith(".xsl")) return "application/xml; charset=utf-8";
  return "application/xml; charset=utf-8";
}

async function readBundledXsl(): Promise<string> {
  const xslPath = path.join(process.cwd(), "src", "features", "seo", "sitemap", "sitemap.xsl");
  return readFile(xslPath, "utf8");
}

export async function readSitemapFile(name: string): Promise<string | null> {
  if (!isSitemapFileName(name)) return null;

  const filepath = path.normalize(`${getPublicDir()}${path.sep}${name}`);
  try {
    return await readFile(filepath, "utf8");
  } catch {
    if (name === "sitemap.xsl") {
      try {
        return await readBundledXsl();
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function serveSitemapFile(name: string): Promise<Response> {
  const safeName = name.replace(/\/+$/, "");
  if (!isSitemapFileName(safeName)) {
    return new Response("Not found", { status: 404 });
  }

  const serveBaseUrl = await getSitemapServeBaseUrl();
  let content = await readSitemapFile(safeName);

  if (!content) {
    try {
      await generateSitemaps();
      content = await readSitemapFile(safeName);
    } catch (error) {
      console.error("[sitemap] auto-generate failed:", error);
    }
  } else if (safeName.endsWith(".xml") && sitemapHostMismatch(content, serveBaseUrl)) {
    // Stale file after deploy (e.g. spa.acnosoft.com from git/postbuild) — regenerate once.
    try {
      await generateSitemaps();
      const regenerated = await readSitemapFile(safeName);
      if (regenerated) content = regenerated;
      else content = rewriteSitemapHosts(content, serveBaseUrl);
    } catch (error) {
      console.error("[sitemap] host-mismatch regenerate failed:", error);
      content = rewriteSitemapHosts(content, serveBaseUrl);
    }
  }

  if (!content) {
    return new Response(
      "Sitemap file not found. Open Admin → Settings → Sitemap and click Generate sitemap.",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  if (safeName.endsWith(".xml")) {
    content = rewriteSitemapHosts(content, serveBaseUrl);
  }

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
