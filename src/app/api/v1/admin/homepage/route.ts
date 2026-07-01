import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categoryPath } from "@/lib/paths";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { homepageContentSchema } from "@/features/homepage/schemas/homepage-content.schema";
import {
  saveHomepageContent,
  getAdminHomepageEditorData,
  HOMEPAGE_FAQ_ENTITY,
} from "@/features/homepage/get-homepage-data";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    return jsonOk(await getAdminHomepageEditorData());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const { content, page, faqs, featuredCategoryIds, categoryMenuLabels } = body as {
      content?: unknown;
      page?: Record<string, unknown>;
      faqs?: Array<{ id?: string; question: string; answer: string; sortOrder?: number; schemaEnabled?: boolean }>;
      featuredCategoryIds?: string[];
      categoryMenuLabels?: Array<{ id: string; menuLabel?: string | null }>;
    };

    if (content) {
      await saveHomepageContent(homepageContentSchema.parse(content));
    }

    if (page) {
      const ogImageId = page.ogImageId ? String(page.ogImageId) : null;
      await prisma.page.upsert({
        where: { slug: "home" },
        update: {
          title: String(page.title ?? "Home"),
          seoTitle: page.seoTitle ? String(page.seoTitle) : null,
          metaDescription: page.metaDescription ? String(page.metaDescription) : null,
          keywords: Array.isArray(page.keywords) ? page.keywords.map(String) : [],
          canonicalUrl: page.canonicalUrl ? String(page.canonicalUrl) : null,
          ogTitle: page.ogTitle ? String(page.ogTitle) : null,
          ogDescription: page.ogDescription ? String(page.ogDescription) : null,
          ogImage: ogImageId ? { connect: { id: ogImageId } } : { disconnect: true },
          robots: page.robots ? String(page.robots) : "index,follow",
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
        create: {
          title: String(page.title ?? "Home"),
          slug: "home",
          seoTitle: page.seoTitle ? String(page.seoTitle) : null,
          metaDescription: page.metaDescription ? String(page.metaDescription) : null,
          keywords: Array.isArray(page.keywords) ? page.keywords.map(String) : [],
          canonicalUrl: page.canonicalUrl ? String(page.canonicalUrl) : null,
          ogTitle: page.ogTitle ? String(page.ogTitle) : null,
          ogDescription: page.ogDescription ? String(page.ogDescription) : null,
          ogImage: ogImageId ? { connect: { id: ogImageId } } : undefined,
          robots: page.robots ? String(page.robots) : "index,follow",
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }

    if (Array.isArray(faqs)) {
      await prisma.faq.deleteMany({ where: { entityType: "HOMEPAGE", entityId: HOMEPAGE_FAQ_ENTITY } });
      if (faqs.length > 0) {
        await prisma.faq.createMany({
          data: faqs.map((faq, index) => ({
            entityType: "HOMEPAGE",
            entityId: HOMEPAGE_FAQ_ENTITY,
            question: faq.question,
            answer: faq.answer,
            sortOrder: faq.sortOrder ?? index,
            schemaEnabled: faq.schemaEnabled ?? true,
          })),
        });
      }
    }

    if (Array.isArray(categoryMenuLabels)) {
      for (const item of categoryMenuLabels) {
        if (!item?.id) continue;
        await prisma.category.update({
          where: { id: item.id },
          data: { menuLabel: item.menuLabel?.trim() || null },
        });
      }
    }

    if (Array.isArray(featuredCategoryIds)) {
      await prisma.category.updateMany({
        data: { homepageFeatured: false, homepageFeaturedSortOrder: 0 },
      });
      for (let index = 0; index < featuredCategoryIds.length; index++) {
        await prisma.category.update({
          where: { id: featuredCategoryIds[index] },
          data: {
            homepageFeatured: true,
            homepageFeaturedSortOrder: index,
            sortOrder: index,
          },
        });
      }
    }

    if (Array.isArray(categoryMenuLabels) || Array.isArray(featuredCategoryIds)) {
      const navCategories = await prisma.category.findMany({
        where: { showInProductNav: true },
        select: { slug: true },
      });
      for (const cat of navCategories) {
        revalidatePath(categoryPath(cat.slug));
      }
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/");
    return jsonOk({ saved: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
