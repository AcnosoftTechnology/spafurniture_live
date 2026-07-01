import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

const publicAdminPaths = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

function normalizePath(pathname: string) {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function withPathname(response: NextResponse, pathname: string) {
  response.headers.set("x-pathname", pathname);
  return response;
}

export default auth((req) => {
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
