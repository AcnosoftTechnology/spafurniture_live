import { getHomepageFaqs } from "@/features/homepage/get-homepage-data";
import { getSiteSchemaSettings } from "@/features/settings/get-site-schema";
import { buildHomepageImageSchemas, buildSiteLayoutSchemas } from "@/lib/seo/build-schemas";
import { getPublicSiteConfig } from "@/lib/site-settings";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import { headers } from "next/headers";

function escapeJsonLd(html: string) {
  return html.replace(/</g, "\\u003c");
}

function isHomePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/";
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Site-wide JSON-LD rendered once inside the root &lt;head&gt;.
 * Avoids useServerInsertedHTML (which re-emits on every RSC stream flush).
 */
export async function SiteHeadJsonLd() {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  if (isAdminPath(pathname)) return null;

  const onHomepage = isHomePath(pathname);
  const [site, baseUrl, siteSchema, homepageFaqs] = await Promise.all([
    getPublicSiteConfig(),
    getSiteBaseUrl(),
    getSiteSchemaSettings(),
    onHomepage ? getHomepageFaqs() : Promise.resolve([]),
  ]);

  const scripts = await buildSiteLayoutSchemas(
    site,
    baseUrl,
    siteSchema.globalSchemaJson,
    onHomepage ? homepageFaqs : undefined,
  );

  if (onHomepage) {
    const homepageImages = await buildHomepageImageSchemas(baseUrl);
    if (homepageImages) scripts.push(homepageImages);
  }

  return (
    <>
      {scripts.map((data, index) =>
        data?.__html ? (
          <script
            key={`site-ld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: escapeJsonLd(data.__html) }}
          />
        ) : null,
      )}
    </>
  );
}
