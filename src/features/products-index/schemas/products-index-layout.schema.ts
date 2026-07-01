import { z } from "zod";

export const PRODUCTS_INDEX_SETTING_KEY = "products-index";

export const productsIndexGridBlockSchema = z.object({
  type: z.literal("grid"),
  productIds: z.array(z.string()),
});

export const productsIndexCategoryBlockSchema = z.object({
  type: z.literal("category"),
  categoryId: z.string(),
  side: z.enum(["left", "right"]).default("left"),
  productIds: z.array(z.string()),
});

export const productsIndexBlockSchema = z.discriminatedUnion("type", [
  productsIndexGridBlockSchema,
  productsIndexCategoryBlockSchema,
]);

export const productsIndexLayoutSchema = z.object({
  mode: z.enum(["auto", "manual"]).default("auto"),
  /** Ordered category IDs for featured rows in auto mode. Empty = all product-nav categories. */
  featuredCategoryIds: z.array(z.string()).default([]),
  /** Manual curated blocks shown in order when mode is manual. */
  blocks: z.array(productsIndexBlockSchema).default([]),
});

export type ProductsIndexLayout = z.infer<typeof productsIndexLayoutSchema>;
export type ProductsIndexBlock = z.infer<typeof productsIndexBlockSchema>;

export const defaultProductsIndexLayout: ProductsIndexLayout = productsIndexLayoutSchema.parse({
  mode: "auto",
  featuredCategoryIds: [],
  blocks: [],
});
