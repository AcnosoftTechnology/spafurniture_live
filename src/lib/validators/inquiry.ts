import { z } from "zod";
import {
  INTERNATIONAL_DISTRIBUTOR_SUBJECT,
  validatePhoneForCountry,
} from "@/lib/country-phone";
import { sanitizeInquiryMessage, sanitizePersonName, sanitizePlainTextField } from "@/lib/sanitize-user-input";

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address (e.g. name@example.com)");

const inquiryFields = {
  type: z.enum(["GENERAL", "PRODUCT", "CONTACT"]).optional(),
  name: z.string().trim().min(2).max(100),
  email: emailField,
  country: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(150).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().trim().min(10).max(5000),
  productId: z.string().optional(),
  pageUrl: z.union([z.string().url("Page URL is invalid"), z.literal("")]).optional(),
  website: z.string().max(0).optional(), // honeypot
};

type InquiryLike = {
  name: string;
  message: string;
  company?: string;
  subject?: string;
};

function refineInquiryText(data: InquiryLike, ctx: z.RefinementCtx) {
  const name = sanitizePersonName(data.name);
  if (!name.ok) {
    ctx.addIssue({ code: "custom", message: name.message, path: ["name"] });
  }

  const message = sanitizeInquiryMessage(data.message);
  if (!message.ok) {
    ctx.addIssue({ code: "custom", message: message.message, path: ["message"] });
  }

  if (data.company?.trim()) {
    const company = sanitizePlainTextField(data.company, {
      minLength: 1,
      maxLength: 150,
      label: "Company name",
    });
    if (!company.ok) {
      ctx.addIssue({ code: "custom", message: company.message, path: ["company"] });
    }
  }

  if (data.subject?.trim()) {
    const subject = sanitizePlainTextField(data.subject, {
      minLength: 1,
      maxLength: 200,
      label: "Subject",
    });
    if (!subject.ok) {
      ctx.addIssue({ code: "custom", message: subject.message, path: ["subject"] });
    }
  }
}

function transformInquiryText<T extends InquiryLike>(data: T): T {
  const name = sanitizePersonName(data.name);
  const message = sanitizeInquiryMessage(data.message);
  const company = data.company?.trim()
    ? sanitizePlainTextField(data.company, { minLength: 1, maxLength: 150, label: "Company name" })
    : null;
  const subject = data.subject?.trim()
    ? sanitizePlainTextField(data.subject, { minLength: 1, maxLength: 200, label: "Subject" })
    : null;

  return {
    ...data,
    name: name.ok ? name.value : data.name,
    message: message.ok ? message.value : data.message,
    company: company?.ok ? company.value : data.company,
    subject: subject?.ok ? subject.value : data.subject,
  };
}

export const inquirySchema = z
  .object(inquiryFields)
  .superRefine(refineInquiryText)
  .transform(transformInquiryText);

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Contact page: country is required (matches reference form). */
export const contactInquirySchema = z
  .object({
    ...inquiryFields,
    country: z.string().trim().min(1, "Please select a country").max(100),
  })
  .superRefine(refineInquiryText)
  .transform(transformInquiryText);

/** International distributors page: fixed subject, country + validated phone with dial code. */
function refineDistributorsInquiry(
  data: InquiryLike & { country?: string; phone?: string },
  ctx: z.RefinementCtx,
) {
  refineInquiryText({ ...data, subject: INTERNATIONAL_DISTRIBUTOR_SUBJECT }, ctx);

  const phoneResult = validatePhoneForCountry(data.phone, data.country);
  if (!phoneResult.ok) {
    ctx.addIssue({ code: "custom", message: phoneResult.message, path: ["phone"] });
  }
}

function transformDistributorsInquiry<T extends InquiryLike & { country?: string; phone?: string }>(
  data: T,
): T {
  const base = transformInquiryText({ ...data, subject: INTERNATIONAL_DISTRIBUTOR_SUBJECT });
  const phoneResult = validatePhoneForCountry(data.phone, data.country);

  return {
    ...base,
    subject: INTERNATIONAL_DISTRIBUTOR_SUBJECT,
    phone: phoneResult.ok ? phoneResult.value : data.phone,
  };
}

export const distributorsInquirySchema = z
  .object({
    ...inquiryFields,
    country: z.string().trim().min(1, "Please select a country").max(100),
    phone: z.string().trim().min(1, "Telephone is required").max(40),
    subject: z.string().optional(),
  })
  .superRefine(refineDistributorsInquiry)
  .transform(transformDistributorsInquiry);

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type DistributorsInquiryInput = z.infer<typeof distributorsInquirySchema>;

export function normalizeInquiryInput(data: InquiryInput): InquiryInput {
  return {
    ...data,
    country: data.country?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    company: data.company?.trim() || undefined,
    subject: data.subject?.trim() || undefined,
    productId: data.productId?.trim() || undefined,
    pageUrl: data.pageUrl?.trim() || undefined,
  };
}

export function inquiryValidationMessage(issues: z.ZodIssue[]): string {
  const first = issues[0];
  if (!first) return "Please check the form and try again.";
  if (first.path[0] === "email") {
    return "Please enter a valid email address (e.g. name@example.com).";
  }
  return first.message;
}
