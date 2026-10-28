import type { CostEstimate } from "@/lib/catalog/pricing";
import type { Category, Family } from "@/lib/catalog/types";
import type { SerializedKieError } from "@/lib/kie/errors";

export type LocalState =
  | "submitting"
  | "pending"
  | "running"
  | "success"
  | "fail"
  /** createTask may or may not have reached Kie.ai — never auto-retried. */
  | "submit_unknown"
  /** createTask was rejected (validation, credits, key…) — nothing was charged. */
  | "submit_failed";

export type Tracking = "active" | "stopped" | "timed_out";

export interface TaskOutput {
  url: string;
  kind: "image" | "video" | "audio" | "file";
  source: string;
  localPath: string | null;
  bytes?: number;
  downloadError?: string;
}

export interface TaskRecord {
  id: string;
  kieTaskId: string | null;
  modelKey: string;
  modelId: string;
  modelTitle: string;
  family: Family;
  category: Category;
  operation: string;
  variant: string | null;
  input: Record<string, unknown>;
  state: LocalState;
  rawState: string | null;
  tracking: Tracking;
  progress: number | null;
  outputs: TaskOutput[];
  result: unknown;
  error: (SerializedKieError & { failCode?: string }) | null;
  estimate: CostEstimate | null;
  creditsBefore: number | null;
  creditsAfter: number | null;
  creditsConsumed: number | null;
  createdAt: number;
  submittedAt: number | null;
  completedAt: number | null;
  deadlineAt: number | null;
  lastPolledAt: number | null;
  nextPollAt: number | null;
  pollAttempts: number;
  pollError: SerializedKieError | null;
  webhookAt: number | null;
}

export const TERMINAL: LocalState[] = ["success", "fail", "submit_unknown", "submit_failed"];

export function isTerminal(s: LocalState) {
  return TERMINAL.includes(s);
}
