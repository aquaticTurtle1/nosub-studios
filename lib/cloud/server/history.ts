import "server-only";
import { createHmac } from "node:crypto";
import type { TaskRecord } from "@/lib/task-types";
import { readyDb } from "./db";

const DAY_MS = 24 * 60 * 60 * 1000;
export const RETENTION_MS = 90 * DAY_MS;
export const OWNER_CAP = 2000;
/** One stored record, serialized. Bigger ones are rejected before they reach the database. */
export const MAX_RECORD_BYTES = 32 * 1024;
/** A client clock may run ahead a little; further than this is rejected. */
export const MAX_FUTURE_MS = DAY_MS;

export function ownerOf(fp: string): string {
  const secret = process.env.CLOUD_OWNER_SECRET;
  if (!secret) throw new Error("CLOUD_OWNER_SECRET is not set");
  return createHmac("sha256", secret).update(fp).digest("hex");
}

export async function saveTasks(owner: string, tasks: TaskRecord[]): Promise<void> {
  if (!tasks.length) return;
  const c = await readyDb();
  const now = Date.now();
  await c.batch(
    tasks.map((t) => ({
      sql: `INSERT INTO tasks (owner, id, record_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(owner, id) DO UPDATE SET record_json = excluded.record_json,
              created_at = excluded.created_at, updated_at = excluded.updated_at`,
      // The client's createdAt cannot sit in the future: that would escape retention and win the 2000 cap.
      args: [owner, t.id, JSON.stringify(t), Math.min(t.createdAt, now), now],
    })),
    "write",
  );
  await trimOwner(owner);
}

export async function listTasks(
  owner: string,
  q: { limit?: number; category?: string; activeOnly?: boolean } = {},
): Promise<TaskRecord[]> {
  const c = await readyDb();
  const where = ["owner = ?"];
  const args: (string | number)[] = [owner];
  if (q.category) {
    where.push("json_extract(record_json, '$.category') = ?");
    args.push(q.category);
  }
  if (q.activeOnly) {
    where.push(
      "json_extract(record_json, '$.tracking') = 'active' AND json_extract(record_json, '$.state') IN ('submitting','pending','running')",
    );
  }
  const limit = Math.max(1, Math.min(Math.floor(q.limit ?? 200), OWNER_CAP));
  args.push(limit);
  const r = await c.execute({
    sql: `SELECT record_json FROM tasks WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ?`,
    args,
  });
  return r.rows.map((row) => JSON.parse(String(row.record_json)) as TaskRecord);
}

export async function getTask(owner: string, id: string): Promise<TaskRecord | null> {
  const c = await readyDb();
  const r = await c.execute({
    sql: "SELECT record_json FROM tasks WHERE owner = ? AND id = ?",
    args: [owner, id],
  });
  return r.rows[0] ? (JSON.parse(String(r.rows[0].record_json)) as TaskRecord) : null;
}

export async function trimOwner(owner: string, cap = OWNER_CAP): Promise<void> {
  const c = await readyDb();
  await c.execute({
    sql: `DELETE FROM tasks WHERE owner = ? AND id NOT IN (
            SELECT id FROM tasks WHERE owner = ? ORDER BY created_at DESC, id DESC LIMIT ?)`,
    args: [owner, owner, cap],
  });
}

export async function prune(now: number): Promise<void> {
  const c = await readyDb();
  const cutoff = now - RETENTION_MS;
  await c.execute({ sql: "DELETE FROM tasks WHERE created_at < ? OR updated_at < ?", args: [cutoff, cutoff] });
  await c.execute({ sql: "DELETE FROM drafts WHERE updated_at < ?", args: [cutoff] });
}

/** True when this owner already has stored history. */
export async function ownerHasTasks(owner: string): Promise<boolean> {
  const c = await readyDb();
  const r = await c.execute({ sql: "SELECT 1 FROM tasks WHERE owner = ? LIMIT 1", args: [owner] });
  return r.rows.length > 0;
}

export async function getDraft(owner: string, mode: string): Promise<unknown | null> {
  const c = await readyDb();
  const r = await c.execute({
    sql: "SELECT draft_json FROM drafts WHERE owner = ? AND mode = ?",
    args: [owner, mode],
  });
  return r.rows[0] ? JSON.parse(String(r.rows[0].draft_json)) : null;
}

export async function putDraft(owner: string, mode: string, draft: unknown): Promise<void> {
  const c = await readyDb();
  await c.execute({
    sql: `INSERT INTO drafts (owner, mode, draft_json, updated_at) VALUES (?, ?, ?, ?)
          ON CONFLICT(owner, mode) DO UPDATE SET draft_json = excluded.draft_json, updated_at = excluded.updated_at`,
    args: [owner, mode, JSON.stringify(draft), Date.now()],
  });
}
