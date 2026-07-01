import { inquirySchema, contactInquirySchema, distributorsInquirySchema, normalizeInquiryInput, inquiryValidationMessage } from "@/lib/validators/inquiry";
import { sendInquiryNotificationEmails } from "@/lib/email";
import { createInquiry } from "@/lib/services/inquiry.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { jsonOk, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`inquiry:${ip}`);
    if (!limit.success) {
      return jsonError("RATE_LIMITED", "Too many requests. Please try again later.", 429);
    }

    const body = await request.json();
    const pageUrl = typeof body?.pageUrl === "string" ? body.pageUrl : "";
    const isDistributors = pageUrl.includes("international-distributors");
    const schema =
      isDistributors ? distributorsInquirySchema
      : body?.type === "CONTACT" ? contactInquirySchema
      : inquirySchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", inquiryValidationMessage(parsed.error.issues), 400);
    }

    const data = normalizeInquiryInput(parsed.data);

    if (data.website) {
      return jsonOk({ id: "ok" });
    }

    const inquiry = await createInquiry({
      ...data,
      pageUrl: data.pageUrl || undefined,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    try {
      await sendInquiryNotificationEmails(inquiry);
    } catch (emailError) {
      console.error("[inquiry] notification email failed:", emailError);
    }

    return jsonOk({ id: inquiry.id }, { message: "Inquiry submitted successfully" });
  } catch (error) {
    return toErrorResponse(error);
  }
}
