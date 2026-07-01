"use client";

import { useId, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog, type MediaItem } from "@/components/admin/cms/media-picker-dialog";
import { uploadMediaFile } from "@/lib/admin-media-upload";
import { MAX_MEDIA_UPLOAD_MB } from "@/lib/media-types";
import { toast } from "sonner";

export type ProductSpecAttachmentMode = "none" | "pdf" | "external";

export type ProductSpecificationsValue = {
  mode: ProductSpecAttachmentMode;
  mediaId: string | null;
  filename: string | null;
  externalUrl: string;
  externalLabel: string;
};

type ProductSpecificationsFieldProps = {
  value: ProductSpecificationsValue;
  onChange: (value: ProductSpecificationsValue) => void;
};

export function ProductSpecificationsField({ value, onChange }: ProductSpecificationsFieldProps) {
  const inputId = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setMode(mode: ProductSpecAttachmentMode) {
    if (mode === "none") {
      onChange({
        mode: "none",
        mediaId: null,
        filename: null,
        externalUrl: "",
        externalLabel: "",
      });
      return;
    }

    if (mode === "pdf") {
      onChange({
        ...value,
        mode: "pdf",
        externalUrl: "",
        externalLabel: "",
      });
      return;
    }

    onChange({
      ...value,
      mode: "external",
      mediaId: null,
      filename: null,
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMediaFile(file);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      onChange({
        mode: "pdf",
        mediaId: result.data.id,
        filename: result.data.filename,
        externalUrl: "",
        externalLabel: "",
      });
      toast.success("PDF uploaded");
    } finally {
      setUploading(false);
    }
  }

  function handleMediaSelect(item: MediaItem) {
    if (!item.filename.toLowerCase().endsWith(".pdf") && !item.path.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF from the media library");
      return;
    }
    onChange({
      mode: "pdf",
      mediaId: item.id,
      filename: item.filename,
      externalUrl: "",
      externalLabel: "",
    });
    setPickerOpen(false);
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <Label>Specifications PDF / external link</Label>
      <p className="text-xs text-stone-500">
        Choose a PDF upload or an external link. PDF takes priority on the product page if both are set.
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["none", "None"],
            ["pdf", "Upload PDF"],
            ["external", "External link"],
          ] as const
        ).map(([mode, label]) => (
          <Button
            key={mode}
            type="button"
            size="sm"
            variant={value.mode === mode ? "default" : "outline"}
            onClick={() => setMode(mode)}
          >
            {label}
          </Button>
        ))}
      </div>

      {value.mode === "pdf" ? (
        <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
          {value.mediaId ? (
            <div className="flex flex-wrap items-center gap-3">
              <FileText className="h-8 w-8 text-stone-500" strokeWidth={1.25} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">
                  {value.filename ?? "specifications.pdf"}
                </p>
                <p className="text-xs text-stone-500">Original filename is kept for download</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    mode: "pdf",
                    mediaId: null,
                    filename: null,
                    externalUrl: "",
                    externalLabel: "",
                  })
                }
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          ) : (
            <p className="text-xs text-stone-500">No PDF attached yet.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <input
              id={inputId}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
              <label htmlFor={inputId} className="inline-flex cursor-pointer items-center">
                <Upload className="mr-1 h-3.5 w-3.5" />
                {uploading ? "Uploading..." : "Upload PDF"}
              </label>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              Choose from Media
            </Button>
          </div>
          <p className="text-xs text-stone-500">Max {MAX_MEDIA_UPLOAD_MB} MB</p>
        </div>
      ) : null}

      {value.mode === "external" ? (
        <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="space-y-2">
            <Label htmlFor="spec-external-label">Button label</Label>
            <Input
              id="spec-external-label"
              value={value.externalLabel}
              onChange={(e) => onChange({ ...value, externalLabel: e.target.value })}
              placeholder="Download Cut Sheet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spec-external-url">External URL</Label>
            <Input
              id="spec-external-url"
              type="url"
              value={value.externalUrl}
              onChange={(e) => onChange({ ...value, externalUrl: e.target.value })}
              placeholder="https://example.com/spec-sheet.pdf"
            />
          </div>
          <p className="text-xs text-stone-500">Opens in a new browser tab.</p>
        </div>
      ) : null}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        acceptPdf
        onSelect={handleMediaSelect}
      />
    </div>
  );
}

export function initialProductSpecificationsValue(initial?: {
  brochureMediaId?: string | null;
  brochureMedia?: { filename?: string } | null;
  brochureExternalUrl?: string | null;
  brochureExternalLabel?: string | null;
}): ProductSpecificationsValue {
  if (initial?.brochureMediaId) {
    return {
      mode: "pdf",
      mediaId: initial.brochureMediaId,
      filename: initial.brochureMedia?.filename ?? null,
      externalUrl: "",
      externalLabel: "",
    };
  }

  if (initial?.brochureExternalUrl?.trim()) {
    return {
      mode: "external",
      mediaId: null,
      filename: null,
      externalUrl: initial.brochureExternalUrl,
      externalLabel: initial.brochureExternalLabel ?? "",
    };
  }

  return {
    mode: "none",
    mediaId: null,
    filename: null,
    externalUrl: "",
    externalLabel: "",
  };
}
