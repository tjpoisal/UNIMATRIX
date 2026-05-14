"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    description: "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Link Expired",
    description: "The sign-in link has expired or has already been used.",
  },
  OAuthSignin: {
    title: "OAuth Error",
    description: "There was a problem signing in with your OAuth provider.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "There was a problem during the OAuth callback. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    description:
      "An account with this email already exists using a different sign-in method. Please sign in with the original method.",
  },
  Default: {
    title: "Sign-In Error",
    description: "An unexpected error occurred during sign-in. Please try again.",
  },
};

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const { title, description } =
    errorMessages[error] ?? errorMessages["Default"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-600 font-mono mt-2">
              error: {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
