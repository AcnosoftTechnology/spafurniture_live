import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

const publicAdminPaths = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

/** Legacy .in hosts permanently redirect to the .com site (same path + query). */
const LEGACY_IN_HOSTS = new Set(["spafurniture.in", "www.spafurniture.in"]);
const CANONICAL_COM_ORIGIN = "https://www.spafurniture.com";

function normalizePath(pathname: string) {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function withPathname(response: NextResponse, pathname: string) {
  response.headers.set("x-pathname", pathname);
  return response;
}

function redirectInToCom(req: { headers: Headers; nextUrl: URL }) {
  const host = (req.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
  if (!LEGACY_IN_HOSTS.has(host)) return null;

  const target = new URL(req.nextUrl.pathname + req.nextUrl.search, CANONICAL_COM_ORIGIN);
  return NextResponse.redirect(target, 301);
}

export default auth((req) => {
  const domainRedirect = redirectInToCom(req);
  if (domainRedirect) return domainRedirect;

  const { pathname } = req.nextUrl;
  const normalizedPath = normalizePath(pathname);
  const isPublicAdmin = publicAdminPaths.some((p) => normalizedPath.startsWith(p));
  const isAdminRoute = normalizedPath.startsWith("/admin");
  const isApiAdmin = pathname.startsWith("/api/v1/admin");

  if (isPublicAdmin) {
    if (normalizedPath === "/admin/login" && req.auth) {
      return withPathname(
        NextResponse.redirect(new URL("/admin/dashboard/", req.nextUrl.origin)),
        pathname,
      );
    }
    return withPathname(NextResponse.next(), pathname);
  }

  if (isAdminRoute || isApiAdmin) {
    if (!req.auth) {
      if (isApiAdmin) {
        return withPathname(
          NextResponse.json(
            { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
            { status: 401 },
          ),
          pathname,
        );
      }
      const loginUrl = new URL("/admin/login/", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname.endsWith("/") ? pathname : `${pathname}/`);
      return withPathname(NextResponse.redirect(loginUrl), pathname);
    }
  }

  return withPathname(NextResponse.next(), pathname);
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/|uploads/).*)",
  ],
};
