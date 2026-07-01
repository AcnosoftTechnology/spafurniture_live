import Link from "next/link";
import Image from "next/image";
import { mediaUrl } from "@/lib/utils";
import { productPath } from "@/lib/paths";
import type { GridProduct } from "@/components/site/product-grid-minimal";

export function ProductCatalogCard({ product }: { product: GridProduct }) {
  return (
    <Link href={productPath(product.slug)} className="esth-products-card-link">
      <div className="esth-products-card">
        <div className="esth-products-image-wrap">
          <Image
            src={mediaUrl(product.imagePath)}
            alt={product.title}
            fill
            className="esth-products-card-image object-contain"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="esth-products-card-content">
          <h3>{product.title}</h3>
        </div>
      </div>
    </Link>
  );
}
