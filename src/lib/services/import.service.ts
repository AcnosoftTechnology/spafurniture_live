import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { ContentStatus, ImportJobStatus } from "@prisma/client";
import type { WxrItem } from "@/lib/services/wxr-types";
import { buildBlogFieldsFromWxrItem } from "@/lib/services/wxr-blog-import";
import { parseWxrXml } from "@/lib/services/wxr-parse-core";

export type BlogCsvRow = Record<string, string>;

export type BlogImportMapping = Record<string, string> & {
  title: string;
};

function parseStatus(value?: string): ContentStatus {
  const v = (value ?? "").toLowerCase();
  if (v === "publish" || v === "published") return "PUBLISHED";
  if (v === "draft") return "DRAFT";
  return "DRAFT";
}

export function parseBlogCsv(csvText: string): BlogCsvRow[] {
  const result = Papa.parse<BlogCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors.length) {
    throw new Error(result.errors[0]?.message ?? "CSV parse error");
  }
  return result.data;
}

export async function createImportJob(filename: string, userId?: string) {
  return prisma.importJob.create({
    data: {
      type: "BLOG_CSV",
      filename,
      status: "PENDING",
      createdById: userId,
    },
  });
}

export async function runBlogImport(params: {
  jobId: string;
  rows: BlogCsvRow[];
  mapping: BlogImportMapping;
  overwrite: boolean;
  dryRun: boolean;
  defaultAuthorId: string;
}) {
  const stats = { created: 0, updated: 0, skipped: 0, errors: [] as { row: number; message: string }[] };

  await prisma.importJob.update({
    where: { id: params.jobId },
    data: { status: "PROCESSING" },
  });

  for (let i = 0; i < params.rows.length; i++) {
    const row = params.rows[i];
    try {
      const title = row[params.mapping.title]?.trim();
      if (!title) {
        stats.skipped++;
        continue;
      }

      const slug = slugify(row[params.mapping.slug ?? ""] || title);
      const existing = await prisma.blogPost.findUnique({ where: { slug } });

      if (existing && !params.overwrite) {
        stats.skipped++;
        continue;
      }

      const contentField = params.mapping.content ? row[params.mapping.content] : "";
      const excerpt = params.mapping.excerpt ? row[params.mapping.excerpt] : undefined;

      const contentValue = contentField
        ? contentField.trim().startsWith("<")
          ? contentField
          : {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: contentField }] }],
            }
        : undefined;
      const status = parseStatus(params.mapping.status ? row[params.mapping.status] : "publish");
      const publishedAt = params.mapping.date && row[params.mapping.date]
        ? new Date(row[params.mapping.date])
        : new Date();

      const categoryNames = params.mapping.categories
        ? (row[params.mapping.categories] ?? "").split("|").map((s) => s.trim()).filter(Boolean)
        : [];
      const tagNames = params.mapping.tags
        ? (row[params.mapping.tags] ?? "").split("|").map((s) => s.trim()).filter(Boolean)
        : [];

      if (params.dryRun) {
        if (existing) stats.updated++;
        else stats.created++;
        continue;
      }

      const postData = {
        title,
        slug,
        excerpt: excerpt ?? undefined,
        content: contentValue,
        status,
        publishedAt: status === "PUBLISHED" ? publishedAt : null,
        authorId: params.defaultAuthorId,
      };

      let postId: string;
      if (existing) {
        const updated = await prisma.blogPost.update({ where: { id: existing.id }, data: postData });
        postId = updated.id;
        stats.updated++;
      } else {
        const created = await prisma.blogPost.create({ data: postData });
        postId = created.id;
        stats.created++;
      }

      for (const name of categoryNames) {
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
      stats.errors.push({ row: i + 1, message: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  const status: ImportJobStatus = stats.errors.length ? "COMPLETED" : "COMPLETED";

  await prisma.importJob.update({
    where: { id: params.jobId },
    data: { status, stats },
  });

  return stats;
}

export async function runWxrBlogImport(params: {
  jobId: string;
  items: WxrItem[];
  overwrite: boolean;
  dryRun: boolean;
  defaultAuthorId: string;
}) {
  const stats = { created: 0, updated: 0, skipped: 0, errors: [] as { row: number; message: string }[] };

  await prisma.importJob.update({
    where: { id: params.jobId },
    data: { status: "PROCESSING" },
  });

  for (let i = 0; i < params.items.length; i++) {
    const item = params.items[i];
    try {
      const title = item.title.trim();
      if (!title) {
        stats.skipped++;
        continue;
      }

      const slug = slugify(item.slug || title);
      const existing = await prisma.blogPost.findUnique({ where: { slug } });

      if (existing && !params.overwrite) {
        stats.skipped++;
        continue;
      }

      const blogCats: string[] = [];
      const tagNames: string[] = [];
      for (const cat of item.categories) {
        if (cat.domain === "post_tag" || cat.domain === "tag") tagNames.push(cat.name);
        else if (cat.domain === "category") blogCats.push(cat.name);
      }

      if (params.dryRun) {
        if (existing) stats.updated++;
        else stats.created++;
        continue;
      }

      const status = parseStatus(item.status);
      const publishedAt =
        status === "PUBLISHED" && item.date ? new Date(item.date) : new Date();
      const wxrFields = buildBlogFieldsFromWxrItem(item);

      const postData = {
        title,
        slug,
        ...wxrFields,
        status,
        publishedAt: status === "PUBLISHED" ? publishedAt : null,
        authorId: params.defaultAuthorId,
      };

      let postId: string;
      if (existing) {
        const updated = await prisma.blogPost.update({ where: { id: existing.id }, data: postData });
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
      stats.errors.push({ row: i + 1, message: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  await prisma.importJob.update({
    where: { id: params.jobId },
    data: { status: "COMPLETED", stats },
  });

  return stats;
}

export function parseWxrBlogItems(xmlText: string): WxrItem[] {
  const items = parseWxrXml(xmlText, { postTypes: ["post"] });
  if (!items.length) {
    throw new Error(
      "No blog posts found in this export. Export must include Posts (post_type=post).",
    );
  }
  return items;
}
