import { EsthHeader } from "@/components/site/layout/esth-header";
import { EsthFooter } from "@/components/site/layout/esth-footer";
import { FloatingContact } from "@/components/site/floating-contact";
import { LenisResizeObserver } from "@/components/site/lenis-resize-observer";
import { SmoothScrollProvider } from "@/components/site/smooth-scroll-provider";
import { SiteProviders } from "@/components/providers/site-providers";
import { SiteFontVariables } from "@/components/providers/site-font-variables";
import { JsonLdGroup } from "@/components/site/seo/json-ld";
import { getHomepageFaqs, getHomepageContent } from "@/features/homepage/get-homepage-data";
import { getSiteSchemaSettings } from "@/features/settings/get-site-schema";
import { buildSiteLayoutSchemas } from "@/lib/seo/build-schemas";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import { getMainMenu } from "@/lib/menu";
import { getSiteConfig } from "@/lib/site-settings";
import { headers } from "next/headers";
import "@/styles/esth-site.css";

function isHomePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/";
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const onHomepage = isHomePath(pathname);

  const [navItems, site, homepage, baseUrl, siteSchema, homepageFaqs] = await Promise.all([
    getMainMenu(),
    getSiteConfig(),
    getHomepageContent(),
    getSiteBaseUrl(),
    getSiteSchemaSettings(),
    onHomepage ? getHomepageFaqs() : Promise.resolve([]),
  ]);

  const layoutSchemaScripts = await buildSiteLayoutSchemas(
    site,
    baseUrl,
    siteSchema.globalSchemaJson,
    onHomepage ? homepageFaqs : undefined,
  );

  return (
    <>
      <JsonLdGroup scripts={layoutSchemaScripts} />
      <SiteFontVariables>
        <SiteProviders>
          <SmoothScrollProvider>
            <div className="esth-site">
              <LenisResizeObserver />
              <EsthHeader menuLinks={navItems} site={site} homepageHeader={homepage.header} />
              <main>{children}</main>
              <EsthFooter site={site} footer={homepage.footer} />
              <FloatingContact phone={site.contact.phone} whatsapp={site.contact.whatsapp || site.contact.phone} />
            </div>
          </SmoothScrollProvider>
        </SiteProviders>
      </SiteFontVariables>
    </>
  );
}
