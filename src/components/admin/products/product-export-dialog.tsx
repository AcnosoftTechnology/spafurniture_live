"use client";

import { useMemo, useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApiUrl } from "@/lib/utils";
import {
  PRODUCT_EXPORT_FIELDS,
  PRODUCT_EXPORT_FIELD_KEYS,
  PRODUCT_EXPORT_GROUPS,
  type ProductExportFieldGroup,
} from "@/lib/product-export-fields";

type ProductExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selected product row ids — empty = export all (or search filter) */
  productIds: string[];
  search?: string;
};

export function ProductExportDialog({
  open,
  onOpenChange,
  productIds,
  search,
}: ProductExportDialogProps) {
  const [fields, setFields] = useState<Set<string>>(() => new Set(PRODUCT_EXPORT_FIELD_KEYS));
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<ProductExportFieldGroup, typeof PRODUCT_EXPORT_FIELDS>();
    for (const group of PRODUCT_EXPORT_GROUPS) map.set(group, []);
    for (const field of PRODUCT_EXPORT_FIELDS) {
      map.get(field.group)!.push(field);
    }
    return PRODUCT_EXPORT_GROUPS.map((group) => ({
      group,
      fields: map.get(group) ?? [],
    }));
  }, []);

  const noneChecked = fields.size === 0;

  function selectAll() {
    setFields(new Set(PRODUCT_EXPORT_FIELD_KEYS));
  }

  function uncheckAll() {
    setFields(new Set());
  }

  function toggleField(key: string, checked: boolean) {
    setFields((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleGroup(groupFields: { key: string }[], checked: boolean) {
    setFields((prev) => {
      const next = new Set(prev);
      for (const f of groupFields) {
        if (checked) next.add(f.key);
        else next.delete(f.key);
      }
      return next;
    });
  }

  async function runExport(format: "json" | "csv") {
    if (!fields.size) {
      toast.error("Select at least one field to export");
      return;
    }

    setExporting(format);
    try {
      const params = new URLSearchParams({
        format,
        fields: [...fields].join(","),
      });
      if (search) params.set("search", search);
      if (productIds.length > 0) params.set("ids", productIds.join(","));

      const res = await fetch(adminApiUrl(`/api/v1/admin/products/export?${params}`));
      if (!res.ok) {
        let message = "Export failed";
        try {
          const json = (await res.json()) as { error?: { message?: string } };
          if (json.error?.message) message = json.error.message;
        } catch {
          /* ignore */
        }
        toast.error(message);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename =
        match?.[1] ??
        `products-export-${new Date().toISOString().slice(0, 10)}.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${fields.size} field(s) as ${format.toUpperCase()}${
          productIds.length ? ` (${productIds.length} products)` : ""
        }`,
      );
      onOpenChange(false);
    } finally {
      setExporting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Export products</DialogTitle>
          <p className="text-xs font-normal text-stone-500">
            Choose which fields to include.
            {productIds.length > 0
              ? ` ${productIds.length} selected product(s).`
              : search
                ? " Limited to current search."
                : " Full catalog."}
          </p>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b bg-stone-50 px-5 py-2.5">
          <Button type="button" size="sm" variant="outline" onClick={selectAll} disabled={!!exporting}>
            Select all
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={uncheckAll} disabled={!!exporting}>
            Uncheck all
          </Button>
          <span className="ml-auto text-xs text-stone-500">
            {fields.size} / {PRODUCT_EXPORT_FIELD_KEYS.length} selected
          </span>
        </div>

        <div className="max-h-[min(55vh,28rem)] space-y-4 overflow-y-auto px-5 py-4">
          {grouped.map(({ group, fields: groupFields }) => {
            const groupChecked = groupFields.every((f) => fields.has(f.key));
            const groupPartial = !groupChecked && groupFields.some((f) => fields.has(f.key));

            return (
              <div key={group} className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-600">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5"
                    checked={groupChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = groupPartial;
                    }}
                    onChange={(e) => toggleGroup(groupFields, e.target.checked)}
                    disabled={!!exporting}
                  />
                  {group}
                </label>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {groupFields.map((field) => (
                    <label
                      key={field.key}
                      className="flex cursor-pointer items-start gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:border-stone-200 hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        checked={fields.has(field.key)}
                        onChange={(e) => toggleField(field.key, e.target.checked)}
                        disabled={!!exporting}
                      />
                      <span className="leading-snug text-stone-800">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 border-t bg-white px-5 py-3 sm:justify-between">
          <p className="hidden text-[11px] text-stone-400 sm:block">
            <Download className="mr-1 inline h-3 w-3" />
            JSON keeps nested objects; CSV flattens selected columns.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!exporting || noneChecked}
              onClick={() => runExport("csv")}
            >
              {exporting === "csv" ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
              )}
              Export CSV
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!!exporting || noneChecked}
              onClick={() => runExport("json")}
            >
              {exporting === "json" ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileJson className="mr-1 h-3.5 w-3.5" />
              )}
              Export JSON
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
