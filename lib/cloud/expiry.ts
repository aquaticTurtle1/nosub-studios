import type { TaskRecord } from "@/lib/task-types";

/** Kie.ai keeps generated files for 14 days. */
export const expiresAt = (t: TaskRecord): number => (t.completedAt ?? t.createdAt) + 14 * 86_400_000;
