"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type BlogPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

function pageHref(basePath: string, page: number, q: string | null) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = "/blog/",
}: BlogPaginationProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  if (totalPages <= 1) return null;

  const items = pageNumbers(currentPage, totalPages);

  return (
    <nav className="esth-blog-pagination" aria-label="Blog pages">
      {currentPage > 1 ? (
        <Link
          href={pageHref(basePath, currentPage - 1, q)}
          className="esth-blog-pagination-btn esth-blog-pagination-btn--nav"
          rel="prev"
        >
          Previous
        </Link>
      ) : (
        <span className="esth-blog-pagination-btn esth-blog-pagination-btn--nav esth-blog-pagination-btn--disabled">
          Previous
        </span>
      )}

      <ul className="esth-blog-pagination-pages">
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <li key={`e-${i}`} className="esth-blog-pagination-ellipsis" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={pageHref(basePath, item, q)}
                className={cn(
                  "esth-blog-pagination-page",
                  item === currentPage && "esth-blog-pagination-page--active",
                )}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(basePath, currentPage + 1, q)}
          className="esth-blog-pagination-btn esth-blog-pagination-btn--nav"
          rel="next"
        >
          Next
        </Link>
      ) : (
        <span className="esth-blog-pagination-btn esth-blog-pagination-btn--nav esth-blog-pagination-btn--disabled">
          Next
        </span>
      )}
    </nav>
  );
}
