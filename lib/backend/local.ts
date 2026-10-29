import { api, ApiError, postJson } from "@/components/studio/api";
import { probeMedia } from "@/components/app/generation/probe-media";
import type { SerializedKieError } from "@/lib/kie/errors";
import { previewUrl } from "@/lib/ui/local-ref";
import type { Draft, KeySource, StudioBackend, TaskRecord, UploadRecord } from "./types";

/** Talks to this app's own /api/* routes (the local, self-hosted mode). */
export const localBackend: StudioBackend = {
  key: {
    status: () => api<{ configured: boolean; source: KeySource }>("/api/key"),
    async connect(key) {
      const r = await api<{ valid: boolean; balance?: number; error?: SerializedKieError }>("/api/key", postJson({ key }));
      if (!r.valid) throw new ApiError(r.error!, 200, r as unknown as Record<string, unknown>);
      return { balance: r.balance };
    },
    async disconnect() {
      await api("/api/key", { method: "DELETE" });
    },
  },
  credits: () => api<{ balance: number; checkedAt: number }>("/api/credits"),
  tasks: {
    async list(q) {
      const qs = new URLSearchParams({ limit: String(q.limit ?? 200) });
      if (q.category) qs.set("category", q.category);
      if (q.activeOnly) qs.set("active", "1");
      return (await api<{ tasks: TaskRecord[] }>(`/api/tasks?${qs}`)).tasks;
    },
    async get(id) {
      return (await api<{ task: TaskRecord }>(`/api/tasks/${id}`)).task;
    },
    async act(id, action) {
      return (await api<{ task: TaskRecord }>(`/api/tasks/${id}`, postJson({ action }))).task;
    },
  },
  generate: (body) => api<{ task: TaskRecord; duplicate: boolean }>("/api/generate", postJson(body)),
  uploads: {
    /** Saves a file into the local library (data/uploads); same bytes → same entry. */
    async save(file) {
      const probe = await probeMedia(file);
      const form = new FormData();
      form.append("file", file);
      for (const [k, v] of Object.entries(probe)) if (v !== null) form.append(k, String(v));
      return (await api<{ upload: UploadRecord }>("/api/uploads", { method: "POST", body: form })).upload;
    },
    async list() {
      return (await api<{ uploads: UploadRecord[] }>("/api/uploads")).uploads;
    },
  },
  drafts: {
    get: (mode) => api<{ draft: Draft | null; dropped: string[] }>(`/api/drafts/${mode}`),
    async put(mode, draft, opts) {
      const init: RequestInit = { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) };
      if (opts?.keepalive) init.keepalive = true;
      // Best effort, like before: a failed save is silent.
      await fetch(`/api/drafts/${mode}`, init).catch(() => {});
    },
  },
  previewUrl,
  outputUrl(o, opts) {
    if (!o.localPath) return "";
    return `/api/files/${o.localPath.split("/").map(encodeURIComponent).join("/")}${opts?.download ? "?download" : ""}`;
  },
  async downloadZip(taskIds) {
    const a = document.createElement("a");
    a.href = `/api/library-download?tasks=${taskIds.join(",")}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
};
