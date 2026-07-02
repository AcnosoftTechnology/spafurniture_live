import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ShowsExhibitionsPageView } from "@/components/site/events/shows-exhibitions-page-view";
import { getShowsExhibitionsPageData } from "@/features/shows-exhibitions/get-shows-exhibitions-data";
import { defaultEventSidebar, eventSidebarSchema } from "@/features/events/schemas/event-sidebar.schema";
import { countEvents, listEvents } from "@/lib/services/event.service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SHOWS_EXHIBITIONS_INDEX_PATH } from "@/lib/shows-exhibitions-paths";
import { mediaUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata() {
  const { seo } = await getShowsExhibitionsPageData();
  return buildPageMetadata(
    {
      title: seo.seoTitle || seo.title || "Shows & Exhibitions",
      metaDescription:
        seo.metaDescription ||
        "Find Esthetica at upcoming spa furniture shows, trade fairs and exhibitions across India and worldwide.",
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage ? mediaUrl(seo.ogImage) : undefined,
      robots: seo.robots,
    },
    SHOWS_EXHIBITIONS_INDEX_PATH,
  );
}

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ShowsAndExhibitionsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const pageData = await getShowsExhibitionsPageData();
  const pageSize = pageData.content.pageSize;
  const skip = (currentPage - 1) * pageSize;

  let events: Awaited<ReturnType<typeof listEvents>> = [];
  let total = 0;

  try {
    [events, total] = await Promise.all([
      listEvents({ status: "PUBLISHED", skip, take: pageSize }),
      countEvents({ status: "PUBLISHED" }),
    ]);
  } catch {
    // empty
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (total > 0 && currentPage > totalPages) {
    redirect(totalPages > 1 ? `${SHOWS_EXHIBITIONS_INDEX_PATH}?page=${totalPages}` : SHOWS_EXHIBITIONS_INDEX_PATH);
  }

  const firstEvent = events[0];
  const sidebar = firstEvent
    ? eventSidebarSchema.parse({
        findUsTitle: firstEvent.findUsTitle,
        findUsBody: firstEvent.findUsBody,
        contactTitle: firstEvent.contactTitle,
        contactBody: firstEvent.contactBody,
        phone: firstEvent.phone,
        phoneHref: firstEvent.phoneHref,
      })
    : defaultEventSidebar;

  return (
    <Suspense fallback={null}>
      <ShowsExhibitionsPageView
        content={pageData.content}
        bannerPath={pageData.bannerPath}
        bannerWebpPath={pageData.bannerWebpPath}
        currentPage={currentPage}
        totalPages={totalPages}
        sidebar={sidebar}
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          imagePath: event.imageMedia.path,
          imageWebpPath: event.imageMedia.webpPath,
          readMoreUrl: event.readMoreUrl,
          readMoreHtml: event.readMoreHtml,
        }))}
      />
    </Suspense>
  );
}
