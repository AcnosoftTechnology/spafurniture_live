import { EsthHeader } from "@/components/site/layout/esth-header";
import { EsthFooter } from "@/components/site/layout/esth-footer";
import { FloatingContact } from "@/components/site/floating-contact";
import { SiteProviders } from "@/components/providers/site-providers";
import { SmoothScrollProvider } from "@/components/site/smooth-scroll-provider";
import { SiteFontVariables } from "@/components/providers/site-font-variables";
import { JsonLdGroup } from "@/components/site/seo/json-ld";
import { getHomepageFaqs, getHomepageContent } from "@/features/homepage/get-homepage-data";
import { getSiteSchemaSettings } from "@/features/settings/get-site-schema";
import { buildSiteLayoutSchemas } from "@/lib/seo/build-schemas";
import { auth } from "@/lib/auth/config";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import { getMainMenu } from "@/lib/menu";
import { getPublicSiteConfig } from "@/lib/site-settings";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import "@/styles/esth-site.css";

function isHomePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/";
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const onHomepage = isHomePath(pathname);

  const [navItems, site, homepage, baseUrl, siteSchema, homepageFaqs, session] = await Promise.all([
    getMainMenu(),
    getPublicSiteConfig(),
    getHomepageContent(),
    getSiteBaseUrl(),
    getSiteSchemaSettings(),
    onHomepage ? getHomepageFaqs() : Promise.resolve([]),
    auth(),
  ]);

  if (site.features.maintenanceMode && !session?.user?.id) {
    notFound();
  }

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
              {site.features.maintenanceMode ? (
                <div className="bg-amber-500 px-4 py-2 text-center text-xs font-medium text-stone-950">
                  Maintenance mode is ON — visitors see a 404. You can view the site because you are logged in as admin.
                </div>
              ) : null}
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
