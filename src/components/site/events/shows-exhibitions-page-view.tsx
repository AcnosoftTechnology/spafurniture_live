import Image from "next/image";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { ShowsExhibitionsPagination } from "@/components/site/events/shows-exhibitions-pagination";
import { EventListItem, type ShowsEventItem } from "@/components/site/events/event-list-item";
import type { ShowsExhibitionsPageContent } from "@/features/shows-exhibitions/schemas/shows-exhibitions-content.schema";
import { mediaUrl } from "@/lib/utils";

type ShowsExhibitionsPageViewProps = {
  content: ShowsExhibitionsPageContent;
  bannerPath: string | null;
  bannerWebpPath?: string | null;
  events: ShowsEventItem[];
  currentPage: number;
  totalPages: number;
};

export function ShowsExhibitionsPageView({
  content,
  bannerPath,
  bannerWebpPath,
  events,
  currentPage,
  totalPages,
}: ShowsExhibitionsPageViewProps) {
  const bannerSrc = bannerPath ? mediaUrl(bannerWebpPath ?? bannerPath) : null;

  return (
    <main className="esth-events-page">
      {bannerSrc ? (
        <section className="esth-events-banner" aria-label="Page banner">
          <div className="esth-events-banner-media">
            <Image
              src={bannerSrc}
              alt=""
              fill
              className="esth-events-banner-img"
              sizes="100vw"
              priority
            />
          </div>
          {content.bannerTitle ? (
            <p className="esth-events-banner-title">{content.bannerTitle}</p>
          ) : null}
        </section>
      ) : null}

      <EsthPageShell className="esth-events-shell">
        <header className="esth-events-header">
          <h1 className="esth-events-title">{content.pageHeading}</h1>
        </header>

        <div className="esth-events-list">
          {events.length === 0 ? (
            <p className="esth-events-empty">No upcoming events at the moment. Please check back soon.</p>
          ) : (
            events.map((event) => <EventListItem key={event.id} event={event} />)
          )}
        </div>

        <ShowsExhibitionsPagination currentPage={currentPage} totalPages={totalPages} />
      </EsthPageShell>
    </main>
  );
}
