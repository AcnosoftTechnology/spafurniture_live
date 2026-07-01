"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { MediaThumb } from "@/components/admin/cms/media-thumb";
import { uploadMediaFile } from "@/lib/admin-media-upload";
import { adminApiUrl } from "@/lib/utils";
import { toast } from "sonner";

type MediaItem = {
  id: string;
  filename: string;
  path: string;
  webpPath: string | null;
  alt: string | null;
  mime: string;
};

export function MediaManager({ onSelect }: { onSelect?: (media: MediaItem) => void }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(adminApiUrl("/api/v1/admin/media"));
    const data = await res.json();
    setMedia(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      } else {
        lastError = result.message;
      }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <LabelledUpload onChange={handleUpload} uploading={uploading} />
      </div>
      {loading ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {media.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect?.(m)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-50 transition hover:ring-2 hover:ring-stone-400"
            >
              <MediaThumb path={m.path} webpPath={m.webpPath} mime={m.mime} filename={m.filename} alt={m.alt ?? ""} sizes="150px" />
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white opacity-0 group-hover:opacity-100">
                {m.filename}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LabelledUpload({
  onChange,
  uploading,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-stone-300 px-4 py-2 text-xs hover:bg-stone-50">
      <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
      {uploading ? "Uploading..." : "Upload image or PDF"}
      <input
        type="file"
        accept="image/*,application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={onChange}
        disabled={uploading}
      />
    </label>
  );
}
