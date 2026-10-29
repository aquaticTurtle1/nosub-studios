/**
 * Browser-side polling of Kie.ai (mirrors lib/server/tasks.ts pollTask/applyStatus,
 * but outputs stay Kie URLs: localPath is always null). Browser-only.
 */
import { getModel } from "@/lib/catalog/registry";
import { backoffMs } from "@/lib/generation/timing";
import { adapterFor } from "@/lib/kie/adapters";
import type { NormalizedStatus } from "@/lib/kie/adapters/types";
import { getCredits } from "@/lib/kie/client";
import { KieError, serializeError } from "@/lib/kie/errors";
import { isTerminal, type TaskRecord } from "@/lib/task-types";

export async function safeCredits(key: string): Promise<number | null> {
  try {
    return await getCredits(key);
  } catch {
    return null;
  }
}

export async function applyStatus(task: TaskRecord, s: NormalizedStatus, key: string): Promise<TaskRecord> {
  const now = Date.now();
  const base = { rawState: s.rawState, progress: s.progress ?? null, lastPolledAt: now, pollError: null };
  if (s.state === "pending" || s.state === "running") {
    return { ...task, ...base, state: s.state, pollAttempts: task.pollAttempts + 1, nextPollAt: now + backoffMs(task.pollAttempts + 1) };
  }
  const creditsAfter = await safeCredits(key);
  return {
    ...task,
    ...base,
    state: s.state,
    outputs: s.state === "success" ? s.outputs.map((o) => ({ ...o, localPath: null })) : [],
    result: s.resultObject === undefined ? null : s.resultObject,
    error: s.error ? { kind: "generation_failed", label: "Provider reported fail", message: s.error.message, failCode: s.error.code, ambiguous: false, code: undefined } : null,
    creditsConsumed: s.creditsConsumed ?? null,
    creditsAfter,
    completedAt: now,
    nextPollAt: null,
  };
}

const inflight = new Map<string, Promise<TaskRecord>>();

/**
 * Polls Kie.ai for one task if it is due. Network errors only reschedule the poll.
 * Returns the (possibly updated) record; the caller persists it.
 */
export function pollIfDue(task: TaskRecord, key: string, opts: { force?: boolean } = {}): Promise<TaskRecord> {
  if (isTerminal(task.state) || task.tracking !== "active" || !task.kieTaskId) return Promise.resolve(task);
  const now = Date.now();
  if (!opts.force && task.nextPollAt && now < task.nextPollAt) return Promise.resolve(task);
  if (task.deadlineAt && now > task.deadlineAt) return Promise.resolve({ ...task, tracking: "timed_out" });
  const running = inflight.get(task.id);
  if (running) return running;

  const model = getModel(task.modelKey);
  const p = (async () => {
    try {
      if (!model) throw new KieError("not_found", `Model ${task.modelKey} is no longer in the catalog`);
      const status = await adapterFor(task.family).getStatus(task.kieTaskId!, { key, model });
      return status ? await applyStatus(task, status, key) : task;
    } catch (e) {
      const t = Date.now();
      return { ...task, pollError: serializeError(e), lastPolledAt: t, pollAttempts: task.pollAttempts + 1, nextPollAt: t + backoffMs(task.pollAttempts + 1) };
    }
  })().finally(() => inflight.delete(task.id));
  inflight.set(task.id, p);
  return p;
}
