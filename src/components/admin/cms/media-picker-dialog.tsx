"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { adminApiUrl } from "@/lib/utils";
import { uploadMediaFile } from "@/lib/admin-media-upload";
import { MediaThumb } from "@/components/admin/cms/media-thumb";
import { toast } from "sonner";

export type MediaItem = {
  id: string;
  filename: string;
  path: string;
  webpPath: string | null;
  alt: string | null;
  mime?: string;
};

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaItem) => void;
  multiple?: boolean;
  onSelectMultiple?: (items: MediaItem[]) => void;
  /** When true, file input also accepts PDF (for brochure, etc.) */
  acceptPdf?: boolean;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  multiple,
  onSelectMultiple,
  acceptPdf = false,
}: MediaPickerDialogProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(adminApiUrl(`/api/v1/admin/media${q}`));
    const data = await res.json();
    setMedia(data.data ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    if (open) {
      load();
      setSelected(new Set());
    }
  }, [open, load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    let uploaded = 0;
    let lastError = "Upload failed";

    for (const file of Array.from(files)) {
      const result = await uploadMediaFile(file);
      if (result.ok) {
        uploaded += 1;
        continue;
      }
      lastError = result.message;
    }

    setUploading(false);
    e.target.value = "";

    if (uploaded > 0) {
      toast.success(uploaded === 1 ? "File uploaded" : `${uploaded} files uploaded`);
      load();
    } else {
      toast.error(lastError);
    }
  }

  function toggle(id: string) {
    if (!multiple) {
      const item = media.find((m) => m.id === id);
      if (item) {
        onSelect(item);
        onOpenChange(false);
      }
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmMultiple() {
    const items = media.filter((m) => selected.has(m.id));
    onSelectMultiple?.(items);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Media</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="h-9 text-sm"
          />
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed px-3 text-xs hover:bg-stone-50">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept={acceptPdf ? "image/*,application/pdf,.pdf" : "image/*"}
              multiple
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
        <p className="text-[11px] text-stone-500">
          {acceptPdf
            ? "Upload images or PDF. Supported images: JPG, PNG, WebP, GIF, AVIF, SVG, BMP, TIFF, ICO, HEIC."
            : "Select from the library or upload images (JPG, PNG, WebP, GIF, AVIF, SVG, BMP, TIFF, ICO, HEIC)."}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-4 gap-2 p-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-xs text-stone-400">
              No media yet. Upload images to get started.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-1 sm:grid-cols-5">
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                    selected.has(m.id) ? "border-stone-900" : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <MediaThumb
                    path={m.path}
                    webpPath={m.webpPath}
                    mime={m.mime}
                    filename={m.filename}
                    alt={m.alt ?? ""}
                    sizes="120px"
                  />
                  {selected.has(m.id) && (
                    <span className="absolute right-1 top-1 rounded-full bg-stone-900 p-0.5 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {multiple && selected.size > 0 && (
          <Button type="button" onClick={confirmMultiple} className="w-full">
            Add {selected.size} image(s)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
