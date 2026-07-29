import { getPublicSiteConfig } from "@/lib/site-settings";
import { getSiteBaseUrl } from "@/lib/site-url.server";
import { mediaUrl } from "@/lib/utils";

/** Absolute URL for Settings → branding site logo (used by og:logo). */
export async function resolveSiteLogoAbsoluteUrl(): Promise<string | null> {
  const [site, baseUrl] = await Promise.all([getPublicSiteConfig(), getSiteBaseUrl()]);
  const logoPath = site.branding.siteLogoPath?.trim();
  if (!logoPath) return null;

  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath.replace(/\/+$/, "");
  }

  const path = mediaUrl(logoPath);
  const origin = baseUrl.replace(/\/+$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Injects `<meta property="og:logo" …>` from the uploaded site logo. */
export async function SiteOgLogoMeta() {
  const logoUrl = await resolveSiteLogoAbsoluteUrl();
  if (!logoUrl) return null;
  return <meta property="og:logo" content={logoUrl} />;
}
