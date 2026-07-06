"use client";

import { usePathname } from "next/navigation";
import { BlogPostDetailSkeleton } from "@/components/site/blog/blog-post-detail-skeleton";
import { RegionalLandingSkeleton } from "@/components/site/regional/regional-landing-skeleton";
import { isKnownRegionalSlug } from "@/features/regional-pages/constants";

function slugFromPathname(pathname: string) {
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  return segment ?? "";
}

export function SlugPageLoading() {
  const pathname = usePathname();
  const slug = slugFromPathname(pathname);

  if (isKnownRegionalSlug(slug)) {
    return <RegionalLandingSkeleton slug={slug} />;
  }

  return <BlogPostDetailSkeleton />;
}
