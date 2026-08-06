import { prisma } from "@/lib/prisma";
import type { BlogAdminPayload } from "@/types/cms";
import type { ContentStatus, Prisma } from "@prisma/client";

function blogMediaForUpdate(
  data: BlogAdminPayload,
): Pick<Prisma.BlogPostUpdateInput, "featuredMedia" | "ogImage"> {
  return {
    featuredMedia: data.featuredMediaId
      ? { connect: { id: data.featuredMediaId } }
      : { disconnect: true },
    ogImage: data.ogImageId ? { connect: { id: data.ogImageId } } : { disconnect: true },
  };
}

/** Create cannot use `disconnect` — omit relation when no media is set. */
function blogMediaForCreate(
  data: BlogAdminPayload,
): Pick<Prisma.BlogPostCreateInput, "featuredMedia" | "ogImage"> {
  return {
    ...(data.featuredMediaId ? { featuredMedia: { connect: { id: data.featuredMediaId } } } : {}),
    ...(data.ogImageId ? { ogImage: { connect: { id: data.ogImageId } } } : {}),
  };
}

function resolvePublishedAt(
  status: ContentStatus,
  publishedAt: string | null | undefined,
  scheduledAt: string | null | undefined,
): Date | null {
  if (publishedAt) return new Date(publishedAt);
  if (status === "PUBLISHED") {
    if (scheduledAt) {
      const scheduled = new Date(scheduledAt);
      if (!Number.isNaN(scheduled.getTime())) return scheduled;
    }
    return new Date();
  }
  return null;
}

function blogPostFields(data: BlogAdminPayload) {
  const status = (data.status ?? "DRAFT") as ContentStatus;
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    content: data.content ?? undefined,
    status,
    publishedAt: resolvePublishedAt(status, data.publishedAt, data.scheduledAt),
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    seoTitle: data.seoTitle || null,
    metaDescription: data.metaDescription || null,
    keywords: data.keywords ?? [],
    canonicalUrl: data.canonicalUrl || null,
    robots: data.robots || "index,follow",
    ogTitle: data.ogTitle || null,
    ogDescription: data.ogDescription || null,
    twitterCard: data.twitterCard || "summary_large_image",
  };
}

export async function saveBlogPostAdmin(id: string | null, data: BlogAdminPayload) {
  const fields = blogPostFields(data);

  return prisma.$transaction(async (tx) => {
    let postId = id;

    if (postId) {
      await tx.blogPost.update({
        where: { id: postId },
        data: {
          ...fields,
          ...blogMediaForUpdate(data),
        },
      });
      await tx.blogPostCategory.deleteMany({ where: { postId } });
      await tx.blogPostTag.deleteMany({ where: { postId } });
    } else {
      if (!data.authorId) throw new Error("authorId required");
      const created = await tx.blogPost.create({
        data: {
          ...fields,
          ...blogMediaForCreate(data),
          author: { connect: { id: data.authorId } },
        },
      });
      postId = created.id;
    }

    if (data.categoryIds?.length) {
      await tx.blogPostCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({ postId: postId!, categoryId })),
      });
    }

    if (data.tagIds?.length) {
      await tx.blogPostTag.createMany({
        data: data.tagIds.map((tagId) => ({ postId: postId!, tagId })),
      });
    }

    return tx.blogPost.findUnique({
      where: { id: postId! },
      include: {
        featuredMedia: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        ogImage: true,
      },
    });
  });
}
