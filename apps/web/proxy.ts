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

// Routes that support both session auth AND API key auth
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
    return pathname === pattern || pathname.startsWith(pattern + "/") || pathname.startsWith(pattern + "?");
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow routes that support API keys to proceed (they handle auth themselves)
  if (supportsApiKeys(pathname)) {
    const authHeader = request.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer umx_")) {
      return NextResponse.next();
    }
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

/**
 * Minimal proxy handler for Next/Turbopack.
 * - Exports a function named `proxy` (required by Next.js).
 * - Avoids importing server-only modules here so Turbopack doesn't trace the whole repo.
 * - Forwards requests to PROXY_TARGET if set, otherwise returns a simple 204.
 */
export async function proxy(request: Request) {
  const target = process.env.PROXY_TARGET;
  if (!target) {
    // No proxy configured — return no-content quickly so builds/tests pass.
    return new Response(null, { status: 204 });
  }

  const url = new URL(request.url);
  const path = url.pathname + url.search;
  const upstream = new URL(path, target).toString();

  const res = await fetch(upstream, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual',
  });

  const headers = new Headers(res.headers);
  return new Response(res.body, { status: res.status, headers });
}
