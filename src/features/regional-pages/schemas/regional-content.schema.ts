import { z } from "zod";
import type { LegacyRegionalSlug } from "../types";
import introDefaults from "../default-regional-intro.json";

export const regionalIntroSchema = z.object({
  arabicHtml: z.string(),
  englishHtml: z.string(),
  arabicButtonLabel: z.string().default("العربية"),
  englishButtonLabel: z.string().default("ENGLISH"),
});

export const regionalPageContentSchema = z.object({
  hero: z.object({
    imagePath: z.string(),
    alt: z.string().default("Spa furniture"),
    caption: z.string().optional(),
    mediaId: z.string().nullable().optional(),
  }),
  intro: regionalIntroSchema,
  productsIntro: z.object({
    tag: z.string(),
    heading: z.string(),
    body: z.string(),
  }),
});

export type RegionalPageContent = z.infer<typeof regionalPageContentSchema>;

const sharedHero = {
  imagePath: "/uploads/1781241018015-kb54m1mrz6n.gif",
  alt: "Esthetica spa massage bed",
  caption: "Featured Here The Shirodhara Massage Bed",
};

const sharedProductsIntro = {
  tag: "OUR PRODUCTS",
  heading: "Crafted till\nPerfection",
  body: "Explore our extensive collection, featuring high-end electric massage beds, specialized spa beds, hydraulic massage tables, spa treatment tables, Ayurvedic massage tables, spa trolleys, spa stools, relaxation loungers, manicure tables, and luxury pedicure chairs.",
};

export function normalizeIntroHtml(html: string): string {
  return html
    .replace(/<h1[^>]*>/gi, '<h1 class="esth-regional-intro-title">')
    .replace(/<\/h1>\n([^<\n][^\n]+)/g, "</h1>\n<p>$1</p>")
    .replace(
      /(?<!href="mailto:)madi\.international@spafurniture\.in/g,
      '<a href="mailto:madi.international@spafurniture.in">madi.international@spafurniture.in</a>',
    );
}

function introForSlug(slug: LegacyRegionalSlug) {
  const row = introDefaults[slug];
  return regionalIntroSchema.parse({
    arabicHtml: normalizeIntroHtml(row.arabicHtml),
    englishHtml: normalizeIntroHtml(row.englishHtml),
    arabicButtonLabel: "العربية",
    englishButtonLabel: "ENGLISH",
  });
}

export const defaultRegionalPageContent: Record<LegacyRegionalSlug, RegionalPageContent> = {
  uae: {
    hero: sharedHero,
    intro: introForSlug("uae"),
    productsIntro: {
      ...sharedProductsIntro,
      body: `${sharedProductsIntro.body} Each piece is designed to elevate spa experiences across the UAE.`,
    },
  },
  "saudi-arabia": {
    hero: sharedHero,
    intro: introForSlug("saudi-arabia"),
    productsIntro: {
      ...sharedProductsIntro,
      body: `${sharedProductsIntro.body} Trusted by hospitality and wellness brands across Saudi Arabia.`,
    },
  },
  qatar: {
    hero: sharedHero,
    intro: introForSlug("qatar"),
    productsIntro: {
      ...sharedProductsIntro,
      body: `${sharedProductsIntro.body} Serving premium spa projects across Qatar.`,
    },
  },
};
