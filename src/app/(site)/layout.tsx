import { EsthHeader } from "@/components/site/layout/esth-header";
import { EsthFooter } from "@/components/site/layout/esth-footer";
import { FloatingContact } from "@/components/site/floating-contact";
import { SiteProviders } from "@/components/providers/site-providers";
import { SmoothScrollProvider } from "@/components/site/smooth-scroll-provider";
import { SiteFontVariables } from "@/components/providers/site-font-variables";
import { getHomepageContent } from "@/features/homepage/get-homepage-data";
import { auth } from "@/lib/auth/config";
import { getMainMenu } from "@/lib/menu";
import { getPublicSiteConfig } from "@/lib/site-settings";
import { notFound } from "next/navigation";
import "@/styles/esth-site.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [navItems, site, homepage, session] = await Promise.all([
    getMainMenu(),
    getPublicSiteConfig(),
    getHomepageContent(),
    auth(),
  ]);

  if (site.features.maintenanceMode && !session?.user?.id) {
    notFound();
  }

  return (
    <SiteFontVariables>
      <link
        rel="preload"
        href="/assets/fonts/josefin-sans-normal.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
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
  );
}
