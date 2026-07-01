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

/**
 * Canonical public site URL for the current request.
 * Falls back to request Host headers when env still points at localhost.
 */
export async function getSiteBaseUrl(): Promise<string> {
  const envUrl = getBaseUrlFromEnv();
  if (!isLocalUrl(envUrl)) return envUrl;

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
    // Outside a request (build scripts, etc.)
  }

  return envUrl;
}
