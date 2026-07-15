"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";
import {
  contactInquirySchema,
  distributorsInquirySchema,
  inquirySchema,
  type InquiryInput,
} from "@/lib/validators/inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/countries";
import { INTERNATIONAL_DISTRIBUTOR_SUBJECT } from "@/lib/country-phone";
import { cn } from "@/lib/utils";
import { InquiryPhoneField } from "@/components/site/inquiry-phone-field";

type InquiryFormProps = {
  productId?: string;
  type?: "GENERAL" | "PRODUCT" | "CONTACT";
  pageUrl?: string;
  variant?: "default" | "modal" | "contact-page" | "distributors-page";
  defaultSubject?: string;
  onSuccess?: () => void;
};

function ContactFieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="esth-contact-field-label">
      {children}
      {required ? <span className="esth-contact-required">*</span> : null}
    </Label>
  );
}

function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return <p className={cn("esth-contact-error", className)}>{message}</p>;
}

function firstValidationMessage(errors: FieldErrors<InquiryInput>): string {
  for (const key of ["email", "name", "country", "message", "subject", "phone", "company"] as const) {
    const message = errors[key]?.message;
    if (message) return String(message);
  }
  return "Please fix the highlighted fields and try again.";
}

function focusFirstInvalidField(errors: FieldErrors<InquiryInput>) {
  for (const key of ["name", "email", "country", "phone", "company", "subject", "message"] as const) {
    if (!errors[key]) continue;
    const el = document.getElementById(key);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
      break;
    }
  }
}

