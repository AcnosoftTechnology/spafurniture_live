"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { mediaUrl } from "@/lib/utils";
import { productPath } from "@/lib/paths";

type ProductCardProps = {
  title: string;
  slug: string;
  shortDesc?: string | null;
  priceDisplay?: string | null;
  imagePath?: string | null;
  featured?: boolean;
};

export function ProductCard({ title, slug, shortDesc, priceDisplay, imagePath, featured }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <Link href={productPath(slug)}>
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={mediaUrl(imagePath)}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {featured && (
            <span className="absolute left-3 top-3 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
              Featured
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-medium text-stone-900 group-hover:text-stone-600">{title}</h3>
          {shortDesc && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{shortDesc}</p>}
          {priceDisplay && (
            <p className="mt-2 text-sm font-medium text-stone-700">{priceDisplay}</p>
          )}
          <span className="mt-3 inline-block text-xs font-medium text-stone-900 underline-offset-4 group-hover:underline">
            Enquire now →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
