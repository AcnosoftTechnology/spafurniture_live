import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import { FaviconHeadLinks } from "@/components/site/favicon-head-links";
import { getSiteFaviconMetadata } from "@/lib/favicon";
import { getSiteConfig } from "@/lib/site-settings";
import { getBaseUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [site, icons] = await Promise.all([getSiteConfig(), getSiteFaviconMetadata()]);

  return {
    metadataBase: new URL(getBaseUrl()),
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
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthSessionProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