export function InquiryForm({
  productId,
  type = "GENERAL",
  pageUrl,
  variant = "default",
  defaultSubject = "",
  onSuccess,
}: InquiryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

const [captchaToken, setCaptchaToken] = useState("");
  const isModal = variant === "modal";
  const isContactPage = variant === "contact-page";
  const isDistributorsPage = variant === "distributors-page";
  const schema = isDistributorsPage
    ? distributorsInquirySchema
    : isContactPage
      ? contactInquirySchema
      : inquirySchema;

  const form = useForm<InquiryInput>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      type,
      productId: productId ?? "",
      pageUrl: pageUrl ?? "",
      website: "",
      subject: isDistributorsPage ? INTERNATIONAL_DISTRIBUTOR_SUBJECT : defaultSubject,
      country: "",
      phone: "",
      company: "",
      name: "",
      email: "",
      message: "",
    },
  });

  const onInvalid = useCallback((errors: FieldErrors<InquiryInput>) => {
    const message = firstValidationMessage(errors);
    form.setError("root", { message });
    toast.error(message);
    focusFirstInvalidField(errors);
  }, [form]);

  async function onSubmit(data: InquiryInput) {


      if (!captchaToken) {
  toast.error("Please verify that you are not a robot.");
  return;
}
    setLoading(true);
    form.clearErrors("root");

    try {
      const res = await fetch("/api/v1/inquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
    ...data,
    recaptchaToken: captchaToken,
    productId: data.productId?.trim() || undefined,
    pageUrl:
      pageUrl ??
      (typeof window !== "undefined"
        ? window.location.href
        : undefined),
}),
      });

      const json = (await res.json().catch(() => null)) as {
        error?: { message?: string; code?: string };
        meta?: { message?: string };
      } | null;

      if (res.ok) {
        recaptchaRef.current?.reset();

setCaptchaToken("");
        toast.success(json?.meta?.message ?? "Thank you! Your enquiry has been submitted.");
        onSuccess?.();
        router.push("/thank-you/");
        return;
      }

      const message = json?.error?.message ?? "Something went wrong. Please try again.";
      form.setError("root", { message });

      if (json?.error?.code === "VALIDATION_ERROR" && message.toLowerCase().includes("email")) {
        form.setError("email", { message });
        document.getElementById("email")?.focus({ preventScroll: true });
        document.getElementById("email")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      toast.error(message);
    } catch {
      const message = "Unable to submit right now. Please check your connection and try again.";
      form.setError("root", { message });
      toast.error(message);
    } finally {
    recaptchaRef.current?.reset();
    setCaptchaToken("");
    setLoading(false);
}
  }

  const submitHandler = form.handleSubmit(onSubmit, onInvalid);

  const labelClass = cn(
    "text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-600",
    isModal && "text-stone-500",
  );
  const inputClass = cn(
    "rounded-none border-stone-300 bg-white text-sm uppercase tracking-wide",
    isModal && "h-10",
  );
  const contactInputClass = "esth-contact-input";
  const contactSelectClass = "esth-contact-select";
  const fieldErrorClass = isContactPage || isModal ? undefined : "text-xs text-red-600";

  const emailInputProps = {
    id: "email" as const,
    type: "text" as const,
    inputMode: "email" as const,
    autoComplete: "email" as const,
    "aria-invalid": Boolean(form.formState.errors.email),
  };

  if (isModal) {
    return (
      <form onSubmit={submitHandler} noValidate className="esth-enquiry-form">
        <input type="hidden" {...form.register("website")} tabIndex={-1} autoComplete="off" className="hidden" />
        <input type="hidden" {...form.register("productId")} />
        <input type="hidden" {...form.register("type")} />

        <div className="esth-enquiry-form-scroll" data-lenis-prevent>
        <div className="esth-enquiry-form-grid">
          <div className="esth-contact-field">
            <ContactFieldLabel htmlFor="name" required>
              Name
            </ContactFieldLabel>
            <Input id="name" className="esth-contact-input" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>

          <div className="esth-contact-field">
            <ContactFieldLabel htmlFor="email" required>
              Email
            </ContactFieldLabel>
            <Input className="esth-contact-input" {...emailInputProps} {...form.register("email")} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
        </div>

        <div className="esth-enquiry-form-grid">
          <div className="esth-contact-field">
            <ContactFieldLabel htmlFor="country">Select country</ContactFieldLabel>
            <select id="country" className="esth-contact-select" {...form.register("country")}>
              <option value="">Select Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="esth-contact-field">
            <ContactFieldLabel htmlFor="phone">Telephone</ContactFieldLabel>
            <Input id="phone" className="esth-contact-input" {...form.register("phone")} />
          </div>
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="subject" required>
            Enquiry for
          </ContactFieldLabel>
          <Input id="subject" className="esth-contact-input esth-enquiry-subject" readOnly {...form.register("subject")} />
          <FieldError message={form.formState.errors.subject?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="message" required>
            Message
          </ContactFieldLabel>
          <Textarea id="message" rows={3} className="esth-contact-textarea" aria-invalid={Boolean(form.formState.errors.message)} {...form.register("message")} />
          <FieldError message={form.formState.errors.message?.message} />
        </div>

        <FieldError message={form.formState.errors.root?.message} />
        </div>
<ReCAPTCHA
    ref={recaptchaRef}
    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
    onChange={(token: string | null) => {
  setCaptchaToken(token ?? "");
}}
/>
        <div className="esth-enquiry-modal-footer">
          <Button type="submit" disabled={loading} className="esth-enquiry-submit" size="lg">
            {loading ? "Sending..." : "Send enquiry"}
          </Button>
        </div>
      </form>
    );
  }

  if (isDistributorsPage) {
    return (
      <form onSubmit={submitHandler} noValidate className="esth-contact-form">
        <input type="hidden" {...form.register("website")} tabIndex={-1} autoComplete="off" className="hidden" />
        <input type="hidden" {...form.register("productId")} />
        <input type="hidden" {...form.register("type")} />
        <input type="hidden" {...form.register("subject")} />

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="name" required>
            Name
          </ContactFieldLabel>
          <Input id="name" className={contactInputClass} aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="email" required>
            Email
          </ContactFieldLabel>
          <Input className={contactInputClass} {...emailInputProps} {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="country" required>
            Select Country
          </ContactFieldLabel>
          <select
            id="country"
            className={contactSelectClass}
            aria-invalid={Boolean(form.formState.errors.country)}
            {...form.register("country")}
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.country?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="phone" required>
            Telephone
          </ContactFieldLabel>
          <InquiryPhoneField form={form} inputClassName={contactInputClass} required />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="company">Company Name</ContactFieldLabel>
          <Input id="company" className={contactInputClass} {...form.register("company")} />
        </div>

        <div className="esth-contact-field">
          <p className="esth-contact-field-label">Enquiry Type</p>
          <p className="esth-distributors-enquiry-type">{INTERNATIONAL_DISTRIBUTOR_SUBJECT}</p>
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="message" required>
            Message
          </ContactFieldLabel>
          <Textarea id="message" rows={4} className="esth-contact-textarea" aria-invalid={Boolean(form.formState.errors.message)} {...form.register("message")} />
          <FieldError message={form.formState.errors.message?.message} />
        </div>

        <FieldError message={form.formState.errors.root?.message} />
<ReCAPTCHA
    ref={recaptchaRef}
    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
    onChange={(token: string | null) => {
  setCaptchaToken(token ?? "");
}}
/>
        <Button type="submit" disabled={loading} className="esth-contact-submit" size="lg">
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>
    );
  }

  if (isContactPage) {
    return (
      <form onSubmit={submitHandler} noValidate className="esth-contact-form">
        <input type="hidden" {...form.register("website")} tabIndex={-1} autoComplete="off" className="hidden" />
        <input type="hidden" {...form.register("productId")} />
        <input type="hidden" {...form.register("type")} />

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="name" required>
            Name
          </ContactFieldLabel>
          <Input id="name" className={contactInputClass} aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="email" required>
            Email
          </ContactFieldLabel>
          <Input className={contactInputClass} {...emailInputProps} {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="country" required>
            Select Country
          </ContactFieldLabel>
          <select
            id="country"
            className={contactSelectClass}
            aria-invalid={Boolean(form.formState.errors.country)}
            {...form.register("country")}
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.country?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="phone">Telephone</ContactFieldLabel>
          <Input id="phone" className={contactInputClass} {...form.register("phone")} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="company">Company Name</ContactFieldLabel>
          <Input id="company" className={contactInputClass} {...form.register("company")} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="subject">Subject</ContactFieldLabel>
          <Input id="subject" className={contactInputClass} aria-invalid={Boolean(form.formState.errors.subject)} {...form.register("subject")} />
          <FieldError message={form.formState.errors.subject?.message} />
        </div>

        <div className="esth-contact-field">
          <ContactFieldLabel htmlFor="message" required>
            Message
          </ContactFieldLabel>
          <Textarea id="message" rows={4} className="esth-contact-textarea" aria-invalid={Boolean(form.formState.errors.message)} {...form.register("message")} />
          <FieldError message={form.formState.errors.message?.message} />
        </div>

        <FieldError message={form.formState.errors.root?.message} />
<ReCAPTCHA
    ref={recaptchaRef}
    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
    onChange={(token: string | null) => {
  setCaptchaToken(token ?? "");
}}
/>
        <Button type="submit" disabled={loading} className="esth-contact-submit" size="lg">
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitHandler} noValidate className="space-y-4">
      <input type="hidden" {...form.register("website")} tabIndex={-1} autoComplete="off" className="hidden" />
      <input type="hidden" {...form.register("productId")} />
      <input type="hidden" {...form.register("type")} />

      <div className="space-y-2">
        <Label htmlFor="name" className={labelClass}>
          Name *
        </Label>
        <Input id="name" className={inputClass} aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
        <FieldError message={form.formState.errors.name?.message} className={fieldErrorClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className={labelClass}>
          E-mail *
        </Label>
        <Input className={inputClass} {...emailInputProps} {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} className={fieldErrorClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className={labelClass}>
          Select country
        </Label>
        <select
          id="country"
          className={cn(inputClass, "flex h-10 w-full border px-3")}
          {...form.register("country")}
        >
          <option value="">Select Country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className={labelClass}>
          Telephone
        </Label>
        <Input id="phone" className={inputClass} {...form.register("phone")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className={labelClass}>
          Enquiry for *
        </Label>
        <Input id="subject" className={inputClass} {...form.register("subject")} />
        <FieldError message={form.formState.errors.subject?.message} className={fieldErrorClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className={labelClass}>
          Message *
        </Label>
        <Textarea id="message" rows={4} className={inputClass} aria-invalid={Boolean(form.formState.errors.message)} {...form.register("message")} />
        <FieldError message={form.formState.errors.message?.message} className={fieldErrorClass} />
      </div>

      <FieldError message={form.formState.errors.root?.message} className={fieldErrorClass} />

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-sm uppercase tracking-[0.2em]",
          isModal ? "bg-stone-800 hover:bg-stone-900" : "",
        )}
        size="lg"
      >
        {loading ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}
