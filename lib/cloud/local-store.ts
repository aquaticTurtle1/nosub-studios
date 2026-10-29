/**
 * Browser-only local store for cloud mode: the task outbox and reference files.
 *
 * Tasks are written here BEFORE Kie.ai is called (so a task is never submitted
 * twice and survives Studio's server being down). References are kept as Blobs
 * because there is no server file storage. The Kie.ai API key is never stored here.
 * No server-only or node:* imports.
 */
import type { TaskRecord } from "@/lib/task-types";
import type { RefKind } from "@/lib/ui/fields";
import type { UploadRecord } from "@/lib/ui/local-ref";

const DB_NAME = "studio-local";
const TASKS = "tasks";
const UPLOADS = "uploads";

interface TaskRow {
  task: TaskRecord;
  idempotencyKey: string;
  synced: boolean;
}

interface UploadRow {
  record: UploadRecord;
  blob: Blob;
  sha256: string;
}

export interface UploadProbe {
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

const KINDS: readonly RefKind[] = ["image", "video", "audio"];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TASKS)) {
        db.createObjectStore(TASKS, { keyPath: "task.id" }).createIndex("idempotencyKey", "idempotencyKey", {
          unique: true,
        });
      }
      if (!db.objectStoreNames.contains(UPLOADS)) {
        db.createObjectStore(UPLOADS, { keyPath: "record.id" }).createIndex("sha256", "sha256", { unique: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error("local-store: open failed"));
    req.onblocked = () => reject(new Error("local-store: open blocked"));
  });
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error("local-store: request failed"));
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("local-store: transaction failed"));
    tx.onabort = () => reject(new Error("local-store: transaction aborted"));
  });
}

/** Opens the DB, runs `fn`, always closes. */
async function withDb<T>(fn: (db: IDBDatabase) => Promise<T>): Promise<T> {
  const db = await openDb();
  try {
    return await fn(db);
  } finally {
    db.close();
  }
}

// ---- tasks ----

export function putTask(t: TaskRecord, o: { idempotencyKey: string; synced: boolean }): Promise<void> {
  return withDb(async (db) => {
    const tx = db.transaction(TASKS, "readwrite");
    tx.objectStore(TASKS).put({ task: t, idempotencyKey: o.idempotencyKey, synced: o.synced } satisfies TaskRow);
    await done(tx);
  });
}

export function getTask(id: string): Promise<TaskRecord | null> {
  return withDb(async (db) => {
    const row = (await request(db.transaction(TASKS).objectStore(TASKS).get(id))) as TaskRow | undefined;
    return row?.task ?? null;
  });
}

export function findByIdempotency(key: string): Promise<TaskRecord | null> {
  return withDb(async (db) => {
    const row = (await request(db.transaction(TASKS).objectStore(TASKS).index("idempotencyKey").get(key))) as
      | TaskRow
      | undefined;
    return row?.task ?? null;
  });
}

async function allRows(): Promise<TaskRow[]> {
  return withDb(async (db) => (await request(db.transaction(TASKS).objectStore(TASKS).getAll())) as TaskRow[]);
}

/** Newest first. */
export async function listTasks(): Promise<TaskRecord[]> {
  return (await allRows()).map((r) => r.task).sort((a, b) => b.createdAt - a.createdAt);
}

/** Tasks not yet confirmed written to the server history. Oldest first. */
export async function unsynced(): Promise<TaskRecord[]> {
  return (await allRows())
    .filter((r) => !r.synced)
    .map((r) => r.task)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function markSynced(ids: string[]): Promise<void> {
  return withDb(async (db) => {
    const tx = db.transaction(TASKS, "readwrite");
    const store = tx.objectStore(TASKS);
    for (const id of ids) {
      const req = store.get(id);
      req.onsuccess = () => {
        const row = req.result as TaskRow | undefined;
        if (row) store.put({ ...row, synced: true });
      };
    }
    await done(tx);
  });
}

// ---- uploads ----

async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const positive = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null);

/** Stores a reference file (same bytes twice → the existing record). */
export async function putUpload(file: File, probe: UploadProbe = {}): Promise<UploadRecord> {
  const kind = file.type.split("/")[0] as RefKind;
  if (!KINDS.includes(kind)) throw new Error(`${file.name}: ${file.type || "this file type"} can't be used as a reference.`);
  if (file.size === 0) throw new Error(`${file.name} is empty.`);
  const sha256 = await sha256Hex(file);

  return withDb(async (db) => {
    const tx = db.transaction(UPLOADS, "readwrite");
    const store = tx.objectStore(UPLOADS);
    const existing = (await request(store.index("sha256").get(sha256))) as UploadRow | undefined;
    if (existing) return existing.record;
    const record: UploadRecord = {
      id: crypto.randomUUID(),
      name: file.name.slice(0, 200),
      mime: file.type,
      kind,
      size: file.size,
      width: positive(probe.width),
      height: positive(probe.height),
      duration: positive(probe.duration),
      createdAt: Date.now(),
    };
    store.put({ record, blob: file, sha256 } satisfies UploadRow);
    await done(tx);
    return record;
  });
}

export function getUploadBlob(id: string): Promise<Blob | null> {
  return withDb(async (db) => {
    const row = (await request(db.transaction(UPLOADS).objectStore(UPLOADS).get(id))) as UploadRow | undefined;
    return row?.blob ?? null;
  });
}

/** Newest first. */
export function listUploads(): Promise<UploadRecord[]> {
  return withDb(async (db) => {
    const rows = (await request(db.transaction(UPLOADS).objectStore(UPLOADS).getAll())) as UploadRow[];
    return rows.map((r) => r.record).sort((a, b) => b.createdAt - a.createdAt);
  });
}

export function deleteUpload(id: string): Promise<void> {
  return withDb(async (db) => {
    const tx = db.transaction(UPLOADS, "readwrite");
    tx.objectStore(UPLOADS).delete(id);
    await done(tx);
  });
}

/** Overwrites a task but keeps its idempotency key (a task from the server history gets a synthetic one). */
export function updateTask(t: TaskRecord, o: { synced: boolean }): Promise<void> {
  return withDb(async (db) => {
    const tx = db.transaction(TASKS, "readwrite");
    const store = tx.objectStore(TASKS);
    const req = store.get(t.id);
    req.onsuccess = () => {
      const row = req.result as TaskRow | undefined;
      store.put({ task: t, idempotencyKey: row?.idempotencyKey ?? `remote:${t.id}`, synced: o.synced } satisfies TaskRow);
    };
    await done(tx);
  });
}
