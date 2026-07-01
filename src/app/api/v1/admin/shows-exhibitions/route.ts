import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import {
  getAdminShowsExhibitionsEditorData,
  saveShowsExhibitionsContent,
} from "@/features/shows-exhibitions/get-shows-exhibitions-data";
import { showsExhibitionsPageSchema } from "@/features/shows-exhibitions/schemas/shows-exhibitions-content.schema";
import { SHOWS_EXHIBITIONS_PAGE_SLUG } from "@/features/shows-exhibitions/schemas/shows-exhibitions-content.schema";

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    return jsonOk(await getAdminShowsExhibitionsEditorData());
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;

    const body = await request.json();
    const { content, page } = body as {
      content?: unknown;
      page?: Record<string, unknown>;
    };

    if (content) {
      await saveShowsExhibitionsContent(showsExhibitionsPageSchema.parse(content));
    }

    if (page) {
      const ogImageId = page.ogImageId ? String(page.ogImageId) : null;
      await prisma.page.upsert({
        where: { slug: SHOWS_EXHIBITIONS_PAGE_SLUG },
        update: {
          title: String(page.title ?? "Shows & Exhibitions"),
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
          title: String(page.title ?? "Shows & Exhibitions"),
          slug: SHOWS_EXHIBITIONS_PAGE_SLUG,
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

    revalidatePath("/shows-and-exhibitions");
    revalidatePath("/shows-and-exhibitions/");
    return jsonOk({ saved: true });
  } catch (e) {
    return toErrorResponse(e);
  }
}
