import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: {
    default: "Unimatrix — One memory. Every AI. Any device.",
    template: "%s | Unimatrix",
  },
  description: "Switch between Claude, ChatGPT, Grok, Gemini, and more — and always pick up where you left off.",
  keywords: ["AI memory", "MCP", "cross-AI memory", "Claude", "ChatGPT", "Grok", "Gemini"],
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  openGraph: {
    title: "Unimatrix — One memory. Every AI. Any device.",
    description: "Your memories follow you across every AI. Connect Claude, ChatGPT, Grok, Gemini and more.",
    siteName: "Unimatrix",
    images: [{ url: "/logo.png", width: 400, height: 480, alt: "Unimatrix" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Unimatrix — One memory. Every AI. Any device.",
    description: "Your memories follow you across every AI.",
    images: ["/logo.png"],
  },
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
        <SpeedInsights />
      </body>
    </html>
  );
}
