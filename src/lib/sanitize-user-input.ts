const HTML_TAG = /<[^>]*>/g;
const HTML_ENTITY = /&(#x?[0-9a-f]+|#[0-9]+|[a-z]+);/i;

export const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /<script[\s>]/i, message: "Script tags are not allowed." },
  { pattern: /<\/?iframe/i, message: "Embedded content is not allowed." },
  { pattern: /javascript\s*:/i, message: "JavaScript URLs are not allowed." },
  { pattern: /data\s*:/i, message: "Data URLs are not allowed." },
  { pattern: /vbscript\s*:/i, message: "VBScript URLs are not allowed." },
  { pattern: /on\w+\s*=/i, message: "Event handlers are not allowed." },
  { pattern: /<\?php/i, message: "Code snippets are not allowed." },
  { pattern: /<\/?(?:style|object|embed|link|meta|base|form|input|svg|math|img)\b/i, message: "HTML markup is not allowed." },
  { pattern: /\bunion\s+select\b/i, message: "Invalid content detected." },
  { pattern: /\bdrop\s+table\b/i, message: "Invalid content detected." },
  { pattern: /\binsert\s+into\b/i, message: "Invalid content detected." },
  { pattern: /\bdelete\s+from\b/i, message: "Invalid content detected." },
  { pattern: /;\s*--/i, message: "Invalid content detected." },
  { pattern: /'\s*or\s+'1'\s*=\s*'1/i, message: "Invalid content detected." },
];

const URL_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /https?:\/\//i, message: "Links are not allowed in your message." },
  { pattern: /\bwww\.\S+/i, message: "Links are not allowed in your message." },
  { pattern: /mailto:/i, message: "Links are not allowed in your message." },
  { pattern: /ftp:\/\//i, message: "Links are not allowed in your message." },
  {
    pattern:
      /\b[a-z0-9][-a-z0-9]{0,62}\.(com|in|org|net|co|io|uk|info|biz|me|edu|gov|au|ca|de|fr|jp|pk|ae|sa|qa|np|bd|lk|us|eu|asia|online|site|store|shop|app|dev|xyz|top|live|cloud|tech|pro|tv|cc|ws)\b/i,
    message: "Links are not allowed in your message.",
  },
];

/** Letters and spaces only, plus dot (.) — no numbers or other symbols. */
export const SAFE_PERSON_NAME = /^[\p{L}\p{M}\s.]{2,100}$/u;

