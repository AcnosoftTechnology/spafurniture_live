import fs from "fs";

const slugs = {
  uae: "cmq0lbj0x05adcgcbsenh2w8x",
  "saudi-arabia": "cmq0lbj0o05accgcb06hja4ls",
  qatar: "cmq0lbj1905aecgcbkvzz6mqn",
};

const lines = fs.readFileSync("spafurniture_2026-06-29.sql", "utf8").split("\n");

function extractBlock(line, marker, nextMarker) {
  const start = line.indexOf(marker);
  if (start < 0) return "";
  const end = nextMarker ? line.indexOf(nextMarker, start + marker.length) : line.length;
  const chunk = line.slice(start, end);
  const textStart = chunk.indexOf("]\\\\n");
  const textEnd = chunk.indexOf("[/vc_column_text");
  if (textStart < 0) return "";
  return chunk
    .slice(textStart + 4, textEnd > textStart ? textEnd : undefined)
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .trim();
}

function decodeDiv3(line) {
  const rawStart = line.indexOf('el_id=\\\\"div-3\\\\"');
  if (rawStart < 0) return "";
  const encStart = line.indexOf("]JTND", rawStart);
  const encEnd = line.indexOf("=[/vc_raw_html]", encStart);
  if (encStart < 0 || encEnd < 0) return "";
  const encoded = line.slice(encStart + 1, encEnd);
  try {
    const intermediate = Buffer.from(encoded, "base64").toString("utf8");
    return decodeURIComponent(intermediate);
  } catch {
    return decodeURIComponent(encoded);
  }
}

function toHtmlBlocks(raw) {
  const normalized = raw
    .replace(/<h1 style="font-size: 28px;">/g, '<h1 class="esth-regional-intro-title">')
    .trim();

  return normalized
    .split("\n\n")
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function formatAddresses(html) {
  return html
    .replace(/three-column-layouts/g, "esth-regional-address-grid")
    .replace(/\bcolumns\b/g, "esth-regional-address-col")
    .replace(/<h2>/g, '<h2 class="esth-regional-address-title">');
}

const out = {};

for (const [slug, id] of Object.entries(slugs)) {
  const line = lines.find((l) => l.includes(id));
  if (!line) continue;

  const arabicHtml = toHtmlBlocks(
    extractBlock(line, 'el_id=\\\\"div-1\\\\"', 'el_id=\\\\"div-2\\\\"'),
  );
  const englishIntro = toHtmlBlocks(
    extractBlock(line, 'el_id=\\\\"div-2\\\\"', 'el_id=\\\\"div-3\\\\"'),
  );
  const englishAddresses = formatAddresses(decodeDiv3(line));
  const englishFooter = extractBlock(line, 'el_id=\\\\"div-4\\\\"', "[vc_btn");

  out[slug] = {
    arabicHtml,
    englishHtml: [englishIntro, englishAddresses, englishFooter].filter(Boolean).join("\n"),
  };
}

fs.writeFileSync(
  "src/features/regional-pages/default-regional-intro.json",
  JSON.stringify(out, null, 2),
  "utf8",
);
console.log("Wrote default-regional-intro.json");
