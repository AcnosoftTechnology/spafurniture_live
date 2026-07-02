import type { EventSidebar as EventSidebarContent } from "@/features/events/schemas/event-sidebar.schema";

type EventSidebarProps = {
  sidebar: EventSidebarContent;
};

export function EventSidebar({ sidebar }: EventSidebarProps) {
  return (
    <aside className="esth-events-sidebar">
      <h2 className="esth-events-sidebar-title">{sidebar.findUsTitle}</h2>
      <p className="esth-events-sidebar-copy">{sidebar.findUsBody}</p>
      <hr className="esth-events-sidebar-rule" />
      <h3 className="esth-events-sidebar-title">{sidebar.contactTitle}</h3>
      <p className="esth-events-sidebar-copy esth-events-sidebar-copy--last">{sidebar.contactBody}</p>
      <a href={sidebar.phoneHref || `tel:${sidebar.phone}`} className="esth-events-sidebar-phone">
        {sidebar.phone}
      </a>
    </aside>
  );
}
