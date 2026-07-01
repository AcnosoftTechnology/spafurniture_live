import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPublicDir, writePublicRootFile } from "@/lib/server-paths";
import { fetchSitemapData } from "./fetch-sitemap-data";
import { buildSitemapIndexXml, buildUrlsetXml, maxLastmod } from "./build-xml";
import { saveSitemapMeta } from "./sitemap-meta";
import type { SitemapGenerateResult } from "./types";

const SUB_SITEMAPS = [
  { filename: "post-sitemap.xml", key: "posts" as const },
  { filename: "page-sitemap.xml", key: "pages" as const },
  { filename: "products-sitemap.xml", key: "products" as const },
];

async function loadXslTemplate(): Promise<string> {
  const candidates = [
    path.join(getPublicDir(), "sitemap.xsl"),
    path.join(process.cwd(), "src", "features", "seo", "sitemap", "sitemap.xsl"),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // try next path (standalone may not ship `src/`)
    }
  }

  throw new Error("Could not load sitemap.xsl template");
}

export async function generateSitemaps(): Promise<SitemapGenerateResult> {
  const data = await fetchSitemapData();
  const generatedAt = new Date().toISOString();

  const postXml = buildUrlsetXml(data.posts);
  const pageXml = buildUrlsetXml(data.pages);
  const productsXml = buildUrlsetXml(data.products);

  const indexEntries = SUB_SITEMAPS.map(({ filename, key }) => ({
    loc: `${data.baseUrl}/${filename}`,
    lastmod: maxLastmod(data[key]),
  }));

  const indexXml = buildSitemapIndexXml(indexEntries);

  const xslContent = await loadXslTemplate();

  await Promise.all([
    writePublicRootFile("post-sitemap.xml", postXml),
    writePublicRootFile("page-sitemap.xml", pageXml),
    writePublicRootFile("products-sitemap.xml", productsXml),
    writePublicRootFile("sitemap_index.xml", indexXml),
    writePublicRootFile("sitemap.xml", indexXml),
    writePublicRootFile("sitemap.xsl", xslContent),
  ]);

  const result: SitemapGenerateResult = {
    generatedAt,
    counts: {
      posts: data.posts.length,
      pages: data.pages.length,
      products: data.products.length,
      total: data.posts.length + data.pages.length + data.products.length,
    },
    files: ["sitemap.xml", "sitemap_index.xml", ...SUB_SITEMAPS.map((s) => s.filename), "sitemap.xsl"],
  };

  await saveSitemapMeta(result);
  return result;
}
