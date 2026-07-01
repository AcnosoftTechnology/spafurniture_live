import { prisma } from "@/lib/prisma";
import type { PageAdminPayload } from "@/types/cms";
import { Prisma, type ContentStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { extractCategorySeoHtml, pageSlugsForCategory } from "@/lib/category-page-copy";

const PROTECTED_SLUGS = new Set(["home"]);
const RESERVED_SLUGS = new Set([
  "products",
  "blog",
  "admin",
  "api",
  "thank-you",
  "contact-us",
]);

function parseSchemaJson(raw: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return Prisma.JsonNull;
  if (typeof raw === "object") return raw as Prisma.InputJsonValue;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Prisma.InputJsonValue;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function assertSlugAllowed(slug: string, isUpdate?: boolean) {
  const clean = slug.trim().toLowerCase();
  if (!clean) throw new AppError("VALIDATION_ERROR", "Slug is required", 400);
  if (RESERVED_SLUGS.has(clean)) {
    throw new AppError("VALIDATION_ERROR", `Slug "${clean}" is reserved for system routes`, 400);
  }
  if (!isUpdate && PROTECTED_SLUGS.has(clean)) {
    throw new AppError("VALIDATION_ERROR", `Slug "${clean}" is managed in Homepage settings`, 400);
  }
}

export async function listPagesAdmin(params?: { search?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 20));
  const search = params?.search?.trim();

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { ogImage: true },
    }),
    prisma.page.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: { ogImage: true },
  });
}

async function syncLinkedCategoryDescription(pageSlug: string, rawContent: string | null) {
  if (!rawContent?.trim()) return;

  const html = extractCategorySeoHtml(rawContent) ?? rawContent;
  const categories = await prisma.category.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true },
  });

  for (const cat of categories) {
    if (pageSlugsForCategory(cat.slug).includes(pageSlug)) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { description: html },
      });
    }
  }
}

export async function savePageAdmin(id: string | null, data: PageAdminPayload) {
  assertSlugAllowed(data.slug, Boolean(id));

  const status = (data.status ?? "DRAFT") as ContentStatus;
  const contentSource =
    data.contentHtml?.trim() ||
    (typeof data.content === "string" ? data.content : null);

  const base: Prisma.PageUpdateInput = {
    title: data.title.trim(),
    slug: data.slug.trim().toLowerCase(),
    content: data.content ?? undefined,
    template: data.template ?? "DEFAULT",
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    seoTitle: data.seoTitle || null,
    metaDescription: data.metaDescription || null,
    keywords: data.keywords ?? [],
    canonicalUrl: data.canonicalUrl || null,
    robots: data.robots || "index,follow",
    ogTitle: data.ogTitle || null,
    ogDescription: data.ogDescription || null,
    twitterCard: data.twitterCard || "summary_large_image",
    ogImage: data.ogImageId ? { connect: { id: data.ogImageId } } : { disconnect: true },
    ...(parseSchemaJson(data.schemaJson) !== undefined
      ? { schemaJson: parseSchemaJson(data.schemaJson) }
      : {}),
  };

  let page;
  if (id) {
    const existing = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
    if (!existing) throw new AppError("NOT_FOUND", "Page not found", 404);
    if (PROTECTED_SLUGS.has(existing.slug) && data.slug !== existing.slug) {
      throw new AppError("VALIDATION_ERROR", "Home page slug cannot be changed here", 400);
    }
    page = await prisma.page.update({ where: { id }, data: base, include: { ogImage: true } });
  } else {
    page = await prisma.page.create({
      data: base as Prisma.PageCreateInput,
      include: { ogImage: true },
    });
  }

  if (contentSource) {
    await syncLinkedCategoryDescription(page.slug, contentSource);
  }

  return page;
}

export async function deletePageAdmin(id: string) {
  const page = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
  if (!page) throw new AppError("NOT_FOUND", "Page not found", 404);
  if (PROTECTED_SLUGS.has(page.slug)) {
    throw new AppError("VALIDATION_ERROR", "Home page cannot be deleted. Edit it from Homepage.", 400);
  }
  await prisma.page.delete({ where: { id } });
  return page;
}

export async function deletePagesAdmin(ids: string[]) {
  const pages = await prisma.page.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });
  const blocked = pages.filter((p) => PROTECTED_SLUGS.has(p.slug));
  if (blocked.length) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Cannot delete protected page(s): ${blocked.map((p) => p.slug).join(", ")}`,
      400,
    );
  }
  const result = await prisma.page.deleteMany({
    where: { id: { in: pages.map((p) => p.id) } },
  });
  return { count: result.count, slugs: pages.map((p) => p.slug) };
}
