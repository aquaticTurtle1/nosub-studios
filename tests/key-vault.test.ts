import { createHmac } from "node:crypto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshVault() {
  vi.resetModules();
  return await import("@/lib/cloud/key-vault");
}

function readRecord(name: string, id: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("studio-vault");
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains("kv")) open.result.createObjectStore("kv");
    };
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const req = open.result.transaction("kv").objectStore("kv").get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}

const KEY = "sk-secret-kie-key-12345";

beforeEach(() => {
  (globalThis as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
});

describe("key vault", () => {
  it("remembered key round-trips", async () => {
    const a = await freshVault();
    expect(await a.saveKey(KEY, { remember: true })).toEqual({ remembered: true });
    const b = await freshVault();
    expect(await b.loadKey()).toBe(KEY);
  });

  it("nothing readable at rest", async () => {
    const a = await freshVault();
    await a.saveKey(KEY, { remember: true });
    const rec = (await readRecord("studio-vault", "key")) as { iv: Uint8Array; ct: ArrayBuffer };
    expect(rec.iv.byteLength).toBe(12);
    const text = Buffer.from(rec.ct).toString("latin1");
    expect(text).not.toContain(KEY);
    const wrap = (await readRecord("studio-vault", "wrap")) as CryptoKey;
    expect(wrap.extractable).toBe(false);
  });

  it("remember:false keeps IndexedDB empty", async () => {
    const a = await freshVault();
    expect(await a.saveKey(KEY, { remember: false })).toEqual({ remembered: false });
    expect(await readRecord("studio-vault", "key")).toBeUndefined();
    expect(await readRecord("studio-vault", "wrap")).toBeUndefined();
    expect(await a.loadKey()).toBe(KEY);
  });

  it("clearKey wipes both records and memory", async () => {
    const a = await freshVault();
    await a.saveKey(KEY, { remember: true });
    await a.clearKey();
    expect(await readRecord("studio-vault", "key")).toBeUndefined();
    expect(await readRecord("studio-vault", "wrap")).toBeUndefined();
    expect(await a.loadKey()).toBeNull();
  });

  it("falls back to memory", async () => {
    (globalThis as { indexedDB: unknown }).indexedDB = {
      open() {
        throw new Error("blocked");
      },
    };
    const a = await freshVault();
    expect(await a.saveKey(KEY, { remember: true })).toEqual({ remembered: false });
    expect(await a.loadKey()).toBe(KEY);
  });

  it("fingerprint is stable and not the key", async () => {
    const a = await freshVault();
    const expected = createHmac("sha256", "test-key").update("kie-studio-history-v1").digest("hex");
    const fp = await a.fingerprint("test-key");
    expect(fp).toBe(expected);
    expect(fp).toMatch(/^[0-9a-f]{64}$/);
    expect(fp).not.toContain("test-key");
  });
});

describe("fingerprint trims the key (I3)", () => {
  it("surrounding whitespace does not change the owner", async () => {
    const { fingerprint } = await import("@/lib/cloud/key-vault");
    expect(await fingerprint(" key-123456\n")).toBe(await fingerprint("key-123456"));
    expect(await fingerprint("key-123456")).not.toBe(await fingerprint("key-123457"));
  });
});
