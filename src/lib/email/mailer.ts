import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { getSiteConfig } from "@/features/settings/get-settings-data";
import type { SiteConfig, SiteEmailSettings } from "@/features/settings/schemas/site-config.schema";

export type ResolvedSmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
};

export type SendMailInput = {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function resolveFromSiteEmail(email: SiteEmailSettings, siteName: string): ResolvedSmtpConfig | null {
  if (!email.enabled || !email.smtpHost.trim() || !email.fromEmail.trim()) return null;

  return {
    host: email.smtpHost.trim(),
    port: email.smtpPort,
    secure: email.smtpSecure,
    user: email.smtpUser.trim(),
    pass: email.smtpPass,
    fromEmail: email.fromEmail.trim(),
    fromName: email.fromName.trim() || siteName,
  };
}

function resolveFromEnv(): ResolvedSmtpConfig | null {
  if (!env.SMTP_HOST?.trim() || !env.SMTP_FROM?.trim()) return null;

  return {
    host: env.SMTP_HOST.trim(),
    port: Number(env.SMTP_PORT ?? 587),
    secure: Number(env.SMTP_PORT ?? 587) === 465,
    user: env.SMTP_USER?.trim() ?? "",
    pass: env.SMTP_PASS ?? "",
    fromEmail: env.SMTP_FROM.trim(),
    fromName: "Esthetica Spa Furniture",
  };
}

export function resolveSmtpConfig(site: SiteConfig): ResolvedSmtpConfig | null {
  return resolveFromSiteEmail(site.email, site.name) ?? resolveFromEnv();
}

export async function getSmtpConfig(): Promise<ResolvedSmtpConfig | null> {
  const site = await getSiteConfig();
  return resolveSmtpConfig(site);
}

function createTransporter(config: ResolvedSmtpConfig): Transporter {
  const useTls = config.port === 587 && !config.secure;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: useTls,
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    auth: config.user
      ? {
          user: config.user,
          pass: config.pass,
        }
      : undefined,
  });
}

export async function sendMail(input: SendMailInput, config?: ResolvedSmtpConfig | null) {
  const smtp = config ?? (await getSmtpConfig());
  if (!smtp) {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Email skipped (SMTP not configured):", input.subject, "→", input.to);
      return { ok: false, skipped: true as const };
    }
    throw new Error("SMTP is not configured");
  }

  const transporter = createTransporter(smtp);
  const from = smtp.fromName ? `"${smtp.fromName}" <${smtp.fromEmail}>` : smtp.fromEmail;

  await transporter.sendMail({
    from,
    to: input.to,
    cc: input.cc,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { ok: true as const };
}

export async function verifySmtpConnection(config?: ResolvedSmtpConfig | null) {
  const smtp = config ?? (await getSmtpConfig());
  if (!smtp) throw new Error("SMTP is not configured");
  const transporter = createTransporter(smtp);
  await transporter.verify();
  return { ok: true as const };
}
