/**
 * Pushes the local task outbox to Studio's history API. Browser-only.
 * Every request to Studio carries only the key FINGERPRINT (X-Studio-Owner), never the key.
 */
import { fingerprint, loadKey } from "./key-vault";
import { markSynced, unsynced } from "./local-store";

const BATCH = 50;
const RETRY_MS = 30_000;

/** fetch against Studio's own origin, owner header only. Returns null when there is no key. */
export async function studioFetch(path: string, init: RequestInit = {}): Promise<Response | null> {
  const key = await loadKey();
  if (!key) return null;
  const headers = new Headers(init.headers);
  headers.set("X-Studio-Owner", await fingerprint(key));
  return fetch(path, { ...init, headers, cache: "no-store" });
}

let running: Promise<void> | null = null;
let retry: ReturnType<typeof setTimeout> | null = null;

async function pushAll(): Promise<boolean> {
  const pending = await unsynced();
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const res = await studioFetch("/api/cloud/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: batch }),
    });
    if (!res || !res.ok) return false;
    await markSynced(batch.map((t) => t.id));
  }
  return true;
}

/** Syncs now (one run at a time); on failure tries again in 30 s. The promise resolves when this run ends. */
export function scheduleSync(): Promise<void> {
  if (running) return running;
  if (retry) {
    clearTimeout(retry);
    retry = null;
  }
  running = (async () => {
    let ok = false;
    try {
      ok = await pushAll();
    } catch {
      ok = false;
    }
    if (!ok) retry = setTimeout(() => void scheduleSync(), RETRY_MS);
  })().finally(() => {
    running = null;
  });
  return running;
}
