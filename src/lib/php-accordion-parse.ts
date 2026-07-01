/** Decode PHP serialized string literal escapes. */
function decodePhpString(value: string): string {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

/**
 * Read `s:123:"..."` at `pos` using PHP byte length (ASCII-safe for WXR FAQ HTML).
 */
function readPhpSerializedString(
  raw: string,
  pos: number,
): { value: string; end: number } | null {
  const head = raw.slice(pos).match(/^s:(\d+):"/);
  if (!head) return null;

  const len = Number.parseInt(head[1], 10);
  if (!Number.isFinite(len) || len < 0) return null;

  const start = pos + head[0].length;
  const slice = raw.slice(start, start + len);
  if (slice.length !== len) return null;

  const closing = raw[start + len];
  if (closing !== '"') return null;

  return { value: decodePhpString(slice), end: start + len + 1 };
}

function extractSerializedFieldValues(raw: string, fieldKey: string): string[] {
  const marker = `${fieldKey}";`;
  const values: string[] = [];
  let searchFrom = 0;

  while (searchFrom < raw.length) {
    const idx = raw.indexOf(marker, searchFrom);
    if (idx === -1) break;

    const parsed = readPhpSerializedString(raw, idx + marker.length);
    if (!parsed) {
      searchFrom = idx + marker.length;
      continue;
    }

    values.push(parsed.value);
    searchFrom = parsed.end;
  }

  return values;
}

/**
 * Extract FAQ rows from `sp_eap_upload_options` postmeta (PHP serialized).
 * Uses length-prefixed strings so HTML quotes inside answers do not break parsing.
 */
export function parseAccordionItemsFromPhpMeta(raw: string): Array<{ question: string; answer: string }> {
  if (!raw.includes("accordion_content_title")) return [];

  const titles = extractSerializedFieldValues(raw, "accordion_content_title");
  const answers = extractSerializedFieldValues(raw, "accordion_content_description");

  const items: Array<{ question: string; answer: string }> = [];
  for (let i = 0; i < titles.length; i++) {
    const question = titles[i]?.trim();
    if (!question) continue;
    items.push({ question, answer: answers[i]?.trim() ?? "" });
  }
  return items;
}
