import { serveSitemapFile } from "@/features/seo/sitemap/serve-sitemap-file";

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  return serveSitemapFile(name);
}
