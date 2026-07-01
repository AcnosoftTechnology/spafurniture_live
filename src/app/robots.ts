import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site-url.server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getSiteBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap_index.xml`,
  };
}
