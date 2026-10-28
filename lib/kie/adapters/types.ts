import type { CatalogModel } from "@/lib/catalog/types";

export type TaskState = "pending" | "running" | "success" | "fail";

export interface OutputRef {
  url: string;
  kind: "image" | "video" | "audio" | "file";
  /** JSON key the URL came from (resultUrls, audio_url, …). */
  source: string;
}

export interface NormalizedStatus {
  state: TaskState;
  /** Provider's own state string, kept for transparency. */
  rawState: string;
  outputs: OutputRef[];
  /** Non-URL result payload (lyrics, IDs, detection results…), when present. */
  resultObject?: unknown;
  error?: { code?: string; message: string };
  creditsConsumed?: number;
  progress?: number;
}

export interface SubmitResult {
  taskId: string;
  /** Set when the endpoint is synchronous and the result is already known. */
  immediate?: NormalizedStatus;
}

/** Shared interface for every provider family; the UI never sees family details. */
export interface ProviderAdapter {
  submit(model: CatalogModel, input: Record<string, unknown>, opts: { key: string; callBackUrl?: string }): Promise<SubmitResult>;
  /** null = this family has nothing to poll (synchronous). */
  getStatus(taskId: string, opts: { key: string; model: CatalogModel }): Promise<NormalizedStatus | null>;
}
