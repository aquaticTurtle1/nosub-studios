import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // e2e tests run a second dev server with its own build folder (see playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The dev badge overlapped the Generate button.
  devIndicators: false,
  partialPrefetching: true,
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
