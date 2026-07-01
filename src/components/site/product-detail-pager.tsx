"use client";

import Link from "next/link";
import Image from "next/image";
import { mediaUrl } from "@/lib/utils";
import { productPath } from "@/lib/paths";

export type NextProductPreview = {
  slug: string;
  title: string;
  imagePath?: string | null;
};

function NineDotsIcon() {
  return (
    <span className="detailGridIcon" aria-hidden>
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

export function ProductDetailPager({ nextProduct }: { nextProduct: NextProductPreview | null }) {
  return (
    <div className="detailPagerRow">
      <Link href="/products" className="detailPagerGridLink" aria-label="View all products">
        <NineDotsIcon />
      </Link>

      {nextProduct && (
        <div className="detailPagerNextWrap">
          <Link
            href={productPath(nextProduct.slug)}
            className="detailPagerNextLink"
            aria-label={`Next product: ${nextProduct.title}`}
          >
            <span className="detailPagerNextPreview">
              {nextProduct.imagePath ? (
                <span className="detailPagerNextThumb">
                  <Image
                    src={mediaUrl(nextProduct.imagePath)}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </span>
              ) : (
                <span className="detailPagerNextThumb detailPagerNextThumb--empty" />
              )}
              <span className="detailPagerNextTitle">{nextProduct.title}</span>
            </span>
            <span className="detailPagerArrow" aria-hidden>
              ›
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
