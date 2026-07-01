import { z } from "zod";

export const eventSidebarSchema = z.object({
  findUsTitle: z.string().default("Find Us"),
  findUsBody: z
    .string()
    .default("Come and find Esthetica at a selection of upcoming, shows, events and exhibitions!"),
  contactTitle: z.string().default("Get in Touch!"),
  contactBody: z.string().default("Call and speak to our sales team today!"),
  phone: z.string().default("+91 98731 44051"),
  phoneHref: z.string().default("tel:+919873144051"),
});

export type EventSidebar = z.infer<typeof eventSidebarSchema>;

export const defaultEventSidebar: EventSidebar = eventSidebarSchema.parse({});
