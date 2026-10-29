import { ApiError } from "@/components/studio/api";
import { probeMedia } from "@/components/app/generation/probe-media";
import type { Category } from "@/lib/catalog/types";
import { expiresAt } from "@/lib/cloud/expiry";
import { clearKey, loadKey, saveKey } from "@/lib/cloud/key-vault";
import * as store from "@/lib/cloud/local-store";
import { mergeTasks } from "@/lib/cloud/merge";
import { applyStatus, pollIfDue, safeCredits } from "@/lib/cloud/poll";
import { scheduleSync, studioFetch } from "@/lib/cloud/sync";
import { prepareGeneration } from "@/lib/generation/prepare";
import { POLL_START_MS, TIMEOUT_MS } from "@/lib/generation/timing";
import { adapterFor } from "@/lib/kie/adapters";
import { getCredits, getDownloadUrl, uploadFile } from "@/lib/kie/client";
import { KieError, serializeError, type SerializedKieError } from "@/lib/kie/errors";
import { isTerminal } from "@/lib/task-types";
import { UPLOAD_LIMITS, uploadLimitMessage } from "@/lib/upload-limits";
import type { RefKind } from "@/lib/ui/fields";
import { collectLocalUris, isLocalUri, parseLocalUri, replaceLocalUris } from "@/lib/ui/local-ref";
import { zip } from "@/lib/zip";
import type { Draft, StudioBackend, TaskRecord, UploadRecord } from "./types";

// Nothing below may ever put the Kie key in a thrown message, a log line, or a request to Studio's own origin.

const apiError = (error: SerializedKieError, status = 0, body: Record<string, unknown> = {}) => new ApiError(error, status, body);

const plainError = (kind: SerializedKieError["kind"], label: string, message: string): SerializedKieError => ({
  kind,
  label,
  message,
  ambiguous: false,
  code: undefined,
});

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  const err = serializeError(e);
  return apiError(err, err.code ?? 0);
}

async function requireKey(): Promise<string> {
  const key = await loadKey();
  if (!key) throw toApiError(new KieError("missing_key", "No Kie.ai API key is connected."));
  return key;
}

// ---- reference previews: object URLs for blobs in IndexedDB ----

const previews = new Map<string, string>();

async function cachePreview(id: string): Promise<boolean> {
  if (previews.has(id)) return true;
  const blob = await store.getUploadBlob(id);
  if (!blob) return false;
  previews.set(id, URL.createObjectURL(blob));
  return true;
}

const extOf = (name: string) => {
  const m = name.match(/\.[a-z0-9]{1,5}$/i);
  return m ? m[0].toLowerCase() : "";
};

// ---- generate ----

type Prepared = {
  model: { key: string; modelId: string; title: string; family: TaskRecord["family"]; category: Category; operation: string };
  variantTitle: string | null;
  input: Record<string, unknown>;
  estimate: TaskRecord["estimate"];
};

function freshTask(p: Prepared): TaskRecord {
  return {
    id: crypto.randomUUID(),
    kieTaskId: null,
    modelKey: p.model.key,
    modelId: p.model.modelId,
    modelTitle: p.model.title,
    family: p.model.family,
    category: p.model.category,
    operation: p.model.operation,
    variant: p.variantTitle,
    input: p.input,
    state: "submitting",
    rawState: null,
    tracking: "active",
    progress: null,
    outputs: [],
    result: null,
    error: null,
    estimate: p.estimate,
    creditsBefore: null,
    creditsAfter: null,
    creditsConsumed: null,
    createdAt: Date.now(),
    submittedAt: null,
    completedAt: null,
    deadlineAt: null,
    lastPolledAt: null,
    nextPollAt: null,
    pollAttempts: 0,
    pollError: null,
    webhookAt: null,
  };
}

const failedTask = (
  t: TaskRecord,
  state: "submit_failed" | "submit_unknown",
  error: SerializedKieError,
  creditsAfter: number | null,
): TaskRecord => ({ ...t, state, error, completedAt: Date.now(), creditsAfter });

/** Uploads every local://upload/ reference straight to Kie.ai; returns the input with Kie URLs. */
async function uploadReferences(input: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
  const uris = [...new Set(collectLocalUris(input))];
  if (!uris.length) return input;
  const records = await store.listUploads();
  const map = new Map<string, string>();
  for (const uri of uris) {
    const src = parseLocalUri(uri);
    const blob = src?.source === "upload" ? await store.getUploadBlob(src.id) : null;
    if (!src || src.source !== "upload" || !blob) {
      throw new KieError("validation", "A reference file is no longer available in this browser. Add it again.");
    }
    const kind = blob.type.split("/")[0];
    const name = records.find((u) => u.id === src.id)?.name ?? "";
    try {
      const res = await uploadFile(key, blob, crypto.randomUUID() + extOf(name), `kie-studio/${kind}`);
      map.set(uri, res.downloadUrl);
    } catch (e) {
      // An upload is not createTask: nothing was submitted, so a failure here is never "unknown".
      const err = serializeError(e);
      throw new KieError(err.kind, err.message, { code: err.code, ambiguous: false });
    }
  }
  return replaceLocalUris(input, map) as Record<string, unknown>;
}

