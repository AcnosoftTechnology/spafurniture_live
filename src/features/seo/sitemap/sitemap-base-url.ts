import { headers } from "next/headers";
import { getBaseUrlFromEnv } from "@/lib/site-url-env";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalHostname(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return LOCAL_HOSTS.has(hostname);
}

function isLocalUrl(url: string): boolean {
  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

async function baseUrlFromRequestHeaders(): Promise<string | null> {
  try {
    const h = await headers();
    const host =
      h.get("x-forwarded-host")?.split(",")[0]?.trim() ??
      h.get("host")?.trim();
    if (host && !isLocalHostname(host)) {
      const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // Outside a request (scripts, etc.)
  }
  return null;
}

/**
 * Base URL when writing sitemap files to disk.
 * Prefer NEXT_PUBLIC_SITE_URL so production always stores www.spafurniture.in.
 */
export async function getSitemapBaseUrl(): Promise<string> {
  const envUrl = getBaseUrlFromEnv().replace(/\/$/, "");
  if (!isLocalUrl(envUrl)) return envUrl;

  const fromRequest = await baseUrlFromRequestHeaders();
  if (fromRequest) return fromRequest;

  return envUrl;
}

/**
 * Base URL when serving sitemap responses.
 * Prefer the current request host so live visitors never see spa.acnosoft.com
 * even if a stale file or env still has the staging domain.
 */
export async function getSitemapServeBaseUrl(): Promise<string> {
  const fromRequest = await baseUrlFromRequestHeaders();
  if (fromRequest) return fromRequest;

  return getBaseUrlFromEnv().replace(/\/$/, "");
}

/**
 * If a previously generated sitemap still contains a wrong host
 * (e.g. spa.acnosoft.com after deploy), rewrite absolute URLs to the
 * current canonical base so visitors never see the staging domain.
 */
export function rewriteSitemapHosts(xml: string, baseUrl: string): string {
  const canonical = baseUrl.replace(/\/$/, "");
  if (!canonical || !xml.includes("<loc>")) return xml;

  let canonicalHost: string;
  try {
    canonicalHost = new URL(canonical).host.toLowerCase();
  } catch {
    return xml;
  }

  return xml.replace(/<loc>(https?:\/\/[^/<]+)(\/[^<]*)?<\/loc>/gi, (full, origin: string, path = "") => {
    try {
      const host = new URL(origin).host.toLowerCase();
      if (host === canonicalHost) return full;
      return `<loc>${canonical}${path || ""}</loc>`;
    } catch {
      return full;
    }
  });
}

/** True when sitemap XML locs use a host other than the canonical site. */
export function sitemapHostMismatch(xml: string, baseUrl: string): boolean {
  const canonical = baseUrl.replace(/\/$/, "");
  let canonicalHost: string;
  try {
    canonicalHost = new URL(canonical).host.toLowerCase();
  } catch {
    return false;
  }

  const locRe = /<loc>(https?:\/\/[^/<]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = locRe.exec(xml)) !== null) {
    try {
      if (new URL(match[1]).host.toLowerCase() !== canonicalHost) return true;
    } catch {
      // ignore bad loc
    }
  }
  return false;
}
