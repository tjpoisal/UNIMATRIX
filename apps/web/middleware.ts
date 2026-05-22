import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

const publicPaths = [
  "/auth/*",
  "/",
  "/api/auth/*",
  "/api/webhooks/*",
  "/api/openapi.json",
  "/pricing",
  "/sign-in",
  "/sign-up",
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    return pathname === pattern;
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    // Special handling for root path: redirect authenticated users to dashboard
    if (pathname === "/") {
      const token = request.cookies.get("__session")?.value;
      if (token) {
        try {
          const verified = await clerkClient.verifyToken(token);
          if (verified) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        } catch {
          // Token invalid, continue to root
        }
      }
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = request.cookies.get("__session")?.value;

  if (!token) {
    // No session cookie, redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const verified = await clerkClient.verifyToken(token);
    if (!verified) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Authenticated — allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