/** Plain text for enquiry / comment bodies (no angle brackets). */
export const SAFE_PLAIN_TEXT =
  /^[\p{L}\p{N}\p{M}\s.,!?'"()@#%&*+\-_:;/\\[\]{}=…–—\u0900-\u097F\n\r\t]{3,5000}$/u;

export type SanitizeTextResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

export function decodeBasicEntities(value: string) {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'");
}

export function stripHtml(value: string) {
  return value.replace(HTML_TAG, "").replace(/\0/g, "");
}

export function findDangerousPattern(value: string): string | null {
  const decoded = decodeBasicEntities(value);
  const candidates = [value, decoded, stripHtml(value), stripHtml(decoded)];

  for (const text of candidates) {
    for (const rule of DANGEROUS_PATTERNS) {
      if (rule.pattern.test(text)) {
        return rule.message;
      }
    }
    if (HTML_TAG.test(text) || /[<>]/.test(text)) {
      return "HTML tags are not allowed.";
    }
  }

  return null;
}

export function findUrlPattern(value: string): string | null {
  const decoded = decodeBasicEntities(value);
  const candidates = [value, decoded, stripHtml(value), stripHtml(decoded)];

  for (const text of candidates) {
    for (const rule of URL_PATTERNS) {
      if (rule.pattern.test(text)) {
        return rule.message;
      }
    }
  }

  return null;
}

export function sanitizePersonName(value: string): SanitizeTextResult {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const stripped = stripHtml(decodeBasicEntities(trimmed));

  const danger = findDangerousPattern(trimmed);
  if (danger) {
    return { ok: false, message: danger };
  }

  if (!SAFE_PERSON_NAME.test(stripped)) {
    return {
      ok: false,
      message: "Name may only contain letters, spaces, and dots (.). Numbers and symbols are not allowed.",
    };
  }

  return { ok: true, value: stripped };
}

export function sanitizePlainTextField(
  value: string,
  options?: { minLength?: number; maxLength?: number; label?: string },
): SanitizeTextResult {
  const minLength = options?.minLength ?? 1;
  const maxLength = options?.maxLength ?? 5000;
  const label = options?.label ?? "Field";
  const normalized = value.replace(/\r\n/g, "\n").trim();
  const stripped = stripHtml(decodeBasicEntities(normalized));

  const danger = findDangerousPattern(normalized);
  if (danger) {
    return { ok: false, message: danger };
  }

  if (HTML_ENTITY.test(normalized) || /[<>`]/.test(normalized)) {
    return { ok: false, message: "HTML and special markup characters are not allowed." };
  }

  if (stripped.length < minLength) {
    return { ok: false, message: `${label} must be at least ${minLength} characters.` };
  }

  if (stripped.length > maxLength) {
    return { ok: false, message: `${label} is too long.` };
  }

  if (!SAFE_PLAIN_TEXT.test(stripped)) {
    return {
      ok: false,
      message: `${label} contains unsupported characters. Use plain text only.`,
    };
  }

  return { ok: true, value: stripped };
}

export function sanitizeInquiryMessage(value: string): SanitizeTextResult {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  const stripped = stripHtml(decodeBasicEntities(normalized));

  const danger = findDangerousPattern(normalized);
  if (danger) {
    return { ok: false, message: danger };
  }

  const url = findUrlPattern(normalized);
  if (url) {
    return { ok: false, message: url };
  }

  if (HTML_ENTITY.test(normalized) || /[<>`]/.test(normalized)) {
    return { ok: false, message: "HTML and special markup characters are not allowed." };
  }

  if (stripped.length < 10) {
    return { ok: false, message: "Message must be at least 10 characters." };
  }

  if (stripped.length > 5000) {
    return { ok: false, message: "Message is too long." };
  }

  if (!SAFE_PLAIN_TEXT.test(stripped)) {
    return {
      ok: false,
      message: "Message contains unsupported characters. Use plain text only.",
    };
  }

  return { ok: true, value: stripped };
}

export function sanitizeCommentContent(value: string): SanitizeTextResult {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  const stripped = stripHtml(decodeBasicEntities(normalized));

  const danger = findDangerousPattern(normalized);
  if (danger) {
    return { ok: false, message: danger };
  }

  const url = findUrlPattern(normalized);
  if (url) {
    return { ok: false, message: url };
  }

  if (HTML_ENTITY.test(normalized) || /[<>`]/.test(normalized)) {
    return { ok: false, message: "HTML and special markup characters are not allowed." };
  }

  if (stripped.length < 3) {
    return { ok: false, message: "Comment must be at least 3 characters." };
  }

  if (stripped.length > 5000) {
    return { ok: false, message: "Comment is too long." };
  }

  if (!SAFE_PLAIN_TEXT.test(stripped)) {
    return {
      ok: false,
      message: "Comment contains unsupported characters. Use plain text only.",
    };
  }

  return { ok: true, value: stripped };
}

export function sanitizeBlogCommentFields(input: {
  authorName: string;
  content: string;
}) {
  const author = sanitizePersonName(input.authorName);
  if (!author.ok) return author;

  const content = sanitizeCommentContent(input.content);
  if (!content.ok) return content;

  return {
    ok: true as const,
    authorName: author.value,
    content: content.value,
  };
}

export function sanitizeInquiryFields(input: {
  name: string;
  message: string;
  company?: string;
  subject?: string;
}) {
  const name = sanitizePersonName(input.name);
  if (!name.ok) return name;

  const message = sanitizeInquiryMessage(input.message);
  if (!message.ok) return message;

  let company: string | undefined;
  if (input.company?.trim()) {
    const companyResult = sanitizePlainTextField(input.company, {
      minLength: 1,
      maxLength: 150,
      label: "Company name",
    });
    if (!companyResult.ok) return companyResult;
    company = companyResult.value;
  }

  let subject: string | undefined;
  if (input.subject?.trim()) {
    const subjectResult = sanitizePlainTextField(input.subject, {
      minLength: 1,
      maxLength: 200,
      label: "Subject",
    });
    if (!subjectResult.ok) return subjectResult;
    subject = subjectResult.value;
  }

  return {
    ok: true as const,
    name: name.value,
    message: message.value,
    company,
    subject,
  };
}

/** @deprecated Use sanitizePersonName */
export const sanitizeAuthorName = sanitizePersonName;
