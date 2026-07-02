import { z } from "zod";
import defaultData from "@/features/distributors/default-distributors-data.json";

export const DISTRIBUTORS_PAGE_SLUG = "international-distributors";
export const DISTRIBUTORS_SETTING_KEY = "international-distributors";

export const distributorsPageSchema = z.object({
  intro: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
  }),
  sidebar: z.object({
    heading: z.string(),
    regionsHtml: z.string(),
    ctaHtml: z.string(),
    socialTitle: z.string(),
  }),
});

export type DistributorsPageContent = z.infer<typeof distributorsPageSchema>;

export const defaultDistributorsPageContent: DistributorsPageContent =
  distributorsPageSchema.parse(defaultData);
