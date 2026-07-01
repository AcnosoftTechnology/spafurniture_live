/** Extract a YouTube video ID from common URL formats or a bare 11-char ID. */
export function parseYoutubeVideoId(input: string | null | undefined): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        const id = parts[embedIndex + 1];
        return /^[\w-]{11}$/.test(id) ? id : null;
      }

      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
        const id = parts[shortsIndex + 1];
        return /^[\w-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string, origin?: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (origin) params.set("origin", origin);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
