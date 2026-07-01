import Link from "next/link";
import Image from "next/image";
import { mediaUrl } from "@/lib/utils";
import { productPath } from "@/lib/paths";

export type GridProduct = {
  id: string;
  title: string;
  slug: string;
  imagePath?: string | null;
};

export type ProductGridEmptyVariant = "all" | "category";

const EMPTY_COPY: Record<ProductGridEmptyVariant, { title: string; hint?: string }> = {
  all: {
    title: "No products found",
    hint: "Publish products in the admin panel or run the spadata import if your catalogue is empty.",
  },
  category: {
    title: "No products in this category yet",
    hint: "Try browsing all products or choose another category.",
  },
};

export function ProductGridMinimal({
  products,
  emptyVariant = "category",
}: {
  products: GridProduct[];
  emptyVariant?: ProductGridEmptyVariant;
}) {
  if (products.length === 0) {
    const copy = EMPTY_COPY[emptyVariant];
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-stone-600">{copy.title}</p>
        {copy.hint && <p className="mt-2 text-sm text-stone-500">{copy.hint}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={productPath(p.slug)}
          className="group block overflow-hidden rounded-sm bg-[#eceae6] transition hover:shadow-md"
        >
          <div className="relative aspect-square p-4">
            <Image
              src={mediaUrl(p.imagePath)}
              alt={p.title}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
