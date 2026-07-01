import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  shortDesc: z.string().optional(),
  priceDisplay: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sortOrder: z.number().int().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});
