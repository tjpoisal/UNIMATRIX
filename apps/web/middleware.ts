import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/",
  "/pricing",
  "/api/auth",
  "/api/webhooks",
  "/api/mcp",
  "/api/openapi.json",
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((pattern) => {
    return pathname === pattern || pathname.startsWith(pattern + "/") || pathname.startsWith(pattern + "?");
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // NextAuth session cookie (works in both dev and prod)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.ico).*)",
  ],
};
