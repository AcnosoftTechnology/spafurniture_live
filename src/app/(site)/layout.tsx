import { EsthHeader } from "@/components/site/layout/esth-header";
import { EsthFooter } from "@/components/site/layout/esth-footer";
import { FloatingContact } from "@/components/site/floating-contact";
import { LenisResizeObserver } from "@/components/site/lenis-resize-observer";
import { SmoothScrollProvider } from "@/components/site/smooth-scroll-provider";
import { getMainMenu } from "@/lib/menu";
import { getSiteConfig } from "@/lib/site-settings";
import { getHomepageContent } from "@/features/homepage/get-homepage-data";
import { organizationSchema, jsonLdGraph } from "@/lib/seo/schema";
import "@/styles/esth-site.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [navItems, site, homepage] = await Promise.all([getMainMenu(), getSiteConfig(), getHomepageContent()]);

  return (
    <SmoothScrollProvider>
      <div className="esth-site">
        <LenisResizeObserver />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdGraph(organizationSchema(site))} />
        <EsthHeader menuLinks={navItems} site={site} homepageHeader={homepage.header} />
        <main>{children}</main>
        <EsthFooter site={site} footer={homepage.footer} />
        <FloatingContact phone={site.contact.phone} whatsapp={site.contact.whatsapp || site.contact.phone} />
      </div>
    </SmoothScrollProvider>
  );
}
