import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { updateInquiryStatus } from "@/lib/services/inquiry.service";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
  assignedToId: z.string().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const body = schema.parse(await request.json());
  const inquiry = await updateInquiryStatus(id, body.status, body.assignedToId);
  return jsonOk(inquiry);
}
