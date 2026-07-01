/** Parse and render admin-provided JSON-LD (replaces auto schema when set). */

export function hasManualSchema(raw: unknown): boolean {
  return normalizeManualSchema(raw) !== null;
}

export function normalizeManualSchema(raw: unknown): Record<string, unknown> | null {
  const parsed = parseRawJson(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const obj = parsed as Record<string, unknown>;
  if (!Object.keys(obj).length) return null;

  if (obj["@context"]) return obj;

  if (Array.isArray(obj["@graph"])) {
    return {
      "@context": "https://schema.org",
      "@graph": obj["@graph"],
    };
  }

  if (obj["@type"]) {
    return {
      "@context": "https://schema.org",
      "@graph": [obj],
    };
  }

  return null;
}

export function manualSchemaScript(raw: unknown): { __html: string } | null {
  const normalized = normalizeManualSchema(raw);
  if (!normalized) return null;
  return { __html: JSON.stringify(normalized) };
}

function parseRawJson(raw: unknown): unknown | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") return raw;
  return null;
}
