"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const defaultMapping: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  content: "Content",
  excerpt: "Excerpt",
  date: "Date",
  status: "Status",
  categories: "Categories",
  tags: "Tags",
};

type ImportFormat = "csv" | "wxr" | "auto";

export function BlogImportWizard() {
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState<ImportFormat>("auto");
  const [mapping, setMapping] = useState(defaultMapping);
  const [overwrite, setOverwrite] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const isWxr =
    format === "wxr" ||
    (format === "auto" &&
      (fileName.endsWith(".xml") ||
        fileText.trim().startsWith("<?xml") ||
        fileText.includes("wordpress.org/export")));

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.toLowerCase();
    if (ext.endsWith(".xml")) setFormat("wxr");
    else if (ext.endsWith(".csv")) setFormat("csv");
    else setFormat("auto");

    const reader = new FileReader();
    reader.onload = () => setFileText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function runImport() {
    if (!fileText.trim()) {
      toast.error("Upload a file first");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/v1/admin/import/blog/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csv: fileText,
        format,
        mapping: isWxr ? undefined : mapping,
        overwrite,
        dryRun,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setResult(data.data ?? data);
      const postsFound = (data.data?.postsFound as number) ?? 0;
      toast.success(
        dryRun
          ? `Dry run: ${postsFound} posts ready to import`
          : `Imported ${postsFound} posts`,
      );
    } else {
      toast.error(data.error?.message ?? "Import failed");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">1. Upload export file</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" accept=".csv,.xml,text/csv,text/xml,application/xml" onChange={handleFile} />
          <p className="text-xs text-stone-500">
            <strong>WordPress XML (recommended):</strong> Admin → Tools → Export → All content → save as{" "}
            <code className="rounded bg-stone-100 px-1">.xml</code>
            <br />
            <strong>CSV:</strong> WP All Export / manual CSV with column headers
          </p>
          {fileName && (
            <p className="text-xs text-stone-600">
              File: {fileName} — detected as{" "}
              <strong>{isWxr ? "WordPress XML (WXR)" : "CSV"}</strong>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Label className="w-full text-xs">Format override</Label>
            {(["auto", "wxr", "csv"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={format === f ? "default" : "outline"}
                onClick={() => setFormat(f)}
              >
                {f === "auto" ? "Auto" : f.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isWxr && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">2. Column mapping (CSV only)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(mapping).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs capitalize">{key}</Label>
                <Input
                  className="h-8 text-xs"
                  value={val}
                  onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                  placeholder="CSV column header"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isWxr && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">2. WordPress XML import</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-stone-600 space-y-2">
            <p>Imports <strong>blog posts only</strong> (post_type = post).</p>
            <p>Content HTML is preserved. Categories and tags are linked automatically.</p>
            <p className="text-amber-700">
              Pages, products, and media attachments are not imported in this step yet.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{isWxr ? "3" : "3"}. Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry run (preview only — no database writes)
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            Overwrite existing posts by slug
          </label>
          <Button onClick={runImport} disabled={loading}>
            {loading ? "Processing..." : dryRun ? "Run dry run" : "Import posts"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded bg-stone-100 p-4 text-xs dark:bg-stone-900">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
