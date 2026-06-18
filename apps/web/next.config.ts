import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TS errors during Docker build — CI handles strict type checking on every PR
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint key removed: no longer a valid Next.js 16 config option (generates build warning).
  // ESLint is run separately in CI; not via next build.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.clerk.com",
      },
      {
        protocol: "https",
        hostname: "**.github.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