async function generate(body: Parameters<StudioBackend["generate"]>[0]): ReturnType<StudioBackend["generate"]> {
  // 1. key
  const key = await loadKey();
  if (!key) throw toApiError(new KieError("missing_key", "No Kie.ai API key is connected."));
  // 2. validation, prompt serialization, pricing
  const prep = prepareGeneration(body);
  if (!prep.ok) {
    const b = (prep.body ?? {}) as Record<string, unknown>;
    const error = (b.error as SerializedKieError) ?? plainError("server", `HTTP ${prep.status}`, "Request not accepted");
    throw new ApiError(error, prep.status, b);
  }
  // 3. idempotency
  const existing = await store.findByIdempotency(body.idempotencyKey);
  if (existing) return { task: existing, duplicate: true };
  // 4. write the row BEFORE any network call
  let task = freshTask(prep);
  await store.putTask(task, { idempotencyKey: body.idempotencyKey, synced: false });

  // 5. credit check (an unreadable balance never blocks)
  const before = await safeCredits(key);
  task = { ...task, creditsBefore: before };
  if (before !== null && prep.estimate.credits !== null && prep.estimate.credits > before) {
    const err = new KieError("insufficient_credits", `Balance ${before} is below the estimated ${prep.estimate.credits} credits — not submitted.`);
    task = failedTask(task, "submit_failed", err.toJSON(), before);
  } else {
    try {
      // 6. references go straight to Kie.ai
      const input = await uploadReferences(prep.input, key);
      task = { ...task, input };
      // 7. createTask: exactly once, no callback URL, never retried
      const res = await adapterFor(prep.model.family).submit(prep.model, input, { key });
      // 8. accepted
      const t = Date.now();
      task = {
        ...task,
        kieTaskId: res.taskId,
        state: "pending",
        submittedAt: t,
        deadlineAt: t + TIMEOUT_MS[prep.model.category],
        nextPollAt: t + POLL_START_MS,
      };
      if (res.immediate) task = await applyStatus(task, res.immediate, key);
    } catch (e) {
      const err = serializeError(e);
      task = failedTask(task, err.ambiguous ? "submit_unknown" : "submit_failed", err, err.ambiguous ? null : before);
    }
  }
  // 9. persist, then push to the history server in the background
  await store.putTask(task, { idempotencyKey: body.idempotencyKey, synced: false });
  void scheduleSync();
  return { task, duplicate: false };
}

// ---- tasks ----

const isActive = (t: TaskRecord) => t.tracking === "active" && !isTerminal(t.state);

async function remoteTask(id: string): Promise<TaskRecord | null> {
  try {
    const res = await studioFetch(`/api/cloud/tasks/${encodeURIComponent(id)}`);
    if (!res?.ok) return null;
    return ((await res.json()) as { task: TaskRecord }).task;
  } catch {
    return null;
  }
}

async function save(t: TaskRecord): Promise<TaskRecord> {
  await store.updateTask(t, { synced: false });
  void scheduleSync();
  return t;
}

async function loadTask(id: string): Promise<TaskRecord> {
  const t = (await store.getTask(id)) ?? (await remoteTask(id));
  if (!t) throw apiError(plainError("not_found", "Not found (404)", "Task not found"), 404);
  return t;
}

async function pollAndSave(t: TaskRecord, key: string | null, force = false): Promise<TaskRecord> {
  if (!key) return t;
  const next = await pollIfDue(t, key, { force });
  return next === t ? t : save(next);
}

const draftPath = (mode: string) => `/api/cloud/drafts/${encodeURIComponent(mode)}`;

