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
    await s.putTask(task("t1"), { idempotencyKey: "k1", synced: false, owner: "A" });
    expect((await s.findByIdempotency("k1"))?.id).toBe("t1");
    expect(await s.findByIdempotency("nope")).toBeNull();
    expect((await s.getTask("t1", "A"))?.id).toBe("t1");
    expect((await s.listTasks("A")).map((t) => t.id)).toEqual(["t1"]);
  });

  it("unsynced/markSynced", async () => {
    const s = await freshStore();
    await s.putTask(task("t1"), { idempotencyKey: "k1", synced: false, owner: "A" });
    await s.putTask(task("t2"), { idempotencyKey: "k2", synced: true, owner: "A" });
    expect((await s.unsynced("A")).map((t) => t.id)).toEqual(["t1"]);
    await s.markSynced(["t1"]);
    expect(await s.unsynced("A")).toEqual([]);
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

describe("local-store owners", () => {
  it("rows are scoped to their owner", async () => {
    const s = await freshStore();
    await s.putTask(task("a1"), { idempotencyKey: "ka", synced: false, owner: "A" });
    await s.putTask(task("b1"), { idempotencyKey: "kb", synced: false, owner: "B" });
    expect((await s.listTasks("A")).map((t) => t.id)).toEqual(["a1"]);
    expect((await s.unsynced("B")).map((t) => t.id)).toEqual(["b1"]);
    expect(await s.getTask("a1", "B")).toBeNull();
    expect((await s.listTasks("A")).map((t) => t.id)).toEqual(["a1"]);
  });

  it("rows written before owners existed are attributed to the first key that reads them", async () => {
    const s = await freshStore();
    await s.listTasks("A"); // creates the DB
    const db = await new Promise<IDBDatabase>((res) => {
      const r = indexedDB.open("studio-local", 1);
      r.onsuccess = () => res(r.result);
    });
    await new Promise<void>((res) => {
      const tx = db.transaction("tasks", "readwrite");
      tx.objectStore("tasks").put({ task: task("old"), idempotencyKey: "kold", synced: true });
      tx.oncomplete = () => res();
    });
    db.close();
    expect((await s.listTasks("A")).map((t) => t.id)).toEqual(["old"]);
    expect(await s.listTasks("B")).toEqual([]);
  });
});
