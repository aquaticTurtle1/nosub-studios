import "server-only";
import { randomUUID } from "node:crypto";
import type { CostEstimate } from "@/lib/catalog/pricing";
import { getModel } from "@/lib/catalog/registry";
import type { Category, CatalogModel } from "@/lib/catalog/types";
import { adapterFor } from "@/lib/kie/adapters";
import type { NormalizedStatus } from "@/lib/kie/adapters/types";
import { getCredits } from "@/lib/kie/client";
import { KieError, serializeError } from "@/lib/kie/errors";
import { isTerminal, type LocalState, type TaskRecord, type Tracking } from "@/lib/task-types";
import { db } from "./db";
import { storeOutputs } from "./storage";

/** Overall tracking window per category (video tasks can exceed 10 minutes). */
export const TIMEOUT_MS: Record<Category, number> = {
  image: 15 * 60_000,
  audio: 20 * 60_000,
  tools: 20 * 60_000,
  video: 90 * 60_000,
};

const POLL_START_MS = 4_000;
const POLL_CAP_MS = 30_000;

export function backoffMs(attempt: number): number {
  return Math.min(POLL_CAP_MS, Math.round(POLL_START_MS * 1.5 ** attempt));
}

type Row = Record<string, string | number | null>;

const json = <T>(v: string | number | null, fallback: T): T => {
  if (typeof v !== "string") return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
};

function toRecord(r: Row): TaskRecord {
  const n = (v: string | number | null) => (v === null ? null : Number(v));
  return {
    id: String(r.id),
    kieTaskId: (r.kie_task_id as string) ?? null,
    modelKey: String(r.model_key),
    modelId: String(r.model_id),
    modelTitle: String(r.model_title),
    family: r.family as TaskRecord["family"],
    category: r.category as Category,
    operation: String(r.operation),
    variant: (r.variant as string) ?? null,
    input: json(r.input_json, {}),
    state: r.state as LocalState,
    rawState: (r.raw_state as string) ?? null,
    tracking: r.tracking as Tracking,
    progress: n(r.progress),
    outputs: json(r.outputs_json, []),
    result: json(r.result_json, null),
    error: json(r.error_json, null),
    estimate: json(r.estimate_json, null),
    creditsBefore: n(r.credits_before),
    creditsAfter: n(r.credits_after),
    creditsConsumed: n(r.credits_consumed),
    createdAt: Number(r.created_at),
    submittedAt: n(r.submitted_at),
    completedAt: n(r.completed_at),
    deadlineAt: n(r.deadline_at),
    lastPolledAt: n(r.last_polled_at),
    nextPollAt: n(r.next_poll_at),
    pollAttempts: Number(r.poll_attempts ?? 0),
    pollError: json(r.poll_error, null),
    webhookAt: n(r.webhook_at),
  };
}

function update(id: string, fields: Record<string, string | number | null>) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  db()
    .prepare(`UPDATE tasks SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`)
    .run(...keys.map((k) => fields[k]), id);
}

export function getTask(id: string): TaskRecord | null {
  const r = db().prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Row | undefined;
  return r ? toRecord(r) : null;
}

export function findByKieTaskId(kieTaskId: string): TaskRecord | null {
  const r = db().prepare("SELECT * FROM tasks WHERE kie_task_id = ?").get(kieTaskId) as Row | undefined;
  return r ? toRecord(r) : null;
}

export function listTasks(opts: { limit?: number; activeOnly?: boolean; category?: string } = {}): TaskRecord[] {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.activeOnly) where.push("tracking = 'active' AND state IN ('submitting','pending','running')");
  if (opts.category) {
    where.push("category = ?");
    args.push(opts.category);
  }
  const sql = `SELECT * FROM tasks ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT ?`;
  args.push(opts.limit ?? 200);
  return (db().prepare(sql).all(...args) as Row[]).map(toRecord);
}

async function safeCredits(key: string): Promise<number | null> {
  try {
    return await getCredits(key);
  } catch {
    return null;
  }
}

export interface SubmitArgs {
  model: CatalogModel;
  variant: string | null;
  input: Record<string, unknown>;
  idempotencyKey: string;
  estimate: CostEstimate;
  key: string;
  callBackUrl?: string;
}

/**
 * Submits exactly once per idempotency key. The row is written before the
 * network call, so a repeated request with the same key returns the same task.
 */
