import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskRecord } from "@/lib/task-types";

async function freshStore() {
  vi.resetModules();
  return await import("@/lib/cloud/local-store");
}

const task = (id: string, createdAt = 1): TaskRecord => ({ id, createdAt }) as TaskRecord;
const file = (bytes: string, name = "a.png", type = "image/png") => new File([bytes], name, { type });

beforeEach(() => {
  (globalThis as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
});

describe("local-store", () => {
  it("same idempotency key is found", async () => {
    const s = await freshStore();
    await s.putTask(task("t1"), { idempotencyKey: "k1", synced: false });
    expect((await s.findByIdempotency("k1"))?.id).toBe("t1");
    expect(await s.findByIdempotency("nope")).toBeNull();
    expect((await s.getTask("t1"))?.id).toBe("t1");
    expect((await s.listTasks()).map((t) => t.id)).toEqual(["t1"]);
  });

  it("unsynced/markSynced", async () => {
    const s = await freshStore();
    await s.putTask(task("t1"), { idempotencyKey: "k1", synced: false });
    await s.putTask(task("t2"), { idempotencyKey: "k2", synced: true });
    expect((await s.unsynced()).map((t) => t.id)).toEqual(["t1"]);
    await s.markSynced(["t1"]);
    expect(await s.unsynced()).toEqual([]);
  });

  it("same bytes → same upload", async () => {
    const s = await freshStore();
    const a = await s.putUpload(file("hello"));
    const b = await s.putUpload(file("hello", "other.png"));
    const c = await s.putUpload(file("different"));
    expect(b.id).toBe(a.id);
    expect(c.id).not.toBe(a.id);
    expect(a.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).toMatchObject({ kind: "image", size: 5, mime: "image/png", width: null });
    expect(await s.listUploads()).toHaveLength(2);
  });

  it("delete removes blob", async () => {
    const s = await freshStore();
    const a = await s.putUpload(file("hello"));
    expect(await s.getUploadBlob(a.id)).toBeInstanceOf(Blob);
    await s.deleteUpload(a.id);
    expect(await s.getUploadBlob(a.id)).toBeNull();
    expect(await s.listUploads()).toEqual([]);
  });
});
