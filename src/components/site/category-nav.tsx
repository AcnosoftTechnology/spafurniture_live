"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { categoryPath } from "@/lib/paths";

export type CategoryNavItem = {
  title: string;
  slug: string;
};

export function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: CategoryNavItem[];
  activeSlug?: string | null;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const active = navRef.current?.querySelector(".esth-products-tab-btn.active");
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeSlug, categories.length]);

  return (
    <div className="esth-products-tabs-wrap">
      <nav ref={navRef} className="esth-products-tabs" aria-label="Product categories">
        <Link
          href="/products"
          className={cn("esth-products-tab-btn", !activeSlug && "active")}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={categoryPath(c.slug)}
            className={cn("esth-products-tab-btn", activeSlug === c.slug && "active")}
          >
            {c.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
