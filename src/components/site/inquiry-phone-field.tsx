"use client";

import { useEffect, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  countryPhoneOptions,
  digitsOnly,
  formatPhoneDisplay,
  getCountryPhoneMeta,
  stripDialCodeFromPhone,
} from "@/lib/country-phone";
import type { InquiryInput } from "@/lib/validators/inquiry";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InquiryPhoneFieldProps = {
  form: UseFormReturn<InquiryInput>;
  inputClassName?: string;
  required?: boolean;
};

function extractNationalNumber(phone: string): string {
  let national = digitsOnly(phone);
  const dialCodes = countryPhoneOptions()
    .map((option) => digitsOnly(option.meta.dialCode))
    .filter((code) => code.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const code of dialCodes) {
    if (national.startsWith(code)) {
      national = national.slice(code.length);
      break;
    }
  }

  return national;
}

export function InquiryPhoneField({ form, inputClassName, required }: InquiryPhoneFieldProps) {
  const country = form.watch("country");
  const phone = form.watch("phone") ?? "";
  const meta = useMemo(() => getCountryPhoneMeta(country), [country]);
  const previousCountry = useRef(country);

  const nationalNumber = useMemo(() => {
    if (!phone) return "";
    return stripDialCodeFromPhone(phone, meta.dialCode) || extractNationalNumber(phone);
  }, [phone, meta.dialCode]);

  useEffect(() => {
    if (previousCountry.current === country) return;
    previousCountry.current = country;

    if (!country) {
      form.setValue("phone", "", { shouldValidate: false });
      return;
    }

    const currentPhone = form.getValues("phone");
    if (!currentPhone) return;

    const national = extractNationalNumber(currentPhone);
    form.setValue(
      "phone",
      national ? formatPhoneDisplay(meta.dialCode, national) : "",
      { shouldValidate: false },
    );
  }, [country, form, meta.dialCode]);

  return (
    <div className="esth-phone-field">
      <div
        className={cn("esth-phone-prefix", !country && "esth-phone-prefix--empty")}
        aria-label={country ? `Country code ${meta.dialCode}` : "Country code"}
      >
        <span className="esth-phone-flag" aria-hidden>
          {meta.flag}
        </span>
        <span className="esth-phone-dial">{country ? meta.dialCode : "+…"}</span>
      </div>
      <Input
        id="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className={cn("esth-phone-input", inputClassName)}
        placeholder={country ? meta.example : "Select country first"}
        disabled={!country}
        aria-invalid={Boolean(form.formState.errors.phone)}
        aria-required={required}
        value={nationalNumber}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "");
          form.setValue(
            "phone",
            country && digits ? formatPhoneDisplay(meta.dialCode, digits) : digits,
            { shouldValidate: true, shouldDirty: true },
          );
        }}
      />
    </div>
  );
}
