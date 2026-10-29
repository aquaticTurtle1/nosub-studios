import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

/**
 * Browser tests run against their own dev server: separate port, build folder and data
 * folder, and a local mock instead of api.kie.ai, so they never touch your history or spend credits.
 *
 * Projects:
 *  - local: the default local-mode app (port 3100), every spec except cloud.spec.ts and cloud-prod.spec.ts.
 *  - cloud: cloud mode in dev (port 3101, Turso file DB), cloud.spec.ts.
 *  - cloud-prod: cloud mode from a production build (port 3102), cloud-prod.spec.ts (security headers, CSP).
 * The mock Kie.ai (3199) is shared. Test key values are fake; never put a real key here.
 * `--project=<name>` starts only the servers that project needs (the production build is slow).
 */
const PORT = 3100;
const CLOUD_PORT = 3101;
const CLOUD_PROD_PORT = 3102;
const MOCK = 3199;
export const E2E_DATA = path.resolve(".e2e-data");
// Every run starts from an empty library and history (main process only, before the servers start).
if (!process.env.TEST_WORKER_INDEX) {
  fs.rmSync(E2E_DATA, { recursive: true, force: true });
  fs.mkdirSync(E2E_DATA, { recursive: true }); // the cloud servers keep their Turso file DBs here and cannot create the folder
  // Optional: start from a copy of a real data folder (screenshots with your own media). The source is only read.
  if (process.env.E2E_SEED_FROM) fs.cpSync(path.resolve(process.env.E2E_SEED_FROM), E2E_DATA, { recursive: true });
}

const cloudEnv = {
  NEXT_PUBLIC_STUDIO_MODE: "cloud",
  NEXT_PUBLIC_KIE_API_BASE_URL: `http://127.0.0.1:${MOCK}`,
  NEXT_PUBLIC_KIE_UPLOAD_BASE_URL: `http://127.0.0.1:${MOCK}`,
  TURSO_DATABASE_URL: "file:.e2e-data/cloud.db",
  CLOUD_OWNER_SECRET: "e2e-owner-secret",
  CRON_SECRET: "e2e-cron",
};

const selected = process.argv.flatMap((a, i, all) => (a.startsWith("--project=") ? [a.slice(10)] : a === "--project" ? [all[i + 1]] : []));
const wants = (name: string) => selected.length === 0 || selected.includes(name);

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
  projects: [
    // Anchored to the file name: the worktree folder itself is called kie-ai-studio-cloud.
    { name: "local", testIgnore: /[\\/]cloud(-prod)?\.spec\.ts$/ },
    { name: "cloud", testMatch: /[\\/]cloud\.spec\.ts$/, use: { baseURL: `http://localhost:${CLOUD_PORT}` } },
    { name: "cloud-prod", testMatch: /[\\/]cloud-prod\.spec\.ts$/, use: { baseURL: `http://localhost:${CLOUD_PROD_PORT}` } },
  ],
  webServer: [
    { command: "node e2e/mock-kie.mjs", url: `http://127.0.0.1:${MOCK}/__calls`, env: { MOCK_KIE_PORT: String(MOCK) }, reuseExistingServer: false },
    ...(wants("local")
      ? [
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
        ]
      : []),
    ...(wants("cloud")
      ? [
          {
            command: `pnpm exec next dev --port ${CLOUD_PORT}`,
            url: `http://localhost:${CLOUD_PORT}/`,
            timeout: 180_000,
            reuseExistingServer: false,
            env: { NEXT_DIST_DIR: ".next-e2e-cloud", ...cloudEnv },
          },
        ]
      : []),
    ...(wants("cloud-prod")
      ? [
          {
            command: `pnpm exec next build && pnpm exec next start --port ${CLOUD_PROD_PORT}`,
            url: `http://localhost:${CLOUD_PROD_PORT}/`,
            timeout: 600_000,
            reuseExistingServer: false,
            env: { NEXT_DIST_DIR: ".next-e2e-cloud-prod", ...cloudEnv, TURSO_DATABASE_URL: "file:.e2e-data/cloud-prod.db" },
          },
        ]
      : []),
  ],
});
