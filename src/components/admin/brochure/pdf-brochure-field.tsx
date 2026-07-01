"use client";

import { useId, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog, type MediaItem } from "@/components/admin/cms/media-picker-dialog";
import { uploadMediaFile } from "@/lib/admin-media-upload";
import { MAX_MEDIA_UPLOAD_MB } from "@/lib/media-types";
import { toast } from "sonner";

type PdfBrochureFieldProps = {
  mediaId: string | null;
  filename?: string | null;
  onChange: (value: { mediaId: string | null; filename?: string | null }) => void;
};

export function PdfBrochureField({ mediaId, filename, onChange }: PdfBrochureFieldProps) {
  const inputId = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      onChange({ mediaId: result.data.id, filename: result.data.filename });
      toast.success("PDF uploaded — click Save brochure page");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label>Download PDF</Label>
      <p className="text-xs text-stone-500">
        Visitors click the download button to get this file (max <strong>{MAX_MEDIA_UPLOAD_MB} MB</strong>). You can also
        upload PDFs from <strong>Admin → Media</strong>. After upload, click{" "}
        <strong>Save brochure page</strong>.
      </p>

      {mediaId ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <FileText className="h-8 w-8 text-stone-500" strokeWidth={1.25} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-stone-800">{filename ?? "brochure.pdf"}</p>
            <p className="text-xs text-stone-500">Attached to download button</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ mediaId: null, filename: null })}>
            <X className="mr-1 h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      ) : null}

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

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        acceptPdf
        onSelect={(item) => {
          if (!item.filename.toLowerCase().endsWith(".pdf") && !item.path.toLowerCase().endsWith(".pdf")) {
            toast.error("Please select a PDF from the media library");
            return;
          }
          onChange({ mediaId: item.id, filename: item.filename });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
