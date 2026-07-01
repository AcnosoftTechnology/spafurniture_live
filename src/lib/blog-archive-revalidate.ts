import "server-only";
import { revalidatePath } from "next/cache";
import { blogArchivePath } from "@/lib/blog-archive";

/** Revalidate ISR paths when a post is published or its date changes. */
export function revalidateBlogArchivePaths(...dates: Array<Date | string | null | undefined>) {
  const seen = new Set<string>();
  for (const value of dates) {
    if (!value) continue;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    const path = blogArchivePath(date.getFullYear(), date.getMonth() + 1);
    if (seen.has(path)) continue;
    seen.add(path);
    revalidatePath(path);
  }
  revalidatePath("/blog");
}
