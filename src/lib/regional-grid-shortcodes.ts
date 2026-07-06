const GRID_TAG_RE = /\[grid([^\]]*)\]([\s\S]*?)\[\/grid\]/gi;

export type RegionalGridAttrs = {
  col: number;
  border: boolean;
  style: string;
};

type GridCell = {
  html: string;
  col: number;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Unwrap TipTap `<p>[grid …]</p>` wrappers and remove empty gaps between grid blocks. */
export function normalizeEditorHtmlForGrids(html: string): string {
  return html
    .replace(/<p>\s*(\[grid[^\]]*\])\s*<\/p>/gi, "$1")
    .replace(/<p>\s*(\[\/grid\])\s*<\/p>/gi, "$1")
    .replace(/\[\/grid\]\s*(?:<p>\s*(?:<br\s*\/?>)?\s*<\/p>\s*)+/gi, "[/grid]")
    .replace(/(?:<p>\s*(?:<br\s*\/?>)?\s*<\/p>\s*)+\[grid/gi, "[grid");
}

/** True when editor left only blank lines / empty paragraphs between grid shortcodes. */
export function isIgnorableGridGapHtml(html: string): boolean {
  const stripped = html
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, "")
    .trim();

  return stripped === "";
}

export function parseRegionalGridAttrs(raw: string): RegionalGridAttrs {
  const attrs = raw
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&amp;/gi, "&");

  const colMatch = attrs.match(/\bcol\s*=\s*["']?([^"'>\s]+)["']?/i);
  let col = 12;

  if (colMatch?.[1]) {
    const value = colMatch[1].trim();
    if (value.includes("/")) {
      const [numerator, denominator] = value.split("/").map((part) => Number(part));
      if (numerator > 0 && denominator > 0) {
        col = Math.round((numerator / denominator) * 12);
      }
    } else {
      col = Number.parseInt(value, 10);
    }
  }

  col = Math.min(12, Math.max(1, Number.isFinite(col) ? col : 12));

  const border =
    /\bborder\s*=\s*["']?1["']?/i.test(attrs) ||
    (/\bborder\b/i.test(attrs) && !/\bborder\s*=\s*["']?0["']?/i.test(attrs));

  const styleMatch =
    attrs.match(/\bstyle\s*=\s*"([^"]*)"/i) ?? attrs.match(/\bstyle\s*=\s*'([^']*)'/i);

  return {
    col,
    border,
    style: styleMatch?.[1]?.trim() ?? "",
  };
}

function formatGridInnerContent(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  const lines = trimmed
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return "";
  if (lines.length === 1) {
    return `<p>${escapeHtml(lines[0])}</p>`;
  }

  const [title, ...rest] = lines;
  return `<h2 class="esth-regional-address-title">${escapeHtml(title)}</h2><p>${escapeHtml(rest.join(" "))}</p>`;
}

function renderGridCell(attrsRaw: string, inner: string): GridCell {
  const { col, border, style } = parseRegionalGridAttrs(attrsRaw);
  const classes = [
    "esth-regional-grid__item",
    `esth-regional-grid__item--span-${col}`,
    border ? "esth-regional-grid__item--border" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const styleAttr = style ? ` style="${escapeHtml(style)}"` : "";

  return {
    col,
    html: `<div class="${classes}"${styleAttr}>${formatGridInnerContent(inner)}</div>`,
  };
}

/** Pack cells into 12-column rows (Bootstrap-style). col 6+6 = one row; col 4+6 leaves 2 cols free. */
export function buildBootstrapGridRows(cells: GridCell[]): string {
  if (cells.length === 0) return "";

  let output = "";
  let rowHtml = "";
  let rowSum = 0;

  const closeRow = () => {
    if (!rowHtml) return;
    output += `<div class="esth-regional-grid">${rowHtml}</div>`;
    rowHtml = "";
    rowSum = 0;
  };

  for (const cell of cells) {
    if (rowSum + cell.col > 12 && rowHtml) {
      closeRow();
    }
    rowHtml += cell.html;
    rowSum += cell.col;
    if (rowSum >= 12) {
      closeRow();
    }
  }

  closeRow();
  return output;
}

/** Convert `[grid col="6" border="1"]…[/grid]` blocks into a responsive 12-column grid. */
export function parseRegionalGridShortcodes(html: string): string {
  const source = normalizeEditorHtmlForGrids(html);
  const parts: Array<{ type: "html" | "grid"; content: string; attrs?: string }> = [];
  let lastIndex = 0;

  for (const match of source.matchAll(GRID_TAG_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "html", content: source.slice(lastIndex, index) });
    }
    parts.push({ type: "grid", attrs: match[1] ?? "", content: (match[2] ?? "").trim() });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ type: "html", content: source.slice(lastIndex) });
  }

  let result = "";
  let pendingCells: GridCell[] = [];

  const flushPendingGrid = () => {
    if (pendingCells.length === 0) return;
    result += buildBootstrapGridRows(pendingCells);
    pendingCells = [];
  };

  for (const part of parts) {
    if (part.type === "html") {
      if (isIgnorableGridGapHtml(part.content)) continue;
      flushPendingGrid();
      result += part.content;
      continue;
    }
    pendingCells.push(renderGridCell(part.attrs ?? "", part.content));
  }

  flushPendingGrid();
  return result;
}
