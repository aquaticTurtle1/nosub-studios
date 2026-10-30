import type { GenerateBody } from "@/lib/generation/prepare";
import type { KeySource } from "@/lib/server/key";
import type { TaskOutput, TaskRecord } from "@/lib/task-types";
import type { RefKind } from "@/lib/ui/fields";
import type { UploadRecord } from "@/lib/ui/local-ref";

export type { KeySource, TaskOutput, TaskRecord, UploadRecord };

/** Per-page panel draft (prompt, model, settings, references). */
export interface Draft {
  familyId?: string | null;
  pinned?: boolean;
  modelKey?: string | null;
  variant?: string | null;
  extendMode?: boolean;
  values?: Record<string, unknown>;
  refs?: { uri: string; kind: RefKind; label?: string; name: string; mime: string; size: number; duration?: number | null; target: string | null }[];
}

/**
 * Everything the UI needs from "the server". localBackend talks to this app's /api/*;
 * the cloud backend (later) talks to Kie.ai from the browser.
 * Errors are ApiError (components/studio/api.ts), so the UI handles them the same way.
 */
export interface StudioBackend {
  key: {
    status(): Promise<{ configured: boolean; source: KeySource | "browser" }>;
    /**
     * Saves the key, then checks it. A key that is saved but fails the credit check
     * throws ApiError with the Kie error; on success resolves with the balance.
     */
    connect(key: string, opts: { remember: boolean }): Promise<{ balance?: number; remembered?: boolean }>;
    disconnect(): Promise<void>;
  };
  credits(): Promise<{ balance: number; checkedAt: number }>;
  tasks: {
    list(q: { limit?: number; category?: string; activeOnly?: boolean }): Promise<TaskRecord[]>;
    /** Fresh state; polls Kie if it is time. */
    get(id: string): Promise<TaskRecord>;
    act(id: string, action: "stop" | "resume" | "redownload" | "poll"): Promise<TaskRecord>;
  };
  generate(body: GenerateBody): Promise<{ task: TaskRecord; duplicate: boolean }>;
  uploads: { save(file: File): Promise<UploadRecord>; list(): Promise<UploadRecord[]> };
  drafts: {
    /** `dropped` names references whose file is gone and were left out of the draft. */
    get(mode: string): Promise<{ draft: Draft | null; dropped: string[] }>;
    put(mode: string, draft: Draft, opts?: { keepalive?: boolean }): Promise<void>;
  };
  previewUrl(uri: string): string;
  outputUrl(o: TaskOutput, opts?: { download?: boolean }): string;
  /** Cloud mode reports how many files could not be included (expired or unreachable). */
  downloadZip(taskIds: string[]): Promise<{ skipped: number } | void>;
}

