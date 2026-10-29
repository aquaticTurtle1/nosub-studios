import type { NextConfig } from "next";
import { securityHeaders } from "./lib/cloud/security-headers";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // e2e tests run a second dev server with its own build folder (see playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The dev badge overlapped the Generate button.
  devIndicators: false,
  partialPrefetching: true,
  // Cloud mode in production only (CSP included, see lib/cloud/security-headers.ts). Local mode is unchanged.
  async headers() {
    if (process.env.NEXT_PUBLIC_STUDIO_MODE !== "cloud" || process.env.NODE_ENV !== "production") return [];
    return [{ source: "/:path*", headers: securityHeaders() }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
