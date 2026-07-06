import fs from "fs";

const slugs = {
  uae: "cmq0lbj0x05adcgcbsenh2w8x",
  "saudi-arabia": "cmq0lbj0o05accgcb06hja4ls",
  qatar: "cmq0lbj1905aecgcbkvzz6mqn",
};

const lines = fs.readFileSync("spafurniture_2026-06-29.sql", "utf8").split("\n");

function extractBlock(line, divId, nextDivId) {
  const start = line.indexOf(`div-${divId}`);
  const end = line.indexOf(`div-${nextDivId}`, start + 1);
  const chunk = line.slice(start, end > start ? end : undefined);
  const textStart = chunk.indexOf("]\\\\n");
  const textEnd = chunk.indexOf("[/vc_column_text");
  if (textStart < 0) return "";
  return chunk
    .slice(textStart + 3, textEnd > textStart ? textEnd : undefined)
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .trim();
}

for (const [slug, id] of Object.entries(slugs)) {
  const line = lines.find((l) => l.includes(id));
  if (!line) continue;
  const ar = extractBlock(line, "1", "2");
  const en = extractBlock(line, "2", "3");
  const enFooter = extractBlock(line, "4", "button");
  console.log("\n========", slug, "========");
  console.log("AR:\n", ar.slice(0, 500));
  console.log("EN:\n", en.slice(0, 500));
  console.log("EN footer:\n", enFooter);
}
