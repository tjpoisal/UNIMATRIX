import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Public paths that don't require session auth */
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

/* API routes that allow API-key auth instead of session cookie */
const apiKeySupportedPaths = [
  "/api/palaces",
  "/api/locations",
  "/api/memories",
  "/api/search",
  "/api/export",
  "/api/sync",
  "/api/tools",
  "/api/mcp",
  "/api/collab",
];

function supportsApiKeys(pathname: string): boolean {
  return apiKeySupportedPaths.some((path) =>
    pathname === path || pathname.startsWith(path + "/")
  );
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((pattern) => {
    return (
      pathname === pattern ||
      pathname.startsWith(pattern + "/") ||
      pathname.startsWith(pattern + "?")
    );
  });
}

/* middleware used by Next.js for session redirect logic */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (supportsApiKeys(pathname)) {
    const authHeader = request.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer umx_")) {
      return NextResponse.next();
    }
  }

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

/**
 * Minimal proxy handler required by Next/Turbopack:
 * - Exports a named `proxy` function
 * - Avoids server-only imports so Turbopack won't trace the whole monorepo
 * - Forwards requests to PROXY_TARGET (if configured), otherwise returns 204
 */
export async function proxy(request: Request) {
  const target = process.env.PROXY_TARGET;
  if (!target) {
    return new Response(null, { status: 204 });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const upstream = new URL(path, target).toString();

    const res = await fetch(upstream, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });

    // Mirror upstream headers (create a new Headers to avoid prototype issues)
    const headers = new Headers();
    res.headers.forEach((v, k) => headers.set(k, v));

    return new Response(res.body, { status: res.status, headers });
  } catch (err) {
    // Fail safe for builds / runtime errors
    console.error('proxy error:', err);
    return new Response("proxy error", { status: 502 });
  }
}
