import type { Metadata } from "next";
import { FaviconHeadLinks } from "@/components/site/favicon-head-links";
import { getSiteFaviconMetadata } from "@/lib/favicon";
import { getSiteConfig } from "@/lib/site-settings";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [site, icons, baseUrl] = await Promise.all([getSiteConfig(), getSiteFaviconMetadata(), getSiteBaseUrl()]);

  return {
    metadataBase: new URL(baseUrl),
    title: { default: site.name || "Esthetica Spa Furniture", template: `%s | ${site.name || "Esthetica"}` },
    description: site.tagline || "Premium spa and salon furniture — enquiry-based catalogue.",
    icons,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <FaviconHeadLinks />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
