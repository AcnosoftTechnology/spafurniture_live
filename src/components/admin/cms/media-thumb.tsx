import Image from "next/image";
import { FileText } from "lucide-react";
import { mediaUrl } from "@/lib/utils";

type MediaThumbProps = {
  path: string;
  webpPath?: string | null;
  mime?: string;
  filename?: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
};

export function isPdfMedia(mime?: string, filename?: string, path?: string) {
  return (
    mime === "application/pdf" ||
    (filename?.toLowerCase().endsWith(".pdf") ?? false) ||
    (path?.toLowerCase().endsWith(".pdf") ?? false)
  );
}

export function MediaThumb({ path, webpPath, mime, filename, alt, fill = true, className, sizes }: MediaThumbProps) {
  if (isPdfMedia(mime, filename, path)) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-stone-100 p-2 ${className ?? ""}`}>
        <FileText className="h-8 w-8 text-stone-500" strokeWidth={1.25} />
        <span className="line-clamp-2 text-center text-[9px] leading-tight text-stone-600">{filename ?? "PDF"}</span>
      </div>
    );
  }

  return (
    <Image
      src={mediaUrl(webpPath ?? path)}
      alt={alt ?? filename ?? ""}
      fill={fill}
      className={className ?? "object-cover"}
      sizes={sizes ?? "150px"}
    />
  );
}
