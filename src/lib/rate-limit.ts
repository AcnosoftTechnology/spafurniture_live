import { env } from "@/lib/env";

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW_MS });
    return { success: true, remaining: env.RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= env.RATE_LIMIT_MAX) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: env.RATE_LIMIT_MAX - entry.count };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
