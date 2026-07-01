import { requireAdminSession, jsonOk, jsonError } from "@/lib/api-response";
import { toErrorResponse } from "@/lib/errors";
import { getSiteConfig, mergeSiteConfigPatch } from "@/features/settings/get-settings-data";
import type { SiteEmailSettings } from "@/features/settings/schemas/site-config.schema";
import { parseEmailList } from "@/lib/email/parse-email-list";
import { resolveSmtpConfig, sendMail, verifySmtpConnection } from "@/lib/email/mailer";

export async function POST(request: Request) {
  try {
    const { error, session } = await requireAdminSession();
    if (error) return error;

    const body = (await request.json()) as {
      email?: Partial<SiteEmailSettings>;
      testTo?: string;
    };

    const current = await getSiteConfig();
    const merged = body.email
      ? mergeSiteConfigPatch(current, { email: { ...current.email, ...body.email } })
      : current;
    const smtp = resolveSmtpConfig(merged);
    if (!smtp) {
      return jsonError("SMTP_NOT_CONFIGURED", "Enable email and fill in SMTP host + from email first.", 400);
    }
    if (smtp.user && !smtp.pass) {
      return jsonError(
        "SMTP_NOT_CONFIGURED",
        "SMTP password is missing. Enter the password and click Save all changes before testing.",
        400,
      );
    }

    await verifySmtpConnection(smtp);

    const testTo =
      body.testTo?.trim() ||
      session?.user?.email ||
      merged.email.fromEmail ||
      parseEmailList(merged.email.adminEmails)[0];

    if (!testTo) {
      return jsonError("VALIDATION_ERROR", "Provide a test recipient email address.", 400);
    }

    await sendMail(
      {
        to: testTo,
        subject: `SMTP test — ${merged.name}`,
        text: "This is a test email from your Esthetica admin panel. SMTP is working correctly.",
        html: `<p>This is a test email from your <strong>${merged.name}</strong> admin panel.</p><p>SMTP is working correctly.</p>`,
      },
      smtp,
    );

    return jsonOk({ sentTo: testTo });
  } catch (e) {
    return toErrorResponse(e);
  }
}
