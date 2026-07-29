/** Parse and render admin-provided JSON-LD (replaces auto schema when set). */

import { getBaseUrlFromEnv } from "@/lib/site-url-env";
import { mediaUrl } from "@/lib/utils";

export function hasManualSchema(raw: unknown): boolean {
  return normalizeManualSchema(raw) !== null;
}

/**
 * Convert Next.js optimizer URLs to a direct public file URL for schema/OG.
 * Example:
 *   /_next/image/?url=%2Fuploads%2Ffile.webp&w=256&q=75
 * → https://www.spafurniture.com/uploads/file.webp
 */
export function toDirectMediaAbsoluteUrl(value: string, baseUrl?: string): string {
  const origin = (baseUrl ?? getBaseUrlFromEnv()).replace(/\/+$/, "");
  let candidate = value.trim();
  if (!candidate) return candidate;

  try {
    const parsed = candidate.startsWith("http://") || candidate.startsWith("https://")
      ? new URL(candidate)
      : new URL(candidate, `${origin}/`);

    if (parsed.pathname.includes("/_next/image")) {
      const encoded = parsed.searchParams.get("url");
      if (encoded) candidate = decodeURIComponent(encoded);
    }
  } catch {
    // keep original candidate
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate.replace(/\/+$/, "");
  }

  const path = mediaUrl(candidate);
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function rewriteNextImageUrls(node: unknown, baseUrl: string): unknown {
  if (typeof node === "string") {
    if (node.includes("/_next/image") || node.includes("%2Fuploads%2F")) {
      return toDirectMediaAbsoluteUrl(node, baseUrl);
    }
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => rewriteNextImageUrls(item, baseUrl));
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      out[key] = rewriteNextImageUrls(value, baseUrl);
    }
    return out;
  }
  return node;
}

export function normalizeManualSchema(raw: unknown): Record<string, unknown> | null {
  const parsed = parseRawJson(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const obj = parsed as Record<string, unknown>;
  if (!Object.keys(obj).length) return null;

  const baseUrl = getBaseUrlFromEnv();
  let normalized: Record<string, unknown>;

  if (obj["@context"]) {
    normalized = obj;
  } else if (Array.isArray(obj["@graph"])) {
    normalized = {
      "@context": "https://schema.org",
      "@graph": obj["@graph"],
    };
  } else if (obj["@type"]) {
    normalized = {
      "@context": "https://schema.org",
      "@graph": [obj],
    };
  } else {
    return null;
  }

  return rewriteNextImageUrls(normalized, baseUrl) as Record<string, unknown>;
}

export function manualSchemaScript(raw: unknown): { __html: string } | null {
  const normalized = normalizeManualSchema(raw);
  if (!normalized) return null;
  return { __html: JSON.stringify(normalized) };
}

function parseRawJson(raw: unknown): unknown | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") return raw;
  return null;
}
