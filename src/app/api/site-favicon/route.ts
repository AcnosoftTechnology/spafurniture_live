import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-settings";
import { readFaviconFile } from "@/lib/favicon";
import { getBaseUrl, mediaUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const site = await getSiteConfig();
  const faviconPath = site.branding.faviconPath?.trim();

  if (!faviconPath) {
    return new NextResponse("Favicon not configured", { status: 404 });
  }

  try {
    const { buffer, contentType } = await readFaviconFile(faviconPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    const fallback = `${getBaseUrl()}${mediaUrl(faviconPath)}`;
    return NextResponse.redirect(fallback, 302);
  }
}
