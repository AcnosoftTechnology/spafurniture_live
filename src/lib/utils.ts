import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getBaseUrlFromEnv } from "@/lib/site-url-env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** @deprecated Prefer `getSiteBaseUrl()` in server code for schema/canonical URLs. */
export function getBaseUrl(): string {
  return getBaseUrlFromEnv();
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path?.trim()) return "/placeholder-product.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/uploads/${path.replace(/^\/+/, "")}`;
}

/** Admin API paths must end with `/` when trailingSlash is enabled in next.config. */
export function adminApiUrl(path: string): string {
  const qIndex = path.indexOf("?");
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const query = qIndex >= 0 ? path.slice(qIndex) : "";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${normalized}${query}`;
}
