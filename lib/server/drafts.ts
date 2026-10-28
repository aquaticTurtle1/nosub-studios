import "server-only";
import { db } from "./db";

let ready = false;
function table() {
  if (!ready) {
    db().exec(`CREATE TABLE IF NOT EXISTS drafts (mode TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at INTEGER NOT NULL);`);
    ready = true;
  }
  return db();
}

export function readDraft(mode: string): unknown {
  const r = table().prepare("SELECT json FROM drafts WHERE mode = ?").get(mode) as { json: string } | undefined;
  if (!r) return null;
  try {
    return JSON.parse(r.json);
  } catch {
    return null;
  }
}

export function writeDraft(mode: string, draft: unknown) {
  table()
    .prepare("INSERT INTO drafts (mode, json, updated_at) VALUES (?, ?, ?) ON CONFLICT(mode) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at")
    .run(mode, JSON.stringify(draft), Date.now());
}
