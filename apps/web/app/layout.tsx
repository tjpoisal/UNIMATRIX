import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unimatrix — One memory. Every AI. Any device.",
  description: "Switch between Claude, Grok, ChatGPT, and more — and always pick up where you left off.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. Kapture) inject
          attributes into <body> before React hydrates — this suppresses the
          resulting false-positive hydration mismatch warning. */}
      <body
        className="min-h-full flex flex-col bg-[#0A0F1C]"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
