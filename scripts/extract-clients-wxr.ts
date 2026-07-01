import fs from "fs";
import path from "path";

const xmlPath = path.join(process.cwd(), "spadata/pages.xml");
const xml = fs.readFileSync(xmlPath, "utf8");

const marker = "<link>https://www.spafurniture.in/clients/</link>";
const start = xml.indexOf(marker);
if (start < 0) throw new Error("Clients page not found");

const cdataStart = xml.indexOf("<content:encoded><![CDATA[", start);
const cdataEnd = xml.indexOf("]]></content:encoded>", cdataStart);
const content = xml.slice(cdataStart + "<content:encoded><![CDATA[".length, cdataEnd);

function stripColumnText(raw: string): string[] {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\[\/vc_column_text\]/g, "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

const parts = content.split(/\[vc_separator[^\]]*\]/);
const sections: { left: string[]; right: string[] }[] = [];

for (const part of parts) {
  const re = /\[vc_column_inner width="1\/2"\]\[vc_column_text[^\]]*\]([\s\S]*?)(?=\[vc_column_inner|\[\/vc_row_inner|$)/g;
  const cols: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(part)) !== null) {
    cols.push(match[1]);
  }
  if (cols.length < 2) continue;
  const left = stripColumnText(cols[0]);
  const right = stripColumnText(cols[1]);
  if (left.length || right.length) sections.push({ left, right });
}

const intro = {
  eyebrow: "Our Clients",
  title: "Across the globe",
  body: "Esthetica is one of the leading manufacturers of spa furniture in India. We are committed to produce highest quality of spa furniture that is being currently exported to Europe, Middle East and Asia. Please find below some of our clients.",
};

const outDir = path.join(process.cwd(), "src/features/clients");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "default-clients-data.json");
fs.writeFileSync(outPath, JSON.stringify({ intro, sections }, null, 2), "utf8");

console.log(`Wrote ${sections.length} sections (${sections.reduce((n, s) => n + s.left.length + s.right.length, 0)} names) to ${outPath}`);
