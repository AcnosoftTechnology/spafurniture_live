import { z } from "zod";
import defaultData from "@/features/clients/default-clients-data.json";

export const clientSectionSchema = z.object({
  left: z.array(z.string()),
  right: z.array(z.string()),
});

export const clientsPageSchema = z.object({
  intro: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
  }),
  sections: z.array(clientSectionSchema),
});

export type ClientSection = z.infer<typeof clientSectionSchema>;
export type ClientsPageContent = z.infer<typeof clientsPageSchema>;

export const defaultClientsPageContent: ClientsPageContent =
  clientsPageSchema.parse(defaultData);

export const CLIENTS_SETTING_KEY = "clients";
