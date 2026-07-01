import { requireAdminSession, jsonOk } from "@/lib/api-response";
import { listInquiries } from "@/lib/services/inquiry.service";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const status = new URL(request.url).searchParams.get("status") as "NEW" | undefined;
  const inquiries = await listInquiries({ status });
  return jsonOk(inquiries);
}
