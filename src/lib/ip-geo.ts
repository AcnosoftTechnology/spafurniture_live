export type IpGeoResult = {
  country?: string;
  region?: string;
  city?: string;
};

function isPrivateOrLocalIp(ip: string) {
  if (!ip || ip === "unknown") return true;
  if (ip === "::1" || ip.startsWith("127.")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) return true;
  return false;
}

/** Best-effort geo lookup for admin moderation (skipped for local/private IPs). */
export async function lookupIpGeo(ip: string): Promise<IpGeoResult | null> {
  if (isPrivateOrLocalIp(ip)) return null;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: string;
      country?: string;
      regionName?: string;
      city?: string;
    };

    if (data.status !== "success") return null;

    return {
      country: data.country || undefined,
      region: data.regionName || undefined,
      city: data.city || undefined,
    };
  } catch {
    return null;
  }
}

export function formatIpGeo(geo: IpGeoResult | null | undefined, ip?: string | null) {
  if (!geo?.country && !geo?.city && !geo?.region) {
    return ip && !isPrivateOrLocalIp(ip) ? "Location unavailable" : "Local / private network";
  }

  return [geo?.city, geo?.region, geo?.country].filter(Boolean).join(", ");
}
