import { AdminHeader } from "@/components/admin/admin-header";
import { EventFormEnterprise } from "@/components/admin/events/event-form-enterprise";

export default function NewEventPage() {
  return (
    <>
      <AdminHeader title="New Event" />
      <main className="flex-1 overflow-y-auto p-6">
        <EventFormEnterprise />
      </main>
    </>
  );
}
