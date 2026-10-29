import type { TaskRecord } from "@/lib/task-types";

/** Kie.ai keeps generated files for 14 days. */
export const expiresAt = (t: TaskRecord): number => (t.completedAt ?? t.createdAt) + 14 * 86_400_000;

/** Whole days until the file expires, rounded up. 0 or less means expired. */
export const daysLeft = (t: TaskRecord, now: number): number => Math.ceil((expiresAt(t) - now) / 86_400_000);
