import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeWebStream } from "node:stream/web";
import { getDownloadUrl } from "@/lib/kie/client";
import type { OutputRef } from "@/lib/kie/adapters/types";
import { OUTPUT_DIR } from "./db";

export interface StoredOutput extends OutputRef {
  /** Path relative to data/outputs, served by /api/files/... */
  localPath: string | null;
  bytes?: number;
  downloadError?: string;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/mp4": ".m4a",
};

function safeName(taskId: string) {
  return taskId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function fetchTo(url: string, dir: string, index: number): Promise<{ file: string; bytes: number }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10 * 60_000), cache: "no-store" });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const urlExt = path.extname(new URL(url).pathname).toLowerCase();
  const ext = /^\.[a-z0-9]{2,5}$/.test(urlExt) ? urlExt : (EXT_BY_TYPE[type] ?? ".bin");
  const file = `${String(index + 1).padStart(2, "0")}${ext}`;
  const target = path.join(dir, file);
  await pipeline(Readable.fromWeb(res.body as unknown as NodeWebStream), fs.createWriteStream(target));
  return { file, bytes: fs.statSync(target).size };
}

/**
 * Downloads every output to data/outputs/<taskId>/ so history survives Kie.ai's
 * 14-day retention. Falls back to /api/v1/common/download-url when a direct fetch fails.
 */
export async function storeOutputs(taskId: string, outputs: OutputRef[], key: string | null): Promise<StoredOutput[]> {
  const dirName = safeName(taskId);
  const dir = path.join(OUTPUT_DIR, dirName);
  fs.mkdirSync(dir, { recursive: true });
  const stored: StoredOutput[] = [];
  for (const [i, o] of outputs.entries()) {
    try {
      const { file, bytes } = await fetchTo(o.url, dir, i);
      stored.push({ ...o, localPath: `${dirName}/${file}`, bytes });
    } catch (direct) {
      try {
        if (!key) throw new Error("no API key for download-url fallback");
        const temp = await getDownloadUrl(key, o.url);
        const { file, bytes } = await fetchTo(temp, dir, i);
        stored.push({ ...o, localPath: `${dirName}/${file}`, bytes });
      } catch (fallback) {
        const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
        stored.push({ ...o, localPath: null, downloadError: `direct: ${msg(direct)}; download-url: ${msg(fallback)}` });
      }
    }
  }
  return stored;
}

/** Resolves a /api/files path inside data/outputs, rejecting traversal. */
export function resolveOutputPath(rel: string): string | null {
  const full = path.resolve(OUTPUT_DIR, rel);
  if (!full.startsWith(OUTPUT_DIR + path.sep)) return null;
  return fs.existsSync(full) && fs.statSync(full).isFile() ? full : null;
}
