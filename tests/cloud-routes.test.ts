import { createClient } from "@libsql/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const FP = "a".repeat(64);
const URL_BASE = "http://studio.test";

async function load(mode: "cloud" | "local") {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_STUDIO_MODE", mode);
  vi.stubEnv("CLOUD_OWNER_SECRET", "s1");
  vi.stubEnv("CRON_SECRET", "cron-secret");
  const db = await import("@/lib/cloud/server/db");
  db.setCloudDb(createClient({ url: ":memory:" }));
  return {
    tasks: await import("@/app/api/cloud/tasks/route"),
    drafts: await import("@/app/api/cloud/drafts/[mode]/route"),
    cron: await import("@/app/api/cloud/cron/prune/route"),
    db,
  };
}

const hdr = (extra: Record<string, string> = {}) => ({ "x-studio-owner": FP, origin: URL_BASE, ...extra });
const post = (body: unknown, headers: Record<string, string> = hdr()) =>
  new Request(`${URL_BASE}/api/cloud/tasks`, { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });

afterEach(async () => {
  const db = await import("@/lib/cloud/server/db");
  db.setCloudDb(null);
  vi.unstubAllEnvs();
});

describe("cloud routes", () => {
  it("missing owner -> 400", async () => {
    const m = await load("cloud");
    expect((await m.tasks.GET(new Request(`${URL_BASE}/api/cloud/tasks`))).status).toBe(400);
  });

  it("foreign or missing origin -> 403", async () => {
    const m = await load("cloud");
    expect((await m.tasks.POST(post({ tasks: [] }, hdr({ origin: "http://evil.test" })))).status).toBe(403);
    expect((await m.tasks.POST(post({ tasks: [] }, { "x-studio-owner": FP }))).status).toBe(403);
  });

  it("oversize -> 413", async () => {
    const m = await load("cloud");
    const big = JSON.stringify({ tasks: [{ id: "x", createdAt: 1, pad: "z".repeat(300 * 1024) }] });
    expect((await m.tasks.POST(post(big))).status).toBe(413);
  });

  it("rate limit -> 429", async () => {
    const m = await load("cloud");
    const get = () => m.tasks.GET(new Request(`${URL_BASE}/api/cloud/tasks`, { headers: hdr({ "x-forwarded-for": "9.9.9.9, 1.1.1.1" }) }));
    for (let i = 0; i < 120; i++) expect((await get()).status).toBe(200);
    expect((await get()).status).toBe(429);
  });

  it("saves and lists tasks; rejects bad batches", async () => {
    const m = await load("cloud");
    expect((await m.tasks.POST(post({ tasks: [{ id: "t1", createdAt: 5, category: "image" }] }))).status).toBe(200);
    const r = await m.tasks.GET(new Request(`${URL_BASE}/api/cloud/tasks`, { headers: hdr() }));
    expect((await r.json()).tasks.map((t: { id: string }) => t.id)).toEqual(["t1"]);
    expect((await m.tasks.POST(post({ tasks: [{ createdAt: 1 }] }))).status).toBe(422);
    const many = Array.from({ length: 51 }, (_, i) => ({ id: `i${i}`, createdAt: i }));
    expect((await m.tasks.POST(post({ tasks: many }))).status).toBe(422);
  });

  it("draft round trip and mode validation", async () => {
    const m = await load("cloud");
    const ctx = (mode: string) => ({ params: Promise.resolve({ mode }) }) as never;
    const put = new Request(`${URL_BASE}/api/cloud/drafts/image`, { method: "PUT", headers: hdr(), body: JSON.stringify({ a: 1 }) });
    expect((await m.drafts.PUT(put, ctx("image"))).status).toBe(200);
    const got = await m.drafts.GET(new Request(`${URL_BASE}/x`, { headers: hdr() }), ctx("image"));
    expect((await got.json()).draft).toEqual({ a: 1 });
    expect((await m.drafts.GET(new Request(`${URL_BASE}/x`, { headers: hdr() }), ctx("BAD_MODE"))).status).toBe(422);
  });

  it("cron without secret -> 401, with secret -> 200", async () => {
    const m = await load("cloud");
    expect((await m.cron.GET(new Request(`${URL_BASE}/api/cloud/cron/prune`))).status).toBe(401);
    const ok = await m.cron.GET(new Request(`${URL_BASE}/api/cloud/cron/prune`, { headers: { authorization: "Bearer cron-secret" } }));
    expect(ok.status).toBe(200);
  });

  it("cloud routes 404 in local mode", async () => {
    const m = await load("local");
    expect((await m.tasks.GET(new Request(`${URL_BASE}/api/cloud/tasks`, { headers: hdr() }))).status).toBe(404);
    expect((await m.cron.GET(new Request(`${URL_BASE}/x`, { headers: { authorization: "Bearer cron-secret" } }))).status).toBe(404);
  });

  it("local routes 404 in cloud mode", async () => {
    await load("cloud");
    const key = await import("@/app/api/key/route");
    const credits = await import("@/app/api/credits/route");
    const tasks = await import("@/app/api/tasks/route");
    expect((await key.GET()).status).toBe(404);
    expect((await credits.GET()).status).toBe(404);
    expect((await tasks.GET(new Request(`${URL_BASE}/api/tasks`))).status).toBe(404);
  });

  it("record over 32 KB -> 413; fine under it", async () => {
    const m = await load("cloud");
    const rec = (pad: number) => ({ id: "big", createdAt: 5, pad: "z".repeat(pad) });
    expect((await m.tasks.POST(post({ tasks: [rec(33 * 1024)] }))).status).toBe(413);
    expect((await m.tasks.POST(post({ tasks: [rec(30 * 1024)] }))).status).toBe(200);
  });

  it("createdAt more than a day ahead -> 422; a few hours ahead is accepted", async () => {
    const m = await load("cloud");
    const now = Date.now();
    expect((await m.tasks.POST(post({ tasks: [{ id: "f", createdAt: now + 2 * 86_400_000 }] }))).status).toBe(422);
    expect((await m.tasks.POST(post({ tasks: [{ id: "ok", createdAt: now + 3_600_000 }] }))).status).toBe(200);
  });

  it("per-IP daily cap on new owners; existing owners are not counted", async () => {
    const m = await load("cloud");
    const ip = "7.7.7.7";
    const as = (n: number) => hdr({ "x-forwarded-for": ip, "x-studio-owner": n.toString(16).padStart(64, "0") });
    const push = (n: number) => m.tasks.POST(post({ tasks: [{ id: `t${n}`, createdAt: 1 }] }, as(n)));
    for (let n = 1; n <= 20; n++) expect((await push(n)).status).toBe(200);
    expect((await push(21)).status).toBe(429);
    // owner 1 already has rows: pushing again is fine and does not touch the cap
    expect((await push(1)).status).toBe(200);
    // another IP has its own budget
    const other = await m.tasks.POST(post({ tasks: [{ id: "z", createdAt: 1 }] }, hdr({ "x-forwarded-for": "8.8.8.8", "x-studio-owner": "f".repeat(64) })));
    expect(other.status).toBe(200);
  });
});
