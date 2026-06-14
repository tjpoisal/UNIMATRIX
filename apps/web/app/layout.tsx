import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://deployunimatrix.com"),
  title: {
    default: "Unimatrix — One memory. Every AI. Any device.",
    template: "%s | Unimatrix",
  },
  description: "A managed Model Context Protocol server for durable, hierarchical memory. Explicit tool calls. Auditable. Works with Claude Desktop, Cursor, Windsurf, and custom agents.",
  keywords: ["MCP server", "Model Context Protocol", "Claude Desktop memory", "Cursor MCP", "persistent context", "AI infrastructure"],
  alternates: {
    canonical: "https://deployunimatrix.com",
  },
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  openGraph: {
    title: "Unimatrix — MCP Memory Server",
    description: "A managed Model Context Protocol server. Durable, hierarchical memory for Claude Desktop, Cursor, Windsurf, and custom agents. Explicit. Auditable. Self-hostable.",
    siteName: "Unimatrix",
    images: [{ url: "/logo.png", width: 400, height: 480, alt: "Unimatrix" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Unimatrix — MCP Memory Server",
    description: "Durable memory for MCP clients. Explicit control. Self-hostable.",
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
        className="min-h-full flex flex-col bg-bg"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