export const cloudBackend: StudioBackend = {
  key: {
    async status() {
      return { configured: !!(await loadKey()), source: "browser" };
    },
    async connect(key, opts) {
      const { remembered } = await saveKey(key, opts);
      try {
        return { balance: await getCredits(key), remembered };
      } catch (e) {
        throw toApiError(e);
      }
    },
    disconnect: () => clearKey(),
  },
  async credits() {
    const key = await requireKey();
    try {
      return { balance: await getCredits(key), checkedAt: Date.now() };
    } catch (e) {
      throw toApiError(e);
    }
  },
  tasks: {
    async list(q) {
      const local = await store.listTasks();
      let remote: TaskRecord[] = [];
      try {
        const qs = new URLSearchParams({ limit: String(q.limit ?? 200) });
        if (q.category) qs.set("category", q.category);
        if (q.activeOnly) qs.set("active", "1");
        const res = await studioFetch(`/api/cloud/tasks?${qs}`);
        if (res?.ok) {
          const tasks = ((await res.json()) as { tasks?: TaskRecord[] }).tasks;
          if (Array.isArray(tasks)) remote = tasks;
        }
      } catch {
        // server down: local history only
      }
      return mergeTasks(local, remote)
        .filter((t) => (!q.category || t.category === q.category) && (!q.activeOnly || isActive(t)))
        .slice(0, q.limit ?? 200);
    },
    async get(id) {
      return pollAndSave(await loadTask(id), await loadKey());
    },
    async act(id, action) {
      const t = await loadTask(id);
      if (action === "stop") return save({ ...t, tracking: "stopped" });
      if (action === "resume") {
        const now = Date.now();
        return save({ ...t, tracking: "active", pollAttempts: 0, nextPollAt: now, deadlineAt: now + TIMEOUT_MS[t.category] });
      }
      const key = await requireKey();
      if (action === "poll") return pollAndSave(t, key, true);
      // redownload: fresh temporary links for outputs whose link may have lapsed
      if (t.state !== "success") return t;
      const outputs = await Promise.all(
        t.outputs.map(async (o) => {
          try {
            return { ...o, url: await getDownloadUrl(key, o.url), downloadError: undefined };
          } catch (e) {
            return { ...o, downloadError: serializeError(e).message };
          }
        }),
      );
      return save({ ...t, outputs });
    },
  },
  generate,
  uploads: {
    async save(file) {
      const kind = file.type.split("/")[0] as RefKind;
      if (kind in UPLOAD_LIMITS && file.size > UPLOAD_LIMITS[kind]) {
        throw apiError(plainError("validation", "File too large", uploadLimitMessage(kind)), 413);
      }
      const probe = await probeMedia(file);
      let rec: UploadRecord;
      try {
        rec = await store.putUpload(file, probe);
      } catch (e) {
        throw apiError(plainError("validation", "Can't use this file", e instanceof Error ? e.message : "Unsupported file"), 422);
      }
      await cachePreview(rec.id);
      return rec;
    },
    async list() {
      const all = await store.listUploads();
      await Promise.all(all.map((u) => cachePreview(u.id)));
      return all;
    },
  },
  drafts: {
    async get(mode) {
      const none = { draft: null, dropped: [] as string[] };
      try {
        const res = await studioFetch(draftPath(mode));
        if (!res?.ok) return none;
        const draft = ((await res.json()) as { draft: Draft | null }).draft;
        if (!draft) return none;
        const kept: NonNullable<Draft["refs"]> = [];
        const dropped: string[] = [];
        for (const r of draft.refs ?? []) {
          const src = isLocalUri(r.uri) ? parseLocalUri(r.uri) : null;
          if (src?.source === "upload" && !(await cachePreview(src.id))) dropped.push(r.name);
          else kept.push(r);
        }
        return { draft: { ...draft, refs: kept }, dropped };
      } catch {
        return none;
      }
    },
    async put(mode, draft, opts) {
      try {
        await studioFetch(draftPath(mode), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
          ...(opts?.keepalive ? { keepalive: true } : {}),
        });
      } catch {
        // best effort, like local mode
      }
    },
  },
  previewUrl(uri) {
    const s = parseLocalUri(uri);
    if (!s) return uri;
    return s.source === "upload" ? (previews.get(s.id) ?? "") : "";
  },
  outputUrl: (o) => o.url,
  async downloadZip(taskIds) {
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    const entries: { name: string; data: Uint8Array; date: Date }[] = [];
    for (const id of taskIds) {
      const t = await store.getTask(id);
      if (!t || Date.now() > expiresAt(t)) continue;
      const day = new Date(t.createdAt).toISOString().slice(0, 10);
      for (const [i, o] of t.outputs.entries()) {
        try {
          const res = await fetch(o.url, { cache: "no-store" });
          if (!res.ok) continue;
          entries.push({
            name: `${day}-${slug(t.modelTitle)}-${t.id.slice(0, 8)}/${String(i + 1).padStart(2, "0")}${extOf(new URL(o.url).pathname) || ".bin"}`,
            data: new Uint8Array(await res.arrayBuffer()),
            date: new Date(t.createdAt),
          });
        } catch {
          // expired or unreachable file: skipped
        }
      }
    }
    if (!entries.length) {
      throw apiError(plainError("not_found", "Nothing to download", "No downloadable files for these generations (Kie.ai keeps them 14 days)."), 404);
    }
    const url = URL.createObjectURL(new Blob([zip(entries)], { type: "application/zip" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-${new Date().toISOString().slice(0, 10)}-${entries.length}-files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
