import { z } from "zod";

export const SHOWS_EXHIBITIONS_SETTING_KEY = "shows-exhibitions";
export const SHOWS_EXHIBITIONS_PAGE_SLUG = "shows-and-exhibitions";

export const showsExhibitionsPageSchema = z.object({
  bannerTitle: z.string().default("Get in Touch"),
  bannerMediaId: z.string().nullable().optional(),
  pageHeading: z.string().default("Shows & Exhibitions"),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export type ShowsExhibitionsPageContent = z.infer<typeof showsExhibitionsPageSchema>;

export const defaultShowsExhibitionsPageContent: ShowsExhibitionsPageContent =
  showsExhibitionsPageSchema.parse({
    bannerTitle: "Get in Touch",
    pageHeading: "Shows & Exhibitions",
    pageSize: 10,
  });