export async function submitTask(args: SubmitArgs): Promise<{ task: TaskRecord; duplicate: boolean }> {
  const existing = db().prepare("SELECT * FROM tasks WHERE idempotency_key = ?").get(args.idempotencyKey) as Row | undefined;
  if (existing) return { task: toRecord(existing), duplicate: true };

  const id = randomUUID();
  const now = Date.now();
  try {
    db()
      .prepare(
        `INSERT INTO tasks (id, idempotency_key, model_key, model_id, model_title, family, category, operation, variant,
          input_json, state, tracking, estimate_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitting', 'active', ?, ?)`,
      )
      .run(
        id,
        args.idempotencyKey,
        args.model.key,
        args.model.modelId,
        args.model.title,
        args.model.family,
        args.model.category,
        args.model.operation,
        args.variant,
        JSON.stringify(args.input),
        JSON.stringify(args.estimate),
        now,
      );
  } catch (e) {
    // Lost a race with an identical request.
    const again = db().prepare("SELECT * FROM tasks WHERE idempotency_key = ?").get(args.idempotencyKey) as Row | undefined;
    if (again) return { task: toRecord(again), duplicate: true };
    throw e;
  }

  const before = await safeCredits(args.key);
  update(id, { credits_before: before });

  if (before !== null && args.estimate.credits !== null && args.estimate.credits > before) {
    const err = new KieError(
      "insufficient_credits",
      `Balance ${before} is below the estimated ${args.estimate.credits} credits — not submitted.`,
    );
    update(id, { state: "submit_failed", error_json: JSON.stringify(err.toJSON()), completed_at: Date.now(), credits_after: before });
    return { task: getTask(id)!, duplicate: false };
  }

  try {
    const res = await adapterFor(args.model.family).submit(args.model, args.input, {
      key: args.key,
      callBackUrl: args.callBackUrl,
    });
    const t = Date.now();
    update(id, {
      kie_task_id: res.taskId,
      state: "pending",
      submitted_at: t,
      deadline_at: t + TIMEOUT_MS[args.model.category],
      next_poll_at: t + POLL_START_MS,
    });
    if (res.immediate) await applyStatus(getTask(id)!, res.immediate, args.key);
  } catch (e) {
    const err = serializeError(e);
    update(id, {
      state: err.ambiguous ? "submit_unknown" : "submit_failed",
      error_json: JSON.stringify(err),
      completed_at: Date.now(),
      credits_after: err.ambiguous ? null : before,
    });
  }
  return { task: getTask(id)!, duplicate: false };
}

async function applyStatus(task: TaskRecord, s: NormalizedStatus, key: string | null) {
  const now = Date.now();
  const base: Record<string, string | number | null> = {
    raw_state: s.rawState,
    progress: s.progress ?? null,
    last_polled_at: now,
    poll_error: null,
  };
  if (s.state === "pending" || s.state === "running") {
    update(task.id, {
      ...base,
      state: s.state,
      poll_attempts: task.pollAttempts + 1,
      next_poll_at: now + backoffMs(task.pollAttempts + 1),
    });
    return;
  }
  const outputs = s.state === "success" ? await storeOutputs(task.kieTaskId ?? task.id, s.outputs, key) : [];
  const after = key ? await safeCredits(key) : null;
  update(task.id, {
    ...base,
    state: s.state,
    outputs_json: JSON.stringify(outputs),
    result_json: s.resultObject === undefined ? null : JSON.stringify(s.resultObject),
    error_json: s.error
      ? JSON.stringify({ kind: "generation_failed", label: "Provider reported fail", message: s.error.message, failCode: s.error.code })
      : null,
    credits_consumed: s.creditsConsumed ?? null,
    credits_after: after,
    completed_at: now,
    next_poll_at: null,
  });
}

const inflight = new Map<string, Promise<TaskRecord>>();

/**
 * Polls Kie.ai for one task if it is due (server-side backoff, so a chatty client
 * cannot hammer the API). Network errors only reschedule the poll — never resubmit.
 */
export function pollTask(id: string, key: string | null, opts: { force?: boolean } = {}): Promise<TaskRecord | null> {
  const task = getTask(id);
  if (!task) return Promise.resolve(null);
  if (isTerminal(task.state) || task.tracking !== "active" || !task.kieTaskId) return Promise.resolve(task);
  const now = Date.now();
  if (!opts.force && task.nextPollAt && now < task.nextPollAt) return Promise.resolve(task);
  if (task.deadlineAt && now > task.deadlineAt) {
    update(id, { tracking: "timed_out" });
    return Promise.resolve(getTask(id));
  }
  if (!key) return Promise.resolve(task);
  const running = inflight.get(id);
  if (running) return running;

  const model = getModel(task.modelKey);
  const p = (async () => {
    try {
      if (!model) throw new KieError("not_found", `Model ${task.modelKey} is no longer in the catalog`);
      const status = await adapterFor(task.family).getStatus(task.kieTaskId!, { key, model });
      if (status) await applyStatus(task, status, key);
    } catch (e) {
      update(id, {
        poll_error: JSON.stringify(serializeError(e)),
        last_polled_at: Date.now(),
        poll_attempts: task.pollAttempts + 1,
        next_poll_at: Date.now() + backoffMs(task.pollAttempts + 1),
      });
    }
    return getTask(id)!;
  })().finally(() => inflight.delete(id));
  inflight.set(id, p);
  return p;
}

export function stopTracking(id: string): TaskRecord | null {
  update(id, { tracking: "stopped" });
  return getTask(id);
}

export function resumeTracking(id: string): TaskRecord | null {
  const task = getTask(id);
  if (!task) return null;
  const now = Date.now();
  update(id, {
    tracking: "active",
    poll_attempts: 0,
    next_poll_at: now,
    deadline_at: now + TIMEOUT_MS[task.category],
  });
  return getTask(id);
}

/** Re-downloads outputs whose local copy failed (Kie.ai keeps files 14 days). */
export async function retryDownloads(id: string, key: string | null): Promise<TaskRecord | null> {
  const task = getTask(id);
  if (!task || task.state !== "success") return task;
  const missing = task.outputs.filter((o) => !o.localPath);
  if (!missing.length) return task;
  const stored = await storeOutputs(task.kieTaskId ?? task.id, task.outputs, key);
  update(id, { outputs_json: JSON.stringify(stored) });
  return getTask(id);
}

/** A verified webhook arrived: poll right away (recordInfo is the source of truth). */
export function markWebhook(task: TaskRecord) {
  update(task.id, { webhook_at: Date.now(), next_poll_at: Date.now() });
}
