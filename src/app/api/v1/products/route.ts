import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-response";
import { countProducts, listProducts } from "@/lib/services/product.service";
import { toErrorResponse } from "@/lib/errors";

const DEFAULT_TAKE = 12;
const MAX_TAKE = 48;

function mapGridProduct(p: {
  id: string;
  title: string;
  slug: string;
  gallery: { media: { path: string } }[];
}) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    imagePath: p.gallery[0]?.media?.path ?? null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = Math.max(0, Number(searchParams.get("skip") ?? 0) || 0);
    const take = Math.min(
      Math.max(1, Number(searchParams.get("take") ?? DEFAULT_TAKE) || DEFAULT_TAKE),
      MAX_TAKE,
    );
    const categorySlug = searchParams.get("categorySlug")?.trim() || undefined;

    let categoryId: string | undefined;
    if (categorySlug) {
      const category = await prisma.category.findFirst({
        where: { slug: categorySlug, status: "PUBLISHED" },
        select: { id: true },
      });
      if (!category) {
        return jsonOk({ items: [], hasMore: false, nextSkip: 0 }, { total: 0 });
      }
      categoryId = category.id;
    }

    const filter = { status: "PUBLISHED" as const, categoryId };

    const [products, total] = await Promise.all([
      listProducts({ ...filter, skip, take }),
      countProducts(filter),
    ]);

    const items = products.map(mapGridProduct);
    const loaded = skip + items.length;

    return jsonOk(
      {
        items,
        hasMore: loaded < total,
        nextSkip: loaded,
      },
      { total },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
