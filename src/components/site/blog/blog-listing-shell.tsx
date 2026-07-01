"use client";

import { useEffect, useState } from "react";
import { BlogCard, type BlogCardPost } from "@/components/site/blog/blog-card";
import { BlogViewSwitcher } from "@/components/site/blog/blog-view-switcher";
import {
  BLOG_VIEW_STORAGE_KEY,
  DEFAULT_BLOG_VIEW,
  isBlogViewMode,
  type BlogViewMode,
} from "@/components/site/blog/blog-view";
import { cn } from "@/lib/utils";

type BlogListingShellProps = {
  posts: BlogCardPost[];
};

export function BlogListingShell({ posts }: BlogListingShellProps) {
  const [view, setView] = useState<BlogViewMode>(DEFAULT_BLOG_VIEW);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(BLOG_VIEW_STORAGE_KEY);
    if (isBlogViewMode(stored)) setView(stored);
    setHydrated(true);
  }, []);

  function handleViewChange(next: BlogViewMode) {
    setView(next);
    localStorage.setItem(BLOG_VIEW_STORAGE_KEY, next);
  }

  if (posts.length === 0) {
    return <p className="esth-blog-empty">No articles published yet. Check back soon.</p>;
  }

  return (
    <>
      <div className="esth-blog-toolbar">
        <BlogViewSwitcher view={view} onChange={handleViewChange} />
      </div>
      <div
        className={cn(
          "esth-blog-posts",
          `esth-blog-posts--${hydrated ? view : DEFAULT_BLOG_VIEW}`,
        )}
      >
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} view={hydrated ? view : DEFAULT_BLOG_VIEW} />
        ))}
      </div>
    </>
  );
}
