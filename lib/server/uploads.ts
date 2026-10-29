import "server-only";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { UPLOAD_LIMITS, uploadLimitMessage } from "@/lib/upload-limits";
import type { RefKind } from "@/lib/ui/fields";
import type { UploadRecord } from "@/lib/ui/local-ref";
import { DATA_DIR, db } from "./db";

/** Files added as references (drop, picker, paste). Kept locally; sent to Kie.ai only at submit. */
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac",
  "audio/flac": ".flac",
  "audio/ogg": ".ogg",
};

export const typeForExt = (ext: string) => Object.entries(EXT_BY_TYPE).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";

interface Row {
  id: string;
  sha256: string;
  name: string;
  mime: string;
  kind: RefKind;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  file: string;
  created_at: number;
}

let ready = false;
function table() {
  if (!ready) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    db().exec(`
      CREATE TABLE IF NOT EXISTS uploads (
        id         TEXT PRIMARY KEY,
        sha256     TEXT NOT NULL UNIQUE,
        name       TEXT NOT NULL,
        mime       TEXT NOT NULL,
        kind       TEXT NOT NULL,
        size       INTEGER NOT NULL,
        width      INTEGER,
        height     INTEGER,
        duration   REAL,
        file       TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS uploads_created ON uploads(created_at DESC);
    `);
    ready = true;
  }
  return db();
}

const toRecord = (r: Row): UploadRecord => ({
  id: r.id,
  name: r.name,
  mime: r.mime,
  kind: r.kind,
  size: r.size,
  width: r.width,
  height: r.height,
  duration: r.duration,
  createdAt: r.created_at,
});

export class UploadError extends Error {}

const num = (v: FormDataEntryValue | null) => {
  const n = Number(v);
  return v !== null && v !== "" && Number.isFinite(n) && n > 0 ? n : null;
};

/** Saves a file to data/uploads (same bytes twice → the existing entry). */
export async function saveUpload(file: File, probe: { width: FormDataEntryValue | null; height: FormDataEntryValue | null; duration: FormDataEntryValue | null }): Promise<UploadRecord> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new UploadError(`${file.name}: ${file.type || "this file type"} can't be used as a reference.`);
  const kind = file.type.split("/")[0] as RefKind;
  if (file.size === 0) throw new UploadError(`${file.name} is empty.`);
  if (file.size > UPLOAD_LIMITS[kind]) throw new UploadError(uploadLimitMessage(kind));

  const bytes = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const d = table();
  const existing = d.prepare("SELECT * FROM uploads WHERE sha256 = ?").get(sha256) as Row | undefined;
  if (existing && fs.existsSync(path.join(UPLOAD_DIR, existing.file))) return toRecord(existing);
  if (existing) d.prepare("DELETE FROM uploads WHERE id = ?").run(existing.id);

  const id = randomUUID();
  const name = `${id}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), bytes);
  d.prepare(
    `INSERT INTO uploads (id, sha256, name, mime, kind, size, width, height, duration, file, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, sha256, file.name.slice(0, 200), file.type, kind, file.size, num(probe.width), num(probe.height), num(probe.duration), name, Date.now());
  return toRecord(d.prepare("SELECT * FROM uploads WHERE id = ?").get(id) as unknown as Row);
}

export function listUploads(limit = 500): UploadRecord[] {
  const rows = table().prepare("SELECT * FROM uploads ORDER BY created_at DESC LIMIT ?").all(limit) as unknown as Row[];
  return rows.filter((r) => fs.existsSync(path.join(UPLOAD_DIR, r.file))).map(toRecord);
}

export function getUpload(id: string): (UploadRecord & { path: string }) | null {
  const r = table().prepare("SELECT * FROM uploads WHERE id = ?").get(id) as Row | undefined;
  if (!r) return null;
  const full = path.join(UPLOAD_DIR, r.file);
  return fs.existsSync(full) ? { ...toRecord(r), path: full } : null;
}

