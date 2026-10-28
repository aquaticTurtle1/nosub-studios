import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.KIE_DATA_DIR || path.join(process.cwd(), "data"));
export const OUTPUT_DIR = path.join(DATA_DIR, "outputs");

const globalForDb = globalThis as unknown as { __kieDb?: DatabaseSync };

function open(): DatabaseSync {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "studio.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id                TEXT PRIMARY KEY,
      idempotency_key   TEXT NOT NULL UNIQUE,
      kie_task_id       TEXT,
      model_key         TEXT NOT NULL,
      model_id          TEXT NOT NULL,
      model_title       TEXT NOT NULL,
      family            TEXT NOT NULL,
      category          TEXT NOT NULL,
      operation         TEXT NOT NULL,
      variant           TEXT,
      input_json        TEXT NOT NULL,
      state             TEXT NOT NULL,
      raw_state         TEXT,
      tracking          TEXT NOT NULL DEFAULT 'active',
      progress          REAL,
      outputs_json      TEXT NOT NULL DEFAULT '[]',
      result_json       TEXT,
      error_json        TEXT,
      estimate_json     TEXT,
      credits_before    REAL,
      credits_after     REAL,
      credits_consumed  REAL,
      created_at        INTEGER NOT NULL,
      submitted_at      INTEGER,
      completed_at      INTEGER,
      deadline_at       INTEGER,
      last_polled_at    INTEGER,
      next_poll_at      INTEGER,
      poll_attempts     INTEGER NOT NULL DEFAULT 0,
      poll_error        TEXT,
      webhook_at        INTEGER
    );
    CREATE INDEX IF NOT EXISTS tasks_created ON tasks(created_at DESC);
    CREATE INDEX IF NOT EXISTS tasks_kie ON tasks(kie_task_id);
  `);
  return db;
}

export function db(): DatabaseSync {
  globalForDb.__kieDb ??= open();
  return globalForDb.__kieDb;
}
