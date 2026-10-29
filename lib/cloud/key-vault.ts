/**
 * Browser-only vault for the user's Kie.ai API key.
 *
 * The key is persisted only in IndexedDB, AES-GCM encrypted with a
 * non-extractable CryptoKey. It is never put in localStorage, cookies,
 * logs, error messages or network requests. No server-only or node:* imports.
 */

const DB_NAME = "studio-vault";
const STORE = "kv";
const WRAP_ID = "wrap";
const KEY_ID = "key";
const FINGERPRINT_MESSAGE = "kie-studio-history-v1";

interface StoredKey {
  iv: Uint8Array<ArrayBuffer>;
  ct: ArrayBuffer;
}

let memoryKey: string | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error("vault: open failed"));
    req.onblocked = () => reject(new Error("vault: open blocked"));
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("vault: transaction failed"));
    tx.onabort = () => reject(new Error("vault: transaction aborted"));
  });
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error("vault: request failed"));
  });
}

async function wipeStore(db: IDBDatabase): Promise<void> {
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).clear();
  await done(tx);
}

export async function saveKey(
  key: string,
  opts: { remember: boolean },
): Promise<{ remembered: boolean }> {
  memoryKey = key;
  let db: IDBDatabase | null = null;
  try {
    db = await openDb();
    // Always drop any previously stored key first, so unticking "remember"
    // or re-saving never leaves an old key (or wrap key) behind.
    await wipeStore(db);
    if (!opts.remember) return { remembered: false };

    const wrap = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
      "encrypt",
      "decrypt",
    ]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      wrap,
      new TextEncoder().encode(key),
    );
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(wrap, WRAP_ID);
    store.put({ iv, ct } satisfies StoredKey, KEY_ID);
    await done(tx);
    return { remembered: true };
  } catch {
    // Never include the key (or the underlying error) in anything thrown.
    return { remembered: false };
  } finally {
    db?.close();
  }
}

export async function loadKey(): Promise<string | null> {
  if (memoryKey !== null) return memoryKey;
  let db: IDBDatabase | null = null;
  try {
    db = await openDb();
    const store = db.transaction(STORE, "readonly").objectStore(STORE);
    const wrap = (await request(store.get(WRAP_ID))) as CryptoKey | undefined;
    const rec = (await request(store.get(KEY_ID))) as StoredKey | undefined;
    if (!wrap || !rec) return null;
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: rec.iv }, wrap, rec.ct);
    memoryKey = new TextDecoder().decode(pt);
    return memoryKey;
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

export async function clearKey(): Promise<void> {
  memoryKey = null;
  let db: IDBDatabase | null = null;
  try {
    db = await openDb();
    await wipeStore(db);
  } catch {
    // IndexedDB unavailable: nothing persisted, memory already cleared.
  } finally {
    db?.close();
  }
}

/** Lowercase hex HMAC-SHA-256(key = API key bytes, message = fixed label). */
export async function fingerprint(key: string): Promise<string> {
  const enc = new TextEncoder();
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", hmacKey, enc.encode(FINGERPRINT_MESSAGE));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
