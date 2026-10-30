import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GenerateBody } from "@/lib/generation/prepare";

const KEY = "sk-secret-kie-key-12345";
const A = "https://example.com/first.jpg";
const MODEL = "minimax-h3/image-to-video";
const uuid = () => crypto.randomUUID();

interface Call {
  url: string;
  headers: Record<string, string>;
  body: string | null;
  method: string;
}

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;

let calls: Call[];
let handler: Handler;

const kie = (data: unknown, code = 200) => Response.json({ code, data });
const ownOrigin = (u: string) => u.startsWith("/") || u.startsWith("http://studio.test");

function defaults(over: { balance?: number; createTask?: Handler; studio?: Handler } = {}): Handler {
  return (url, init) => {
    if (ownOrigin(url)) return (over.studio ?? (() => Response.json({ saved: 1 })))(url, init);
    if (url.includes("/chat/credit")) return kie(over.balance ?? 100000);
    if (url.includes("/createTask")) return (over.createTask ?? (() => kie({ taskId: "kie-1" })))(url, init);
    if (url.includes("/file-stream-upload")) return kie({ downloadUrl: "https://tempfile.aiquickdraw.com/up.png" });
    return new Response("nope", { status: 404 });
  };
}

async function load() {
  vi.resetModules();
  (globalThis as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
  vi.doMock("@/components/app/generation/probe-media", () => ({ probeMedia: async () => ({ width: null, height: null, duration: null }) }));
  const vault = await import("@/lib/cloud/key-vault");
  await vault.saveKey(KEY, { remember: false });
  return {
    backend: (await import("@/lib/backend/cloud")).cloudBackend,
    store: await import("@/lib/cloud/local-store"),
    sync: await import("@/lib/cloud/sync"),
    vault,
    owner: await vault.fingerprint(KEY),
  };
}

const body = (over: Partial<GenerateBody> = {}): GenerateBody => ({
  modelKey: MODEL,
  input: { prompt: "a red kite", first_frame_url: A, duration: 15, resolution: "2K" },
  idempotencyKey: uuid(),
  confirmed: true,
  ...over,
});

beforeEach(() => {
  calls = [];
  handler = defaults();
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers: Record<string, string> = {};
    new Headers(init.headers).forEach((v, k) => (headers[k] = v));
    calls.push({ url, headers, body: typeof init.body === "string" ? init.body : null, method: init.method ?? "GET" });
    return handler(url, init);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("cloudBackend", () => {
  it("never sends the key to Studio", async () => {
    const { backend, store, owner } = await load();
    handler = defaults({ studio: (u) => (u.includes("/api/cloud/tasks") && !u.includes("limit") ? Response.json({ saved: 1 }) : Response.json({ tasks: [], draft: null })) });
    const { task } = await backend.generate(body());
    expect(task.state).toBe("pending");
    await backend.tasks.list({});
    await backend.tasks.get(task.id);
    await backend.drafts.put("image", { values: { prompt: "x" } });
    await backend.drafts.get("image");
    await store.listTasks(owner);
    const own = calls.filter((c) => ownOrigin(c.url));
    expect(own.length).toBeGreaterThan(0);
    for (const c of own) {
      expect(c.url).not.toContain(KEY);
      expect(JSON.stringify(c.headers)).not.toContain(KEY);
      expect(c.body ?? "").not.toContain(KEY);
      expect(c.headers["x-studio-owner"]).toMatch(/^[0-9a-f]{64}$/);
      expect(c.headers["authorization"]).toBeUndefined();
    }
    // and the key did go to Kie directly
    expect(calls.some((c) => !ownOrigin(c.url) && c.headers["authorization"] === `Bearer ${KEY}`)).toBe(true);
  });

  it("ambiguous createTask is not retried", async () => {
    const { backend } = await load();
    handler = defaults({
      createTask: () => {
        throw new TypeError("connection reset");
      },
    });
    const { task } = await backend.generate(body());
    expect(task.state).toBe("submit_unknown");
    expect(calls.filter((c) => c.url.includes("/createTask"))).toHaveLength(1);
  });

  it("duplicate idempotency key returns existing task", async () => {
    const { backend } = await load();
    const b = body();
    const first = await backend.generate(b);
    const again = await backend.generate(b);
    expect(first.duplicate).toBe(false);
    expect(again.duplicate).toBe(true);
    expect(again.task.id).toBe(first.task.id);
    expect(calls.filter((c) => c.url.includes("/createTask"))).toHaveLength(1);
  });

  it("server down: generation succeeds, task stays unsynced, syncs later", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { backend, store, sync, owner } = await load();
    handler = defaults({
      studio: () => {
        throw new TypeError("offline");
      },
    });
    const { task } = await backend.generate(body());
    expect(task.state).toBe("pending");
    await sync.scheduleSync();
    expect((await store.unsynced(owner)).map((t) => t.id)).toEqual([task.id]);
    handler = defaults();
    await vi.advanceTimersByTimeAsync(30_000);
    await sync.scheduleSync();
    expect(await store.unsynced(owner)).toEqual([]);
    const post = calls.filter((c) => c.method === "POST" && c.url === "/api/cloud/tasks").at(-1)!;
    expect(JSON.parse(post.body!).tasks[0].id).toBe(task.id);
  });

  it("insufficient credits -> submit_failed, createTask not called", async () => {
    const { backend } = await load();
    handler = defaults({ balance: 0 });
    const { task } = await backend.generate(body());
    expect(task.state).toBe("submit_failed");
    expect(task.error?.kind).toBe("insufficient_credits");
    expect(task.error?.message).toMatch(/^Balance 0 is below the estimated .* credits — not submitted\.$/);
    expect(calls.some((c) => c.url.includes("/createTask"))).toBe(false);
  });

  it("references upload straight to Kie", async () => {
    const { backend } = await load();
    const rec = await backend.uploads.save(new File(["png-bytes"], "a.png", { type: "image/png" }));
    const { task } = await backend.generate(body({ input: { prompt: "a red kite", first_frame_url: `local://upload/${rec.id}`, duration: 15, resolution: "2K" } }));
    expect(task.state).toBe("pending");
    const up = calls.find((c) => c.url.includes("/file-stream-upload"))!;
    expect(up).toBeDefined();
    expect(up.url).not.toMatch(/studio\.test|^\//);
    const create = calls.find((c) => c.url.includes("/createTask"))!;
    expect(create.body).toContain("https://tempfile.aiquickdraw.com/up.png");
    expect(create.body).not.toContain("local://");
    expect(create.body).not.toContain("callBackUrl");
    expect(calls.filter((c) => ownOrigin(c.url) && (c.body ?? "").includes("png-bytes"))).toHaveLength(0);
  });
});

describe("zip", () => {
  it("round-trip: central directory has the right number of entries", async () => {
    const { zip, crc32 } = await import("@/lib/zip");
    const out = zip([
      { name: "a/01.png", data: new TextEncoder().encode("hello") },
      { name: "b/clip.mp4", data: new Uint8Array(1000).fill(7) },
      { name: "c.txt", data: new Uint8Array(0) },
    ]);
    const v = new DataView(out.buffer);
    const end = out.length - 22;
    expect(v.getUint32(end, true)).toBe(0x06054b50);
    expect(v.getUint16(end + 8, true)).toBe(3);
    expect(v.getUint16(end + 10, true)).toBe(3);
    let p = v.getUint32(end + 16, true);
    const names: string[] = [];
    for (let i = 0; i < 3; i++) {
      expect(v.getUint32(p, true)).toBe(0x02014b50);
      const n = v.getUint16(p + 28, true);
      names.push(new TextDecoder().decode(out.subarray(p + 46, p + 46 + n)));
      p += 46 + n;
    }
    expect(names).toEqual(["a/01.png", "b/clip.mp4", "c.txt"]);
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
});

const seed = (over: Record<string, unknown>) =>
  ({
    id: uuid(), kieTaskId: null, modelKey: MODEL, modelId: "m", modelTitle: "Model", family: "market", category: "video", operation: "x",
    variant: null, input: {}, state: "submitting", rawState: null, tracking: "active", progress: null, outputs: [], result: null,
    error: null, estimate: { credits: null }, creditsBefore: null, creditsAfter: null, creditsConsumed: null, createdAt: Date.now(),
    submittedAt: null, completedAt: null, deadlineAt: null, lastPolledAt: null, nextPollAt: null, pollAttempts: 0, pollError: null,
    webhookAt: null, ...over,
  }) as unknown as import("@/lib/task-types").TaskRecord;

describe("interrupted submit (I1)", () => {
  it("submitting older than 2 min without kieTaskId becomes submit_unknown; never resubmitted", async () => {
    const { backend, store, owner } = await load();
    const stuck = seed({ createdAt: Date.now() - 3 * 60_000 });
    const fresh = seed({ createdAt: Date.now() - 30_000 });
    const sent = seed({ createdAt: Date.now() - 3 * 60_000, kieTaskId: "k9", state: "pending" });
    for (const t of [stuck, fresh, sent]) await store.putTask(t, { idempotencyKey: uuid(), synced: true, owner });
    const list = await backend.tasks.list({});
    const by = (id: string) => list.find((t) => t.id === id)!;
    expect(by(stuck.id).state).toBe("submit_unknown");
    expect(by(stuck.id).error?.message).toMatch(/Check your Kie\.ai history before retrying/);
    expect(by(fresh.id).state).toBe("submitting");
    expect(by(sent.id).state).toBe("pending");
    expect((await store.getTask(stuck.id, owner))?.state).toBe("submit_unknown");
    expect(calls.some((c) => c.url.includes("/createTask"))).toBe(false);
    // get() settles it too
    const again = seed({ createdAt: Date.now() - 5 * 60_000 });
    await store.putTask(again, { idempotencyKey: uuid(), synced: true, owner });
    expect((await backend.tasks.get(again.id)).state).toBe("submit_unknown");
  });
});

describe("tasks are scoped to the connected key (I2)", () => {
  it("another key's tasks are neither listed nor synced; reconnecting brings them back", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { backend, vault, sync } = await load();
    handler = defaults({
      studio: (u, init) => {
        if ((init.method ?? "GET") === "POST") throw new TypeError("offline");
        return Response.json({ tasks: [] });
      },
    });
    const { task } = await backend.generate(body()); // key A; stays unsynced (server down)
    expect((await backend.tasks.list({})).map((t) => t.id)).toEqual([task.id]);

    await vault.saveKey("sk-another-key-67890", { remember: false });
    calls.length = 0;
    handler = defaults();
    expect(await backend.tasks.list({})).toEqual([]);
    await sync.scheduleSync();
    await expect(backend.tasks.get(task.id)).rejects.toMatchObject({ status: 404 });
    // A's row may only ever travel under A's own owner header, never under B's.
    const ownerB = await vault.fingerprint("sk-another-key-67890");
    const pushed = calls.filter((c) => c.method === "POST" && c.url === "/api/cloud/tasks");
    expect(pushed.every((c) => c.headers["x-studio-owner"] !== ownerB)).toBe(true);
    expect(pushed.filter((c) => c.headers["x-studio-owner"] === ownerB).flatMap((c) => JSON.parse(c.body!).tasks)).toEqual([]);

    await vault.saveKey(KEY, { remember: false });
    expect((await backend.tasks.list({})).map((t) => t.id)).toEqual([task.id]);
  });
});

describe("key is trimmed (I3)", () => {
  it("' key\\n' and 'key' use the same owner", async () => {
    const { backend, vault } = await load();
    const clean = "sk-test-key-123";
    await backend.key.connect(` ${clean}\n`, { remember: false });
    await backend.tasks.list({});
    const dirty = calls.filter((c) => ownOrigin(c.url)).at(-1)!.headers["x-studio-owner"];
    expect(dirty).toBe(await vault.fingerprint(clean));
    expect(await vault.fingerprint(` ${clean}\n`)).toBe(await vault.fingerprint(clean));
    expect(calls.some((c) => c.headers["authorization"]?.includes("\n"))).toBe(false);
  });
});

describe("cloud zip (I4)", () => {
  const FILE = "https://tempfile.aiquickdraw.com/r/one.png";
  async function zipSetup(over: { direct: (u: string) => Response | Promise<Response>; remoteOutputs?: string[] }) {
    const m = await load();
    const remote = seed({ state: "success", tracking: "stopped", kieTaskId: "k1", outputs: (over.remoteOutputs ?? [FILE]).map((url) => ({ url, localPath: null })) });
    handler = (url, init) => {
      if (url.startsWith("/api/cloud/tasks/")) return Response.json({ task: remote });
      if (url.startsWith("/api/cloud/file")) return new Response("via-proxy");
      if (url.startsWith("https://tempfile.")) return over.direct(url);
      return defaults()(url, init);
    };
    const clicks: string[] = [];
    vi.stubGlobal("document", { createElement: () => ({ click: () => clicks.push("x"), remove() {} }), body: { appendChild() {} } });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x");
    return { ...m, remote, clicks };
  }

  it("includes a task that exists only in server history", async () => {
    const { backend, remote, clicks } = await zipSetup({ direct: () => new Response("png") });
    expect(await backend.downloadZip([remote.id])).toEqual({ skipped: 0 });
    expect(clicks).toHaveLength(1);
  });

  it("retries a network/CORS failure through the file proxy, key-less", async () => {
    const { backend, remote } = await zipSetup({
      direct: () => {
        throw new TypeError("Failed to fetch");
      },
    });
    expect(await backend.downloadZip([remote.id])).toEqual({ skipped: 0 });
    const proxied = calls.find((c) => c.url.startsWith("/api/cloud/file?url="))!;
    expect(decodeURIComponent(proxied.url)).toContain(FILE);
    expect(proxied.headers["x-studio-owner"]).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(proxied)).not.toContain(KEY);
  });

  it("reports skipped files; throws when nothing at all can be had", async () => {
    const two = [FILE, "https://tempfile.aiquickdraw.com/r/two.png"];
    const { backend, remote } = await zipSetup({ direct: (u) => (u.endsWith("two.png") ? new Response("gone", { status: 404 }) : new Response("png")), remoteOutputs: two });
    expect(await backend.downloadZip([remote.id])).toEqual({ skipped: 1 });
    const none = await zipSetup({ direct: () => new Response("gone", { status: 404 }) });
    await expect(none.backend.downloadZip([none.remote.id])).rejects.toMatchObject({ status: 404 });
  });
});
