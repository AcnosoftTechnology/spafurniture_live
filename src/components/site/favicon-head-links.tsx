import { faviconMimeType, faviconPublicHref } from "@/lib/favicon";
import { getSiteConfig } from "@/lib/site-settings";
import { getBaseUrl, mediaUrl } from "@/lib/utils";

export async function FaviconHeadLinks() {
  const site = await getSiteConfig();
  const faviconPath = site.branding.faviconPath?.trim();
  if (!faviconPath) return null;

  const baseUrl = getBaseUrl();
  const type = faviconMimeType(faviconPath);
  const version = encodeURIComponent(faviconPath);
  const routed = `${baseUrl}${faviconPublicHref(faviconPath)}`;
  const direct = `${baseUrl}${mediaUrl(faviconPath)}?v=${version}`;

  return (
    <>
      <link rel="icon" href={routed} type={type} sizes="any" />
      <link rel="shortcut icon" href={routed} type={type} />
      <link rel="icon" href={direct} type={type} />
      <link rel="apple-touch-icon" href={direct} />
    </>
  );
}
