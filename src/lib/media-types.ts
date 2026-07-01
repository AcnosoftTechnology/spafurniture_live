export const MEDIA_EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jpe": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".ico": "image/x-icon",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".pdf": "application/pdf",
};

export const ALLOWED_MEDIA_MIME = new Set(Object.values(MEDIA_EXT_TO_MIME));

/** Max upload size for images and PDFs in admin / media library. */
export const MAX_MEDIA_UPLOAD_MB = 50;
export const MAX_MEDIA_UPLOAD_BYTES = MAX_MEDIA_UPLOAD_MB * 1024 * 1024;

export const SUPPORTED_MEDIA_FORMATS =
  "JPG, PNG, WebP, GIF, AVIF, SVG, BMP, TIFF, ICO, HEIC, PDF";
