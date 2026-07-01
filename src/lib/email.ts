import { sendMail } from "@/lib/email/mailer";

export { sendMail, getSmtpConfig, verifySmtpConnection, resolveSmtpConfig } from "@/lib/email/mailer";
export { sendInquiryNotificationEmails } from "@/lib/email/inquiry-notifications";
export { parseEmailList } from "@/lib/email/parse-email-list";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = "Reset your password";
  const text = `Reset your password using this link:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6">
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  try {
    await sendMail({ to: email, subject, text, html });
    return { ok: true };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Password reset link for", email, ":", resetUrl);
      return { ok: true, dev: true };
    }
    throw error;
  }
}
