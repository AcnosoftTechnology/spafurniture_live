import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
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
