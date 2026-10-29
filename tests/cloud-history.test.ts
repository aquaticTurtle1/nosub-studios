import { createClient } from "@libsql/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setCloudDb } from "@/lib/cloud/server/db";
import { getTask, listTasks, ownerOf, prune, saveTasks } from "@/lib/cloud/server/history";
import { hit } from "@/lib/cloud/server/rate-limit";
import type { TaskRecord } from "@/lib/task-types";

const DAY = 86_400_000;
const rec = (id: string, createdAt: number, extra: Partial<TaskRecord> = {}) =>
  ({ id, createdAt, category: "image", state: "success", tracking: "stopped", ...extra }) as unknown as TaskRecord;

beforeEach(() => {
  setCloudDb(createClient({ url: ":memory:" }));
  vi.stubEnv("CLOUD_OWNER_SECRET", "s1");
});
afterEach(() => {
  setCloudDb(null);
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("cloud history", () => {
  it("owners are isolated", async () => {
    await saveTasks("a", [rec("x", 1)]);
    await saveTasks("b", [rec("y", 2)]);
    expect((await listTasks("a", {})).map((t) => t.id)).toEqual(["x"]);
    expect(await getTask("a", "y")).toBeNull();
  });

  it("trim keeps newest 2000", async () => {
    const now = Date.now();
    const all = Array.from({ length: 2005 }, (_, i) => rec(`t${i}`, now + i));
    await saveTasks("a", all.slice(0, 1000));
    await saveTasks("a", all.slice(1000));
    const got = await listTasks("a", { limit: 5000 });
    expect(got).toHaveLength(2000);
    expect(got[0].id).toBe("t2004");
    expect(await getTask("a", "t4")).toBeNull();
    expect(await getTask("a", "t5")).not.toBeNull();
  });

  it("prune drops older than 90 days", async () => {
    const now = Date.now();
    await saveTasks("a", [rec("old", now - 91 * DAY), rec("new", now - 89 * DAY)]);
    await prune(now);
    expect((await listTasks("a", {})).map((t) => t.id)).toEqual(["new"]);
  });

  it("upsert replaces by id", async () => {
    await saveTasks("a", [rec("x", 1, { state: "running" })]);
    await saveTasks("a", [rec("x", 1, { state: "success" })]);
    const got = await listTasks("a", {});
    expect(got).toHaveLength(1);
    expect(got[0].state).toBe("success");
  });

  it("ownerOf depends on CLOUD_OWNER_SECRET", () => {
    const a = ownerOf("fp");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    vi.stubEnv("CLOUD_OWNER_SECRET", "s2");
    expect(ownerOf("fp")).not.toBe(a);
    vi.stubEnv("CLOUD_OWNER_SECRET", "");
    expect(() => ownerOf("fp")).toThrow(/CLOUD_OWNER_SECRET/);
  });

  it("rate limit blocks after limit and resets after window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    expect(await hit("k", 2, 1000)).toBe(true);
    expect(await hit("k", 2, 1000)).toBe(true);
    expect(await hit("k", 2, 1000)).toBe(false);
    vi.setSystemTime(1_001_500);
    expect(await hit("k", 2, 1000)).toBe(true);
  });
});
