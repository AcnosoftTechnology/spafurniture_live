import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { countEvents, listEvents } from "@/lib/services/event.service";
import { saveEventAdmin } from "@/lib/services/event-admin.service";
import { toErrorResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import type { ContentStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const search = searchParams.get("search") ?? undefined;
  const statusParam = searchParams.get("status");
  const status: ContentStatus | undefined =
    statusParam === "PUBLISHED" || statusParam === "DRAFT" || statusParam === "ARCHIVED"
      ? statusParam
      : undefined;

  const filters = { search, status };
  const [items, total] = await Promise.all([
    listEvents({ ...filters, skip: (page - 1) * pageSize, take: pageSize }),
    countEvents(filters),
  ]);

  return jsonOk({
    items: items.map((event) => ({
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
      status: event.status,
      readMoreUrl: event.readMoreUrl,
    })),
    total,
    page,
    pageSize,
  });
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminSession();
    if (error) return error;
    const body = await request.json();
    const event = await saveEventAdmin(null, body);
    revalidatePath("/shows-and-exhibitions/");
    return jsonOk(event);
  } catch (e) {
    return toErrorResponse(e);
  }
}
