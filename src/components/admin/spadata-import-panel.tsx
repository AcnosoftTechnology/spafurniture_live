"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminApiUrl } from "@/lib/utils";

type FileList = { found: string[]; missing: string[] };

type StepKey = "media" | "posts" | "pages" | "products" | "faqGroups";

const STEP_LABELS: Record<StepKey, string> = {
  media: "Media (media.xml)",
  posts: "Blog posts (posts.xml)",
  pages: "Pages (pages.xml)",
  products: "Products (products.xml)",
  faqGroups: "FAQ groups (faq_group.xml)",
};

export function SpadataImportPanel() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [skipMedia, setSkipMedia] = useState(false);
  const [steps, setSteps] = useState<StepKey[]>(["media", "products", "posts", "pages", "faqGroups"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const loadFiles = useCallback(async () => {
    const res = await fetch(adminApiUrl("/api/v1/admin/import/spadata"));
    const data = await res.json();
    if (res.ok) setFiles(data.data ?? data);
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  function toggleStep(step: StepKey) {
    setSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step],
    );
  }

  async function runImport() {
    setLoading(true);
    const res = await fetch(adminApiUrl("/api/v1/admin/import/spadata"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun, overwrite, skipMedia, steps }),
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setResult(data.data?.stats ?? data.data);
      toast.success(dryRun ? "Dry run complete" : "Spadata import complete");
    } else {
      toast.error(data.error?.message ?? "Import failed");
    }
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader>
        <CardTitle className="text-sm">Import from spadata/ folder (local files)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-stone-600">
          Place WordPress export XML files in{" "}
          <code className="rounded bg-stone-100 px-1 dark:bg-stone-900">spadata/</code> at project
          root. Order: media → products → posts → pages → FAQ groups. Featured images link via WordPress ID.
          FAQ groups power <code className="rounded bg-stone-100 px-1 dark:bg-stone-900">[sp_easyaccordion id=&quot;…&quot;]</code> in post content.
        </p>

        {files && (
          <div className="text-xs space-y-1">
            {files.found.length > 0 && (
              <p className="text-emerald-700">
                Found: {files.found.join(", ")}
              </p>
            )}
            {files.missing.length > 0 && (
              <p className="text-amber-700">Missing: {files.missing.join(", ")}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Import steps</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STEP_LABELS) as StepKey[]).map((step) => (
              <Button
                key={step}
                type="button"
                size="sm"
                variant={steps.includes(step) ? "default" : "outline"}
                onClick={() => toggleStep(step)}
              >
                {STEP_LABELS[step]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry run (preview only)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
            />
            Overwrite existing by slug
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={skipMedia}
              onChange={(e) => setSkipMedia(e.target.checked)}
            />
            Skip media download (faster dry run)
          </label>
        </div>

        <Button onClick={runImport} disabled={loading || !files?.found.length}>
          {loading ? "Importing..." : dryRun ? "Run spadata dry run" : "Import from spadata/"}
        </Button>

        {result && (
          <pre className="overflow-auto rounded bg-stone-100 p-3 text-xs dark:bg-stone-900 max-h-80">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
