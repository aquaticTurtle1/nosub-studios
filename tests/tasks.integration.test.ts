import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * End-to-end task lifecycle against a local mock of the Kie.ai API — no real
 * requests, no credits spent.
 */

const PNG = Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex");
let server: http.Server;
let base = "";
let balance = 100;
const calls: string[] = [];
const states = new Map<string, string[]>();
let createMode: "ok" | "hang" | "reject" = "ok";

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url!, "http://x");
    calls.push(`${req.method} ${url.pathname}`);
    const send = (body: unknown) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
    };
    if (req.headers.authorization !== "Bearer test-key" && !url.pathname.startsWith("/files/")) {
      return send({ code: 401, msg: "Unauthorized" });
    }
    if (url.pathname === "/api/v1/chat/credit") return send({ code: 200, msg: "success", data: balance });
    if (url.pathname === "/api/v1/jobs/createTask") {
      if (createMode === "hang") return; // never answers → client timeout (ambiguous)
      if (createMode === "reject") return send({ code: 422, msg: "prompt is required", data: null });
      const id = `task_${states.size + 1}`;
      states.set(id, ["waiting", "generating", "success"]);
      return send({ code: 200, msg: "success", data: { taskId: id } });
    }
    if (url.pathname === "/api/v1/jobs/recordInfo") {
      const id = url.searchParams.get("taskId")!;
      const seq = states.get(id)!;
      const state = seq.length > 1 ? seq.shift()! : seq[0];
      if (state === "success") balance = 96;
      return send({
        code: 200,
        msg: "success",
        data: {
          taskId: id,
          state,
          resultJson: state === "success" ? JSON.stringify({ resultUrls: [`${base}/files/out.png`] }) : "",
          creditsConsumed: state === "success" ? 4 : null,
          failMsg: state === "fail" ? "nsfw" : "",
          failCode: state === "fail" ? "400" : "",
        },
      });
    }
    if (url.pathname === "/files/out.png") {
      res.setHeader("Content-Type", "image/png");
      return res.end(PNG);
    }
    res.statusCode = 404;
    res.end();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  process.env.KIE_API_BASE_URL = base;
  process.env.KIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "kie-studio-test-"));
});

afterAll(() => server.close());

async function load() {
  vi.resetModules();
  const tasks = await import("@/lib/server/tasks");
  const { getModel } = await import("@/lib/catalog/registry");
  const model = getModel("google/nano-banana")!;
  const estimate = { row: null, credits: 4, basis: "test", ranked: [] };
  return { ...tasks, model, estimate };
}

describe("task lifecycle (mock Kie.ai)", () => {
  it("submits once, polls to success, stores outputs and records credits", async () => {
    const { submitTask, pollTask, model, estimate } = await load();
    const key = crypto.randomUUID();
    const { task } = await submitTask({ model, variant: null, input: { prompt: "cat" }, idempotencyKey: key, estimate, key: "test-key" });
    expect(task.state).toBe("pending");
    expect(task.kieTaskId).toBe("task_1");
    expect(task.creditsBefore).toBe(100);

    // Same idempotency key → same task, no second createTask.
    const again = await submitTask({ model, variant: null, input: { prompt: "cat" }, idempotencyKey: key, estimate, key: "test-key" });
    expect(again.duplicate).toBe(true);
    expect(calls.filter((c) => c.endsWith("/createTask"))).toHaveLength(1);

    // Respects backoff: a non-forced poll right away does not hit the API.
    const before = calls.length;
    await pollTask(task.id, "test-key");
    expect(calls.length).toBe(before);

    let t = await pollTask(task.id, "test-key", { force: true }); // waiting
    expect(t!.state).toBe("pending");
    t = await pollTask(task.id, "test-key", { force: true }); // generating
    expect(t!.state).toBe("running");
    t = await pollTask(task.id, "test-key", { force: true }); // success
    expect(t!.state).toBe("success");
    expect(t!.creditsConsumed).toBe(4);
    expect(t!.creditsAfter).toBe(96);
    expect(t!.outputs).toHaveLength(1);
    expect(t!.outputs[0].localPath).toMatch(/task_1\/01\.png$/);
    const file = path.join(process.env.KIE_DATA_DIR!, "outputs", t!.outputs[0].localPath!);
    expect(fs.readFileSync(file).equals(PNG)).toBe(true);
  });

  it("marks a rejected submit as submit_failed with the body code", async () => {
    createMode = "reject";
    const { submitTask, model, estimate } = await load();
    const { task } = await submitTask({ model, variant: null, input: { prompt: "x" }, idempotencyKey: crypto.randomUUID(), estimate, key: "test-key" });
    expect(task.state).toBe("submit_failed");
    expect(task.error).toMatchObject({ kind: "validation", code: 422 });
    createMode = "ok";
  });

  it("never retries an ambiguous (timed-out) createTask", async () => {
    createMode = "hang";
    const { submitTask, model, estimate } = await load();
    const n = calls.filter((c) => c.endsWith("/createTask")).length;
    const real = globalThis.fetch;
    // Shorten the client timeout for this test only.
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
      real(input, { ...init, signal: String(input).includes("createTask") ? AbortSignal.timeout(300) : init?.signal })) as typeof fetch;
    try {
      const { task } = await submitTask({ model, variant: null, input: { prompt: "x" }, idempotencyKey: crypto.randomUUID(), estimate, key: "test-key" });
      expect(task.state).toBe("submit_unknown");
      expect(task.error?.ambiguous).toBe(true);
      expect(calls.filter((c) => c.endsWith("/createTask")).length).toBe(n + 1);
    } finally {
      globalThis.fetch = real;
      createMode = "ok";
    }
  });

  it("blocks submit when balance is below the estimate", async () => {
    const { submitTask, model } = await load();
    const n = calls.filter((c) => c.endsWith("/createTask")).length;
    const { task } = await submitTask({
      model,
      variant: null,
      input: { prompt: "x" },
      idempotencyKey: crypto.randomUUID(),
      estimate: { row: null, credits: 10_000, basis: "test", ranked: [] },
      key: "test-key",
    });
    expect(task.state).toBe("submit_failed");
    expect(task.error?.kind).toBe("insufficient_credits");
    expect(calls.filter((c) => c.endsWith("/createTask")).length).toBe(n);
  });

  it("stop/resume tracking keeps the task and polling errors do not resubmit", async () => {
    const { submitTask, pollTask, stopTracking, resumeTracking, model, estimate } = await load();
    const { task } = await submitTask({ model, variant: null, input: { prompt: "x" }, idempotencyKey: crypto.randomUUID(), estimate, key: "test-key" });
    expect(stopTracking(task.id)!.tracking).toBe("stopped");
    const n = calls.length;
    expect((await pollTask(task.id, "test-key", { force: true }))!.state).toBe("pending"); // not polled while stopped
    expect(calls.length).toBe(n);
    resumeTracking(task.id);
    const creates = calls.filter((c) => c.endsWith("/createTask")).length;
    const t = await pollTask(task.id, "wrong-key", { force: true }); // 401 while polling
    expect(t!.pollError?.kind).toBe("invalid_key");
    expect(t!.state).toBe("pending");
    expect(calls.filter((c) => c.endsWith("/createTask")).length).toBe(creates);
  });
});
