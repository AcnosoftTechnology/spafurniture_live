import { revalidatePath } from "next/cache";
import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { aboutContentSchema } from "@/features/about/schemas/about-content.schema";
import {
  aboutPathFromSlug,
  getAdminAboutEditorData,
  saveAboutContent,
  saveAboutPageSeo,
} from "@/features/about/get-about-data";

function revalidateAboutPaths(...slugs: string[]) {
  for (const slug of new Set(slugs)) {
    const path = aboutPathFromSlug(slug);
    revalidatePath(path);
    revalidatePath(path.slice(0, -1));
  }
  revalidatePath("/about");
  revalidatePath("/about/");
}

export async function GET() {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    return jsonOk(await getAdminAboutEditorData());
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

    let slugForRevalidate = "about";

    if (content) {
      await saveAboutContent(aboutContentSchema.parse(content));
    }

    if (page) {
      const result = await saveAboutPageSeo({
        slug: String(page.slug ?? "about"),
        title: String(page.title ?? "About Us"),
        seoTitle: page.seoTitle ? String(page.seoTitle) : undefined,
        metaDescription: page.metaDescription ? String(page.metaDescription) : undefined,
        keywords: Array.isArray(page.keywords) ? page.keywords.map(String) : [],
        canonicalUrl: page.canonicalUrl ? String(page.canonicalUrl) : undefined,
        ogTitle: page.ogTitle ? String(page.ogTitle) : undefined,
        ogDescription: page.ogDescription ? String(page.ogDescription) : undefined,
        ogImageId: page.ogImageId ? String(page.ogImageId) : null,
        robots: page.robots ? String(page.robots) : undefined,
      });
      slugForRevalidate = result.nextSlug;
      revalidateAboutPaths(result.previousSlug, result.nextSlug);
    } else {
      revalidateAboutPaths(slugForRevalidate);
    }

    return jsonOk({ saved: true, slug: slugForRevalidate });
  } catch (e) {
    return toErrorResponse(e);
  }
}
