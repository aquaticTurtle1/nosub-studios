import "server-only";
import { createClient, type Client } from "@libsql/client";

let override: Client | null = null;
let shared: Client | null = null;
const migrated = new WeakSet<Client>();

/** Test hook: replace the client (pass null to restore the env-based one). */
export function setCloudDb(c: Client | null) {
  override = c;
}

export function cloudDb(): Client {
  if (override) return override;
  if (!shared) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    shared = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return shared;
}

/** Idempotent schema setup. */
export async function migrate(c: Client): Promise<void> {
  await c.batch(
    [
      `CREATE TABLE IF NOT EXISTS tasks (
        owner TEXT NOT NULL, id TEXT NOT NULL, record_json TEXT NOT NULL,
        created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
        PRIMARY KEY (owner, id))`,
      `CREATE INDEX IF NOT EXISTS tasks_owner_created ON tasks (owner, created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS drafts (
        owner TEXT NOT NULL, mode TEXT NOT NULL, draft_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL, PRIMARY KEY (owner, mode))`,
      `CREATE TABLE IF NOT EXISTS rate (
        bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL)`,
    ],
    "write",
  );
  migrated.add(c);
}

/** Client with the schema guaranteed to exist. */
export async function readyDb(): Promise<Client> {
  const c = cloudDb();
  if (!migrated.has(c)) await migrate(c);
  return c;
}
