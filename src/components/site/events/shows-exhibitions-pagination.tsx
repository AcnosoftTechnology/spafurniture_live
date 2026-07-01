"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SHOWS_EXHIBITIONS_INDEX_PATH } from "@/lib/shows-exhibitions-paths";

type ShowsExhibitionsPaginationProps = {
  currentPage: number;
  totalPages: number;
};

function pageHref(page: number) {
  if (page <= 1) return SHOWS_EXHIBITIONS_INDEX_PATH;
  return `${SHOWS_EXHIBITIONS_INDEX_PATH}?page=${page}`;
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

export function ShowsExhibitionsPagination({
  currentPage,
  totalPages,
}: ShowsExhibitionsPaginationProps) {
  useSearchParams();

  if (totalPages <= 1) return null;

  const items = pageNumbers(currentPage, totalPages);

  return (
    <nav className="esth-events-pagination" aria-label="Events pages">
      {currentPage > 1 ? (
        <Link href={pageHref(currentPage - 1)} className="esth-events-pagination-btn" rel="prev">
          Previous
        </Link>
      ) : (
        <span className="esth-events-pagination-btn esth-events-pagination-btn--disabled">Previous</span>
      )}

      <ul className="esth-events-pagination-pages">
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <li key={`e-${i}`} className="esth-events-pagination-ellipsis" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={pageHref(item)}
                className={cn(
                  "esth-events-pagination-page",
                  item === currentPage && "esth-events-pagination-page--active",
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
        <Link href={pageHref(currentPage + 1)} className="esth-events-pagination-btn" rel="next">
          Next
        </Link>
      ) : (
        <span className="esth-events-pagination-btn esth-events-pagination-btn--disabled">Next</span>
      )}
    </nav>
  );
}
