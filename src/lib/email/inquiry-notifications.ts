import type { Inquiry, InquiryType } from "@prisma/client";
import { getSiteConfig } from "@/features/settings/get-settings-data";
import { parseEmailList } from "@/lib/email/parse-email-list";
import { resolveSmtpConfig, sendMail } from "@/lib/email/mailer";
import { prisma } from "@/lib/prisma";

type InquiryEmailContext = {
  inquiry: Inquiry;
  siteName: string;
  productTitle?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inquiryTypeLabel(type: InquiryType) {
  switch (type) {
    case "PRODUCT":
      return "Product enquiry";
    case "CONTACT":
      return "Contact form";
    default:
      return "General enquiry";
  }
}

function buildThankYouEmail({ inquiry, siteName }: InquiryEmailContext) {
  const subject = `Thank you for contacting ${siteName}`;
  const text = [
    `Dear ${inquiry.name},`,
    "",
    `Thank you for your enquiry with ${siteName}.`,
    "We have received your message and our team will get back to you as soon as possible.",
    "",
    "Best regards,",
    siteName,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:560px">
      <p>Dear ${escapeHtml(inquiry.name)},</p>
      <p>Thank you for your enquiry with <strong>${escapeHtml(siteName)}</strong>.</p>
      <p>We have received your message and our team will get back to you as soon as possible.</p>
      <p style="margin-top:24px">Best regards,<br>${escapeHtml(siteName)}</p>
    </div>
  `;

  return { subject, text, html };
}

function fieldRow(label: string, value?: string | null) {
  if (!value?.trim()) return "";
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`;
}

function buildAdminEmail({ inquiry, siteName, productTitle }: InquiryEmailContext) {
  const subject = `New ${inquiryTypeLabel(inquiry.type)} from ${inquiry.name}`;
  const lines = [
    `New enquiry received on ${siteName}`,
    "",
    `Type: ${inquiryTypeLabel(inquiry.type)}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.country ? `Country: ${inquiry.country}` : null,
    inquiry.company ? `Company: ${inquiry.company}` : null,
    inquiry.subject ? `Subject: ${inquiry.subject}` : null,
    productTitle ? `Product: ${productTitle}` : null,
    inquiry.pageUrl ? `Page: ${inquiry.pageUrl}` : null,
    "",
    "Message:",
    inquiry.message,
  ].filter(Boolean);

  const text = lines.join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:640px">
      <h2 style="margin:0 0 16px;font-size:18px">New enquiry on ${escapeHtml(siteName)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${fieldRow("Type", inquiryTypeLabel(inquiry.type))}
        ${fieldRow("Name", inquiry.name)}
        ${fieldRow("Email", inquiry.email)}
        ${fieldRow("Phone", inquiry.phone)}
        ${fieldRow("Country", inquiry.country)}
        ${fieldRow("Company", inquiry.company)}
        ${fieldRow("Subject", inquiry.subject)}
        ${fieldRow("Product", productTitle)}
        ${fieldRow("Page", inquiry.pageUrl)}
      </table>
      <p style="margin:20px 0 8px;font-weight:600">Message</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendInquiryNotificationEmails(inquiry: Inquiry) {
  const site = await getSiteConfig();
  const smtp = resolveSmtpConfig(site);
  if (!smtp) {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Inquiry emails skipped — configure SMTP in Admin → Settings → Email");
    }
    return { userSent: false, adminSent: false, skipped: true as const };
  }

  const { email } = site;
  let productTitle: string | undefined;
  if (inquiry.productId) {
    const product = await prisma.product.findUnique({
      where: { id: inquiry.productId },
      select: { title: true },
    });
    productTitle = product?.title;
  }

  const context: InquiryEmailContext = { inquiry, siteName: site.name, productTitle };
  const results = { userSent: false, adminSent: false, skipped: false as const };

  if (email.sendUserThankYou) {
    const thankYou = buildThankYouEmail(context);
    await sendMail(
      {
        to: inquiry.email,
        subject: thankYou.subject,
        text: thankYou.text,
        html: thankYou.html,
        replyTo: email.fromEmail || site.contact.email || undefined,
      },
      smtp,
    );
    results.userSent = true;
  }

  if (email.sendAdminNotification) {
    const adminTo = parseEmailList(email.adminEmails);
    const fallback = site.contact.email?.trim();
    const recipients = adminTo.length > 0 ? adminTo : fallback ? [fallback] : [];

    if (recipients.length === 0) {
      console.warn("[email] No admin notification recipients configured");
    } else {
      const adminMail = buildAdminEmail(context);
      const cc = parseEmailList(email.ccEmails);
      await sendMail(
        {
          to: recipients,
          cc: cc.length > 0 ? cc : undefined,
          subject: adminMail.subject,
          text: adminMail.text,
          html: adminMail.html,
          replyTo: inquiry.email,
        },
        smtp,
      );
      results.adminSent = true;
    }
  }

  return results;
}
