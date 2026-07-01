import { promises as fs } from "fs";
import path from "path";
import type { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { parseWxrXml } from "@/lib/services/wxr-parse-core";
import type { WxrItem } from "@/lib/services/wxr-types";
import {
  clearMediaImportCache,
  ensureAttachmentUrlIndex,
  resolveWpMediaId,
  rewriteContentUrls,
  sideloadMediaFromUrl,
} from "@/lib/services/media-sideload.service";
import { buildBlogFieldsFromWxrItem } from "@/lib/services/wxr-blog-import";
import {
  buildProductFieldsFromWxrItem,
  parseProductGalleryWpIds,
} from "@/lib/services/wxr-product-import";
import { extractYoastSeo } from "@/lib/services/wxr-seo";
import { importFaqGroupsFromSpadata } from "@/lib/services/faq-group-import.service";

export const SPADATA_DIR = path.join(process.cwd(), "spadata");

export const SPADATA_FILES = {
  media: "media.xml",
  posts: "posts.xml",
  pages: "pages.xml",
  products: "products.xml",
  faqGroups: "faq_group.xml",
} as const;

export type SpadataImportStep = "media" | "posts" | "pages" | "products" | "faqGroups";

export type SpadataImportOptions = {
  dryRun: boolean;
  overwrite: boolean;
  authorId: string;
  steps?: SpadataImportStep[];
  /** Limit media downloads (testing) */
  mediaLimit?: number;
  skipMedia?: boolean;
};

export type StepStats = {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: { title: string; message: string }[];
};

export type SpadataImportStats = {
  filesFound: string[];
  filesMissing: string[];
  media: StepStats;
  posts: StepStats;
  pages: StepStats;
  products: StepStats;
  faqGroups: StepStats;
  categoriesCreated: number;
};

function emptyStepStats(): StepStats {
  return { created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
}

function parseStatus(value?: string): ContentStatus {
  const v = (value ?? "").toLowerCase();
  if (v === "publish" || v === "published") return "PUBLISHED";
  if (v === "draft") return "DRAFT";
  return "DRAFT";
}

function contentValue(raw: string): string | undefined {
  if (!raw?.trim()) return undefined;
  const rewritten = rewriteContentUrls(raw);
  if (rewritten.trim().startsWith("<")) return rewritten;
  return rewritten;
}

async function readSpadataFile(name: string): Promise<string | null> {
  const filePath = path.join(SPADATA_DIR, name);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function importMediaPhase(
  stats: StepStats,
  options: SpadataImportOptions,
): Promise<void> {
  const xml = await readSpadataFile(SPADATA_FILES.media);
  if (!xml) return;

  const items = parseWxrXml(xml, { postTypes: ["attachment"] });
  let processed = 0;

  for (const item of items) {
    if (options.mediaLimit && processed >= options.mediaLimit) break;

    const url = item.attachmentUrl || item.link;
    if (!url) {
      stats.skipped++;
      continue;
    }

    if (options.dryRun || options.skipMedia) {
      stats.created++;
      processed++;
      continue;
    }

    const mediaId = await sideloadMediaFromUrl(url, options.authorId, item.wpPostId);
    if (mediaId) {
      stats.created++;
    } else {
      stats.failed++;
    }
    processed++;
  }
}

async function importPostsPhase(stats: StepStats, options: SpadataImportOptions): Promise<void> {
  const xml = await readSpadataFile(SPADATA_FILES.posts);
  if (!xml) return;

  const items = parseWxrXml(xml, { postTypes: ["post"] });

  for (const item of items) {
    try {
      const title = item.title.trim();
      if (!title) {
        stats.skipped++;
        continue;
      }

      const slug = slugify(item.slug || title);
      const existing = await prisma.blogPost.findUnique({ where: { slug } });

      if (existing && !options.overwrite) {
        stats.skipped++;
        continue;
      }

      if (options.dryRun) {
        if (existing) stats.updated++;
        else stats.created++;
        continue;
      }

      const status = parseStatus(item.status);
      const publishedAt =
        status === "PUBLISHED" && item.date ? new Date(item.date) : null;

      const blogCats: string[] = [];
      const tagNames: string[] = [];
      for (const cat of item.categories) {
        if (cat.domain === "post_tag" || cat.domain === "tag") tagNames.push(cat.name);
        else if (cat.domain === "category") blogCats.push(cat.name);
      }

      const wxrFields = buildBlogFieldsFromWxrItem(item);
      const featuredId = await resolveWpMediaId(item.postmeta._thumbnail_id, options.authorId);
      const postData = {
        title,
        slug,
        excerpt: wxrFields.excerpt ?? undefined,
        content: wxrFields.content ?? contentValue(item.content),
        seoTitle: wxrFields.seoTitle ?? undefined,
        metaDescription: wxrFields.metaDescription ?? undefined,
        keywords: wxrFields.keywords,
        ogTitle: wxrFields.ogTitle ?? undefined,
        ogDescription: wxrFields.ogDescription ?? undefined,
        status,
        publishedAt,
        featuredMediaId: featuredId,
        authorId: options.authorId,
        authorDisplayName: item.creator?.trim() || undefined,
      };

      let postId: string;
      if (existing) {
        const updated = await prisma.blogPost.update({
          where: { id: existing.id },
          data: postData,
        });
        postId = updated.id;
        stats.updated++;
      } else {
        const created = await prisma.blogPost.create({ data: postData });
        postId = created.id;
        stats.created++;
      }

      for (const name of blogCats) {
        const catSlug = slugify(name);
        const cat = await prisma.blogCategory.upsert({
          where: { slug: catSlug },
          update: {},
          create: { name, slug: catSlug },
        });
        await prisma.blogPostCategory.upsert({
          where: { postId_categoryId: { postId, categoryId: cat.id } },
          update: {},
          create: { postId, categoryId: cat.id },
        });
      }

      for (const name of tagNames) {
        const tagSlug = slugify(name);
        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });
        await prisma.blogPostTag.upsert({
          where: { postId_tagId: { postId, tagId: tag.id } },
          update: {},
          create: { postId, tagId: tag.id },
        });
      }
    } catch (e) {
      stats.errors.push({
        title: item.title,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }
}

async function importPagesPhase(stats: StepStats, options: SpadataImportOptions): Promise<void> {
  const xml = await readSpadataFile(SPADATA_FILES.pages);
  if (!xml) return;

  const items = parseWxrXml(xml, { postTypes: ["page"] });

  for (const item of items) {
    try {
      const title = item.title.trim();
      if (!title) {
        stats.skipped++;
        continue;
      }

      const slug = slugify(item.slug || title);
      const existing = await prisma.page.findUnique({ where: { slug } });

      if (existing && !options.overwrite) {
        stats.skipped++;
        continue;
      }

      if (options.dryRun) {
        if (existing) stats.updated++;
        else stats.created++;
        continue;
      }

      const status = parseStatus(item.status);
      const pageOgImageId = await resolveWpMediaId(item.postmeta._thumbnail_id, options.authorId);
      const yoast = extractYoastSeo(item.postmeta, title);
      const pageData = {
        title,
        slug,
        content: contentValue(item.content),
        status,
        publishedAt:
          status === "PUBLISHED" && item.date ? new Date(item.date) : null,
        ogImageId: pageOgImageId,
        seoTitle: yoast.seoTitle || null,
        metaDescription: yoast.metaDescription || null,
        keywords: yoast.keywords ?? [],
        ogTitle: yoast.ogTitle || null,
        ogDescription: yoast.ogDescription || null,
      };

      if (existing) {
        await prisma.page.update({ where: { id: existing.id }, data: pageData });
        stats.updated++;
      } else {
        await prisma.page.create({ data: pageData });
        stats.created++;
      }
    } catch (e) {
      stats.errors.push({
        title: item.title,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }
}

async function importProductsPhase(
  stats: StepStats,
  categoriesCreated: { count: number },
  options: SpadataImportOptions,
): Promise<void> {
  const xml = await readSpadataFile(SPADATA_FILES.products);
  if (!xml) return;

  const items = parseWxrXml(xml, { postTypes: ["portfolio"] });
  const categoryIdBySlug = new Map<string, string>();

  for (const item of items) {
    for (const cat of item.categories) {
      if (cat.domain !== "portfolio_cat") continue;
      const catSlug = slugify(cat.nicename || cat.name);
      if (categoryIdBySlug.has(catSlug)) continue;

      if (options.dryRun) {
        categoriesCreated.count++;
        categoryIdBySlug.set(catSlug, "dry-run");
        continue;
      }

      const { decodeHtmlEntities } = await import("@/lib/html-entities");
      const title = decodeHtmlEntities(cat.name);
      const row = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { title, status: "PUBLISHED" },
        create: {
          title,
          slug: catSlug,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      categoryIdBySlug.set(catSlug, row.id);
      categoriesCreated.count++;
    }
  }

  for (const item of items) {
    try {
      const title = item.title.trim();
      if (!title) {
        stats.skipped++;
        continue;
      }

      const slug = slugify(item.slug || title);
      const existing = await prisma.product.findUnique({ where: { slug } });

      if (existing && !options.overwrite) {
        stats.skipped++;
        continue;
      }

      if (options.dryRun) {
        if (existing) stats.updated++;
        else stats.created++;
        continue;
      }

      const status = parseStatus(item.status);
      const portfolioCat = item.categories.find((c) => c.domain === "portfolio_cat");
      const categorySlug = portfolioCat
        ? slugify(portfolioCat.nicename || portfolioCat.name)
        : null;

      const wxrFields = buildProductFieldsFromWxrItem(item);
      const galleryWpIds = parseProductGalleryWpIds(item.postmeta);
      const galleryMediaIds: string[] = [];
      for (const wpId of galleryWpIds) {
        const mediaId = await resolveWpMediaId(wpId, options.authorId);
        if (mediaId) galleryMediaIds.push(mediaId);
      }
      const primaryImageId = galleryMediaIds[0];

      const productData = {
        title,
        slug,
        shortDesc: wxrFields.shortDesc,
        fullDesc: wxrFields.fullDesc ?? contentValue(item.content),
        dimensions: wxrFields.dimensions,
        priceDisplay: wxrFields.priceDisplay,
        seoTitle: wxrFields.seoTitle,
        metaDescription: wxrFields.metaDescription,
        keywords: wxrFields.keywords,
        ogTitle: wxrFields.ogTitle,
        ogDescription: wxrFields.ogDescription,
        status,
        publishedAt:
          status === "PUBLISHED" && item.date ? new Date(item.date) : null,
        ogImageId: primaryImageId,
      };

      let productId: string;
      if (existing) {
        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
        productId = updated.id;
        stats.updated++;
        await prisma.productGallery.deleteMany({ where: { productId } });
        await prisma.productFeature.deleteMany({ where: { productId } });
      } else {
        const created = await prisma.product.create({ data: productData });
        productId = created.id;
        stats.created++;
      }

      for (let i = 0; i < galleryMediaIds.length; i++) {
        await prisma.productGallery.create({
          data: {
            productId,
            mediaId: galleryMediaIds[i],
            sortOrder: i,
          },
        });
      }

      if (wxrFields.features.length) {
        await prisma.productFeature.createMany({
          data: wxrFields.features.map((f, i) => ({
            productId,
            label: f.label,
            value: f.value,
            sortOrder: i,
          })),
        });
      }

      if (categorySlug && categoryIdBySlug.get(categorySlug)) {
        const categoryId = categoryIdBySlug.get(categorySlug)!;
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: { productId, categoryId },
          },
          update: { isPrimary: true },
          create: { productId, categoryId, isPrimary: true },
        });
      }
    } catch (e) {
      stats.errors.push({
        title: item.title,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }
}

export async function listSpadataFiles(): Promise<{
  found: string[];
  missing: string[];
}> {
  const found: string[] = [];
  const missing: string[] = [];
  for (const file of Object.values(SPADATA_FILES)) {
    try {
      await fs.access(path.join(SPADATA_DIR, file));
      found.push(file);
    } catch {
      missing.push(file);
    }
  }
  return { found, missing };
}

export async function runSpadataImport(
  options: SpadataImportOptions,
): Promise<SpadataImportStats> {
  clearMediaImportCache();
  await ensureAttachmentUrlIndex();

  const steps = options.steps ?? ["media", "products", "posts", "pages", "faqGroups"];
  const fileList = await listSpadataFiles();
  const categoriesCreated = { count: 0 };

  const stats: SpadataImportStats = {
    filesFound: fileList.found,
    filesMissing: fileList.missing,
    media: emptyStepStats(),
    posts: emptyStepStats(),
    pages: emptyStepStats(),
    products: emptyStepStats(),
    faqGroups: emptyStepStats(),
    categoriesCreated: 0,
  };

  if (steps.includes("media")) {
    await importMediaPhase(stats.media, options);
  }
  if (steps.includes("products")) {
    await importProductsPhase(stats.products, categoriesCreated, options);
  }
  if (steps.includes("posts")) {
    await importPostsPhase(stats.posts, options);
  }
  if (steps.includes("pages")) {
    await importPagesPhase(stats.pages, options);
  }
  if (steps.includes("faqGroups")) {
    await importFaqGroupsFromSpadata(options, stats.faqGroups);
  }

  if (!options.dryRun) {
    await syncCategoryDescriptionsFromPages();
    await syncCategorySeoFromPages();
  }

  stats.categoriesCreated = categoriesCreated.count;
  return stats;
}

/** Copies SEO body text from imported WP pages into matching categories. */
async function syncCategoryDescriptionsFromPages(): Promise<void> {
  const { extractCategorySeoHtml, pageSlugsForCategory } = await import("@/lib/category-page-copy");
  const categories = await prisma.category.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, description: true },
  });

  for (const cat of categories) {
    if (cat.description?.trim()) continue;

    for (const pageSlug of pageSlugsForCategory(cat.slug)) {
      const page = await prisma.page.findFirst({
        where: { slug: pageSlug, status: "PUBLISHED" },
        select: { content: true },
      });
      if (!page?.content || typeof page.content !== "string") continue;

      const html = extractCategorySeoHtml(page.content);
      if (!html) continue;

      await prisma.category.update({
        where: { id: cat.id },
        data: { description: html },
      });
      break;
    }
  }
}

/** Copies Yoast SEO from linked WP pages into categories when category SEO is empty. */
async function syncCategorySeoFromPages(): Promise<void> {
  const { pageSlugsForCategory } = await import("@/lib/category-page-copy");
  const categories = await prisma.category.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      seoTitle: true,
      metaDescription: true,
      keywords: true,
      canonicalUrl: true,
      ogTitle: true,
      ogDescription: true,
    },
  });

  for (const cat of categories) {
    const needsSeo =
      !cat.seoTitle?.trim() ||
      !cat.metaDescription?.trim() ||
      !cat.ogTitle?.trim() ||
      !cat.ogDescription?.trim();
    if (!needsSeo) continue;

    for (const pageSlug of pageSlugsForCategory(cat.slug)) {
      const page = await prisma.page.findFirst({
        where: { slug: pageSlug, status: "PUBLISHED" },
        select: {
          seoTitle: true,
          metaDescription: true,
          keywords: true,
          canonicalUrl: true,
          ogTitle: true,
          ogDescription: true,
        },
      });
      if (!page?.seoTitle?.trim() && !page?.metaDescription?.trim()) continue;

      await prisma.category.update({
        where: { id: cat.id },
        data: {
          seoTitle: cat.seoTitle?.trim() ? cat.seoTitle : page.seoTitle,
          metaDescription: cat.metaDescription?.trim()
            ? cat.metaDescription
            : page.metaDescription,
          keywords: cat.keywords.length ? cat.keywords : page.keywords,
          canonicalUrl: cat.canonicalUrl?.trim() ? cat.canonicalUrl : page.canonicalUrl,
          ogTitle: cat.ogTitle?.trim() ? cat.ogTitle : page.ogTitle,
          ogDescription: cat.ogDescription?.trim() ? cat.ogDescription : page.ogDescription,
        },
      });
      break;
    }
  }
}
