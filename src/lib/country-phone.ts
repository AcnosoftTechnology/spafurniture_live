import { COUNTRIES } from "@/lib/countries";

export const INTERNATIONAL_DISTRIBUTOR_SUBJECT = "International Distributor Enquiry";

export type CountryPhoneMeta = {
  iso2: string;
  dialCode: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  nationalPattern: RegExp;
  example: string;
};

function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/** Dial codes + validation for enquiry form countries. */
const PHONE_META: Record<string, CountryPhoneMeta> = {
  India: {
    iso2: "IN",
    dialCode: "+91",
    flag: flagEmoji("IN"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^[6-9]\d{9}$/,
    example: "9876543210",
  },
  "United Arab Emirates": {
    iso2: "AE",
    dialCode: "+971",
    flag: flagEmoji("AE"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^5\d{8}$/,
    example: "501234567",
  },
  "United States": {
    iso2: "US",
    dialCode: "+1",
    flag: flagEmoji("US"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^[2-9]\d{9}$/,
    example: "2125550123",
  },
  "United Kingdom": {
    iso2: "GB",
    dialCode: "+44",
    flag: flagEmoji("GB"),
    minDigits: 10,
    maxDigits: 11,
    nationalPattern: /^7\d{9,10}$/,
    example: "7911123456",
  },
  Australia: {
    iso2: "AU",
    dialCode: "+61",
    flag: flagEmoji("AU"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^4\d{8}$/,
    example: "412345678",
  },
  Canada: {
    iso2: "CA",
    dialCode: "+1",
    flag: flagEmoji("CA"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^[2-9]\d{9}$/,
    example: "4165550123",
  },
  Germany: {
    iso2: "DE",
    dialCode: "+49",
    flag: flagEmoji("DE"),
    minDigits: 10,
    maxDigits: 11,
    nationalPattern: /^1[5-7]\d{8,9}$/,
    example: "15123456789",
  },
  France: {
    iso2: "FR",
    dialCode: "+33",
    flag: flagEmoji("FR"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^[67]\d{8}$/,
    example: "612345678",
  },
  Singapore: {
    iso2: "SG",
    dialCode: "+65",
    flag: flagEmoji("SG"),
    minDigits: 8,
    maxDigits: 8,
    nationalPattern: /^[89]\d{7}$/,
    example: "81234567",
  },
  "Saudi Arabia": {
    iso2: "SA",
    dialCode: "+966",
    flag: flagEmoji("SA"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^5\d{8}$/,
    example: "501234567",
  },
  Qatar: {
    iso2: "QA",
    dialCode: "+974",
    flag: flagEmoji("QA"),
    minDigits: 8,
    maxDigits: 8,
    nationalPattern: /^[3-7]\d{7}$/,
    example: "33123456",
  },
  Oman: {
    iso2: "OM",
    dialCode: "+968",
    flag: flagEmoji("OM"),
    minDigits: 8,
    maxDigits: 8,
    nationalPattern: /^[79]\d{7}$/,
    example: "92123456",
  },
  Bahrain: {
    iso2: "BH",
    dialCode: "+973",
    flag: flagEmoji("BH"),
    minDigits: 8,
    maxDigits: 8,
    nationalPattern: /^[3-9]\d{7}$/,
    example: "36123456",
  },
  Kuwait: {
    iso2: "KW",
    dialCode: "+965",
    flag: flagEmoji("KW"),
    minDigits: 8,
    maxDigits: 8,
    nationalPattern: /^[569]\d{7}$/,
    example: "50123456",
  },
  "South Africa": {
    iso2: "ZA",
    dialCode: "+27",
    flag: flagEmoji("ZA"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^[6-8]\d{8}$/,
    example: "821234567",
  },
  Belgium: {
    iso2: "BE",
    dialCode: "+32",
    flag: flagEmoji("BE"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^4\d{8}$/,
    example: "470123456",
  },
  Poland: {
    iso2: "PL",
    dialCode: "+48",
    flag: flagEmoji("PL"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^[5-9]\d{8}$/,
    example: "512345678",
  },
  Italy: {
    iso2: "IT",
    dialCode: "+39",
    flag: flagEmoji("IT"),
    minDigits: 9,
    maxDigits: 10,
    nationalPattern: /^3\d{8,9}$/,
    example: "3123456789",
  },
  Spain: {
    iso2: "ES",
    dialCode: "+34",
    flag: flagEmoji("ES"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^[6-9]\d{8}$/,
    example: "612345678",
  },
  Netherlands: {
    iso2: "NL",
    dialCode: "+31",
    flag: flagEmoji("NL"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^6\d{8}$/,
    example: "612345678",
  },
  "Sri Lanka": {
    iso2: "LK",
    dialCode: "+94",
    flag: flagEmoji("LK"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^7\d{8}$/,
    example: "712345678",
  },
  Bangladesh: {
    iso2: "BD",
    dialCode: "+880",
    flag: flagEmoji("BD"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^1[3-9]\d{8}$/,
    example: "1712345678",
  },
  Nepal: {
    iso2: "NP",
    dialCode: "+977",
    flag: flagEmoji("NP"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^9[78]\d{8}$/,
    example: "9812345678",
  },
  Malaysia: {
    iso2: "MY",
    dialCode: "+60",
    flag: flagEmoji("MY"),
    minDigits: 9,
    maxDigits: 10,
    nationalPattern: /^1\d{8,9}$/,
    example: "123456789",
  },
  Thailand: {
    iso2: "TH",
    dialCode: "+66",
    flag: flagEmoji("TH"),
    minDigits: 9,
    maxDigits: 9,
    nationalPattern: /^[689]\d{8}$/,
    example: "812345678",
  },
  Indonesia: {
    iso2: "ID",
    dialCode: "+62",
    flag: flagEmoji("ID"),
    minDigits: 9,
    maxDigits: 11,
    nationalPattern: /^8\d{8,10}$/,
    example: "8123456789",
  },
  Philippines: {
    iso2: "PH",
    dialCode: "+63",
    flag: flagEmoji("PH"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^9\d{9}$/,
    example: "9123456789",
  },
  Japan: {
    iso2: "JP",
    dialCode: "+81",
    flag: flagEmoji("JP"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^[789]0\d{8}$/,
    example: "9012345678",
  },
  China: {
    iso2: "CN",
    dialCode: "+86",
    flag: flagEmoji("CN"),
    minDigits: 11,
    maxDigits: 11,
    nationalPattern: /^1\d{10}$/,
    example: "13912345678",
  },
  Brazil: {
    iso2: "BR",
    dialCode: "+55",
    flag: flagEmoji("BR"),
    minDigits: 10,
    maxDigits: 11,
    nationalPattern: /^[1-9]\d{9,10}$/,
    example: "11987654321",
  },
  Mexico: {
    iso2: "MX",
    dialCode: "+52",
    flag: flagEmoji("MX"),
    minDigits: 10,
    maxDigits: 10,
    nationalPattern: /^[1-9]\d{9}$/,
    example: "5512345678",
  },
  Other: {
    iso2: "UN",
    dialCode: "+",
    flag: "🌐",
    minDigits: 6,
    maxDigits: 15,
    nationalPattern: /^\d{6,15}$/,
    example: "1234567890",
  },
};

const DEFAULT_META = PHONE_META.Other;

export function getCountryPhoneMeta(country: string | undefined | null): CountryPhoneMeta {
  if (!country?.trim()) return DEFAULT_META;
  return PHONE_META[country] ?? DEFAULT_META;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function stripDialCodeFromPhone(phone: string, dialCode: string): string {
  const phoneDigits = digitsOnly(phone);
  const codeDigits = digitsOnly(dialCode);
  if (codeDigits && phoneDigits.startsWith(codeDigits)) {
    return phoneDigits.slice(codeDigits.length);
  }
  return phoneDigits;
}

export function formatPhoneWithDialCode(dialCode: string, nationalNumber: string): string {
  const national = digitsOnly(nationalNumber);
  if (!national) return "";
  const code = dialCode === "+" ? "+" : dialCode;
  return `${code}${national}`;
}

export function formatPhoneDisplay(dialCode: string, nationalNumber: string): string {
  const formatted = formatPhoneWithDialCode(dialCode, nationalNumber);
  if (!formatted) return "";
  if (dialCode === "+") return formatted;
  return `${dialCode} ${digitsOnly(nationalNumber)}`;
}

export type PhoneValidationResult = { ok: true; value: string } | { ok: false; message: string };

export function validatePhoneForCountry(
  phone: string | undefined,
  country: string | undefined,
): PhoneValidationResult {
  const trimmed = phone?.trim();
  if (!trimmed) {
    return { ok: false, message: "Telephone is required." };
  }

  if (!country?.trim()) {
    return { ok: false, message: "Please select a country before entering your phone number." };
  }

  const meta = getCountryPhoneMeta(country);
  const national = stripDialCodeFromPhone(trimmed, meta.dialCode);

  if (!national) {
    return { ok: false, message: "Please enter your phone number." };
  }

  if (national.length < meta.minDigits || national.length > meta.maxDigits) {
    return {
      ok: false,
      message: `Enter a valid ${country} phone number (${meta.minDigits}${meta.maxDigits !== meta.minDigits ? `–${meta.maxDigits}` : ""} digits, e.g. ${meta.example}).`,
    };
  }

  if (!meta.nationalPattern.test(national)) {
    return {
      ok: false,
      message: `Enter a valid ${country} phone number (e.g. ${meta.example}).`,
    };
  }

  const value = formatPhoneDisplay(meta.dialCode, national);
  return { ok: true, value };
}

/** All dial-code options for countries in the enquiry list. */
export function countryPhoneOptions(): Array<{ country: string; meta: CountryPhoneMeta }> {
  return COUNTRIES.map((country) => ({
    country,
    meta: getCountryPhoneMeta(country),
  }));
}
