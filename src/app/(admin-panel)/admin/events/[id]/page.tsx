import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { EventFormEnterprise } from "@/components/admin/events/event-form-enterprise";
import { getEventById } from "@/lib/services/event.service";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id).catch(() => null);
  if (!event) notFound();

  return (
    <>
      <AdminHeader title="Edit Event" />
      <main className="flex-1 overflow-y-auto p-6">
        <EventFormEnterprise initial={event} />
      </main>
    </>
  );
}
