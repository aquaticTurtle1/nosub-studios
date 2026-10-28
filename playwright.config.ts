import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

/**
 * Browser tests run against their own dev server: separate port, build folder and data
 * folder, and a local mock instead of api.kie.ai, so they never touch your history or spend credits.
 */
const PORT = 3100;
const MOCK = 3199;
export const E2E_DATA = path.resolve(".e2e-data");
// Every run starts from an empty library and history (main process only, before the servers start).
if (!process.env.TEST_WORKER_INDEX) {
  fs.rmSync(E2E_DATA, { recursive: true, force: true });
  // Optional: start from a copy of a real data folder (screenshots with your own media). The source is only read.
  if (process.env.E2E_SEED_FROM) fs.cpSync(path.resolve(process.env.E2E_SEED_FROM), E2E_DATA, { recursive: true });
}

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
  },
  webServer: [
    { command: "node e2e/mock-kie.mjs", url: `http://127.0.0.1:${MOCK}/__calls`, env: { MOCK_KIE_PORT: String(MOCK) }, reuseExistingServer: false },
    {
      command: `pnpm exec next dev --port ${PORT}`,
      url: `http://localhost:${PORT}/video`,
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        KIE_DATA_DIR: E2E_DATA,
        KIE_API_KEY: "e2e-mock-key",
        KIE_API_BASE_URL: `http://127.0.0.1:${MOCK}`,
        KIE_UPLOAD_BASE_URL: `http://127.0.0.1:${MOCK}`,
      },
    },
  ],
});
