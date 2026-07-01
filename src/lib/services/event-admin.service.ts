import { prisma } from "@/lib/prisma";
import type { ContentStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { defaultEventSidebar } from "@/features/events/schemas/event-sidebar.schema";

export type EventAdminPayload = {
  title: string;
  eventDate: string;
  imageMediaId: string;
  findUsTitle?: string;
  findUsBody?: string;
  contactTitle?: string;
  contactBody?: string;
  phone?: string;
  phoneHref?: string;
  readMoreUrl?: string | null;
  readMoreHtml?: string | null;
  status?: string;
};
function normalizeReadMoreHtml(html?: string | null) {
  const trimmed = html?.trim();
  if (!trimmed) return null;
  const plain = trimmed.replace(/<[^>]*>/g, "").trim();
  if (!plain && !/<img[\s>]/i.test(trimmed)) return null;
  return trimmed;
}

export async function saveEventAdmin(id: string | null, data: EventAdminPayload) {
  if (!data.title?.trim()) throw new AppError("VALIDATION_ERROR", "Title is required", 400);
  if (!data.imageMediaId) throw new AppError("VALIDATION_ERROR", "Event image is required", 400);

  const eventDate = new Date(data.eventDate);
  if (Number.isNaN(eventDate.getTime())) {
    throw new AppError("VALIDATION_ERROR", "Valid event date is required", 400);
  }

  const status = (data.status ?? "DRAFT") as ContentStatus;
  const readMoreUrl = data.readMoreUrl?.trim() || null;
  const readMoreHtml = readMoreUrl ? null : normalizeReadMoreHtml(data.readMoreHtml);

  const base = {
    title: data.title.trim(),
    eventDate,
    findUsTitle: data.findUsTitle?.trim() || defaultEventSidebar.findUsTitle,
    findUsBody: data.findUsBody?.trim() || defaultEventSidebar.findUsBody,
    contactTitle: data.contactTitle?.trim() || defaultEventSidebar.contactTitle,
    contactBody: data.contactBody?.trim() || defaultEventSidebar.contactBody,
    phone: data.phone?.trim() || defaultEventSidebar.phone,
    phoneHref: data.phoneHref?.trim() || defaultEventSidebar.phoneHref,
    readMoreUrl,
    readMoreHtml,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    imageMedia: { connect: { id: data.imageMediaId } },
  };
  if (id) {
    return prisma.event.update({
      where: { id },
      data: base,
      include: { imageMedia: true },
    });
  }

  return prisma.event.create({
    data: base,
    include: { imageMedia: true },
  });
}

export async function deleteEventAdmin(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!event) throw new AppError("NOT_FOUND", "Event not found", 404);
  await prisma.event.delete({ where: { id } });
  return event;
}
