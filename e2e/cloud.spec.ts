import { expect, type BrowserContext, type Page, test } from "@playwright/test";
import { promptEditor, setPrompt } from "./prompt-helpers";

/**
 * Cloud mode end to end: the Kie.ai key lives only in the browser, Kie.ai is called straight from the page
 * (mock on 3199), and history is mirrored to Studio's /api/cloud/* (Turso file DB). Port 3101, see playwright.config.ts.
 * `E2E_KEY` is a fake test value, never a real key.
 */

const MOCK = "http://127.0.0.1:3199";
const ORIGIN = "http://localhost:3101";
const E2E_KEY = "e2e-mock-key";
const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

type Call = { type: string; bytes?: number; body?: unknown };
const calls = async (page: Page): Promise<Call[]> => (await page.request.get(`${MOCK}/__calls`)).json();
// The mock is shared with the local project, so a late call from an earlier test can land here: match on the prompt.
const createCalls = async (page: Page, prompt: string) => (await calls(page)).filter((c) => c.type === "createTask" && JSON.stringify(c.body).includes(prompt));

/** Every way the key could appear in a request to Studio: plain, URL-encoded, base64 (also of the Bearer form). */
const KEY_FORMS = [E2E_KEY, encodeURIComponent(E2E_KEY), Buffer.from(E2E_KEY).toString("base64"), Buffer.from(`Bearer ${E2E_KEY}`).toString("base64")];

interface Seen {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  bodyBytes: number;
}

/** Records every request to Studio's own origin (all pages and workers of the context): URL, all headers, body bytes. */
function spyOnStudio(context: BrowserContext) {
  const seen: Seen[] = [];
  const pending: Promise<void>[] = [];
  context.on("request", (request) => {
    if (!request.url().startsWith(ORIGIN)) return;
    pending.push(
      (async () => {
        const buf = request.postDataBuffer();
        seen.push({
          url: request.url(),
          method: request.method(),
          headers: await request.allHeaders().catch(() => request.headers()),
          // latin1 keeps every byte visible to a substring search, whatever the encoding.
          body: buf ? buf.toString("latin1") : "",
          bodyBytes: buf?.length ?? 0,
        });
      })(),
    );
  });
  return {
    seen,
    done: async () => {
      await Promise.all(pending);
      return seen;
    },
  };
}

async function connectKey(page: Page, key = E2E_KEY) {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect API key" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("API key").fill(key);
  await dialog.getByRole("button", { name: "Connect API key" }).click();
  // Onboarding unmounts as soon as the key is stored, taking the dialog with it; the account pill shows the balance.
  await expect(page.getByRole("button", { name: "Credits and API key" })).toContainText("1 000", { timeout: 20_000 });
  await expect(dialog).toHaveCount(0);
}

/** Types a prompt on a generation page (Image default is Z-Image, which the mock always finishes) and presses Generate. */
async function generateImage(page: Page, text: string, path = "/image") {
  await page.goto(path);
  await setPrompt(promptEditor(page), text);
  await page.getByRole("button", { name: /^Generate/ }).click();
  const pay = page.getByRole("button", { name: "Generate and pay" });
  if (await pay.isVisible({ timeout: 1500 }).catch(() => false)) await pay.click();
}

const results = (page: Page) => page.getByRole("button", { name: /^Open .* result$/ });

test.beforeEach(async ({ page }) => {
  await page.request.post(`${MOCK}/__reset`);
});

test("key never reaches Studio server", async ({ page, context }) => {
  const spy = spyOnStudio(context);
  await connectKey(page);
  await generateImage(page, "key leak probe: a teapot");
  await expect(results(page).first()).toBeVisible({ timeout: 30_000 });
  // Draft saves use keepalive fetches on page hide; leave the page so they happen too.
  await page.goto("about:blank");
  await page.goto("/library");
  await expect(results(page).first()).toBeVisible({ timeout: 20_000 });
  await page.goto("about:blank");

  const seen = await spy.done();
  expect(seen.length).toBeGreaterThan(0);
  expect(seen.some((s) => s.url.includes("/api/cloud/tasks"))).toBe(true); // history really went to Studio
  expect(seen.some((s) => s.url.includes("/api/cloud/drafts/"))).toBe(true); // and so did draft saves (also on page hide)
  for (const s of seen) {
    const haystack = [s.url, ...Object.entries(s.headers).map(([k, v]) => `${k}: ${v}`), s.body].join("\n");
    for (const form of KEY_FORMS) expect(haystack, `${s.method} ${s.url}`).not.toContain(form);
    expect(s.headers["authorization"], `${s.method} ${s.url}`).toBeUndefined();
    // Anything sent to the server carries only the owner fingerprint, never anything key-shaped.
    if (s.headers["x-studio-owner"]) expect(s.headers["x-studio-owner"]).toMatch(/^[0-9a-f]{32,}$/i);
  }
  // The key did go where it should: Kie.ai (the mock) saw the generation.
  expect(await createCalls(page, "key leak probe")).toHaveLength(1);
});

test("key not stored in plain text", async ({ page }) => {
  await connectKey(page);
  await generateImage(page, "storage probe");
  await expect(results(page).first()).toBeVisible({ timeout: 30_000 });

  const dump = await page.evaluate(async () => {
    const out: string[] = [];
    const latin1 = (b: ArrayBuffer | ArrayBufferView) => {
      const u = b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
      return Array.from(u, (c) => String.fromCharCode(c)).join("");
    };
    const walk = async (v: unknown, depth = 0): Promise<string> => {
      if (v == null || depth > 8) return "";
      if (typeof v === "string") return v;
      if (v instanceof Blob) return `${v.type}${latin1(await v.arrayBuffer())}`;
      if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) return latin1(v as ArrayBuffer);
      if (typeof v === "object") return (await Promise.all(Object.entries(v).map(async ([k, x]) => `${k}=${await walk(x, depth + 1)}`))).join("\n");
      return String(v);
    };
    for (const info of await indexedDB.databases()) {
      if (!info.name) continue;
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(info.name!);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      for (const store of Array.from(db.objectStoreNames)) {
        const tx = db.transaction(store, "readonly");
        const os = tx.objectStore(store);
        const [vals, keys] = await Promise.all([
          new Promise<unknown[]>((res) => { const r = os.getAll(); r.onsuccess = () => res(r.result); }),
          new Promise<unknown[]>((res) => { const r = os.getAllKeys(); r.onsuccess = () => res(r.result); }),
        ]);
        out.push(`[${info.name}/${store}]`, ...(await Promise.all([...keys, ...vals].map((x) => walk(x)))));
      }
      db.close();
    }
    for (const s of [localStorage, sessionStorage]) {
      for (let i = 0; i < s.length; i++) out.push(`${s.key(i)}=${s.getItem(s.key(i)!)}`);
    }
    out.push(document.cookie);
    return { text: out.join("\n"), dbs: (await indexedDB.databases()).map((d) => d.name) };
  });
  expect(dump.dbs).toContain("studio-vault");
  expect(dump.text).toContain("[studio-vault/kv]"); // the vault was really read
  for (const form of KEY_FORMS) expect(dump.text).not.toContain(form);
});

test("history follows the key", async ({ page, browser }) => {
  const unique = `history follows ${Date.now()}`;
  await connectKey(page);
  await generateImage(page, unique);
  await expect(results(page).first()).toBeVisible({ timeout: 30_000 });
  // Wait until the history reached the server.
  await expect(page.getByText("Only on this device")).toHaveCount(0, { timeout: 20_000 });

  const other = await browser.newContext();
  try {
    const page2 = await other.newPage();
    await connectKey(page2);
    await page2.goto("/library");
    await expect(page2.getByAltText(unique).first()).toBeVisible({ timeout: 30_000 });
    await expect(results(page2).first()).toBeVisible();
  } finally {
    await other.close();
  }
});

test("disconnect wipes the key", async ({ page }) => {
  await connectKey(page);
  await page.goto("/image");
  await page.getByRole("button", { name: "Credits and API key" }).click();
  await page.getByRole("button", { name: "Manage API key" }).click();
  await page.getByRole("button", { name: "Disconnect key" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Get started with/ })).toBeVisible({ timeout: 20_000 });
  const stored = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open("studio-vault");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const n = await new Promise<number>((res) => {
      const r = db.transaction("kv").objectStore("kv").count();
      r.onsuccess = () => res(r.result);
    });
    db.close();
    return n;
  });
  expect(stored).toBe(0);
});

test("resumes after reload", async ({ page }) => {
  const unique = `resume probe ${Date.now()}`;
  await connectKey(page);
  // A video task finishes on the mock at its first poll (4 s after submit): reload while it is still pending.
  await generateImage(page, `${unique} #finish`, "/video");
  await expect.poll(async () => (await createCalls(page, unique)).length, { timeout: 15_000 }).toBe(1);
  const finished = page.locator(`video[aria-label^="${unique}"]`);
  await expect(finished).toHaveCount(0);
  await page.reload();
  await expect(finished).toHaveCount(1, { timeout: 40_000 });
  expect(await createCalls(page, unique)).toHaveLength(1);
});

test("server down still generates", async ({ page }) => {
  await connectKey(page);
  await page.route("**/api/cloud/**", (r) => r.abort());
  await generateImage(page, "offline probe");
  await expect(results(page).first()).toBeVisible({ timeout: 30_000 });
  // The badge comes from the next history read.
  await page.reload();
  await expect(results(page).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Only on this device").first()).toBeVisible({ timeout: 15_000 });

  // Server back: reading the history pushes the leftover outbox (the in-page retry timer died with the reload).
  await page.unroute("**/api/cloud/**");
  await expect
    .poll(
      async () => {
        await page.reload();
        await expect(results(page).first()).toBeVisible({ timeout: 20_000 });
        return page.getByText("Only on this device").count();
      },
      { timeout: 45_000, intervals: [1000, 2000, 3000] },
    )
    .toBe(0);
});

test("ambiguous submit not retried", async ({ page }) => {
  const unique = `ambiguous probe ${Date.now()}`;
  await connectKey(page);
  await page.request.get(`${MOCK}/__drop_next_create`);
  await generateImage(page, unique);
  const card = page.locator("article").filter({ hasText: unique });
  await expect(card.getByText("Not confirmed")).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(6000); // longer than the first poll and any retry timer
  expect(await createCalls(page, unique)).toHaveLength(1);
  await page.reload();
  await expect(card.getByText("Not confirmed")).toBeVisible({ timeout: 20_000 });
  expect(await createCalls(page, unique)).toHaveLength(1);
});

test("large reference bypasses Studio server", async ({ page, context }) => {
  const unique = `large ref ${Date.now()}`;
  const spy = spyOnStudio(context);
  await connectKey(page);
  await page.goto("/video");
  await expect(page.getByRole("button", { name: /^Add references\./ })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /^Add references\./ }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("dialog").getByRole("button", { name: "Upload file" }).first().click();
  // A valid PNG header followed by 6 MB of trailing bytes still decodes.
  const big = Buffer.concat([Buffer.from(PNG_1x1, "base64"), Buffer.alloc(6 * 1024 * 1024, 7)]);
  await (await chooser).setFiles({ name: "big.png", mimeType: "image/png", buffer: big });
  await expect(page.getByLabel("Saving")).toHaveCount(0);
  await setPrompt(promptEditor(page), `a slow pan ${unique} #finish`);
  await page.getByRole("button", { name: /^Generate/ }).click();
  const pay = page.getByRole("button", { name: "Generate and pay" });
  if (await pay.isVisible({ timeout: 1500 }).catch(() => false)) await pay.click();

  await expect.poll(async () => (await calls(page)).find((c) => c.type === "upload")?.bytes ?? 0, { timeout: 40_000 }).toBeGreaterThan(5 * 1024 * 1024);
  await expect.poll(async () => (await createCalls(page, unique)).length, { timeout: 30_000 }).toBe(1);
  await page.goto("about:blank");
  const seen = await spy.done();
  expect(seen.length).toBeGreaterThan(0);
  for (const s of seen) expect(s.bodyBytes, `${s.method} ${s.url}`).toBeLessThan(1024 * 1024);
});

test("expiry badge", async ({ page }) => {
  await connectKey(page);
  await page.goto("/library");
  const day = 86_400_000;
  const seed = (id: string, completedAt: number) => ({
    task: {
      id, kieTaskId: `mock_${id}`, modelKey: "z-image", modelId: "z-image/z-image", modelTitle: "Z-Image", family: "market", category: "image",
      operation: "text-to-image", variant: null, input: { prompt: `seeded ${id}` }, state: "success", rawState: "success", tracking: "active",
      progress: null, outputs: [{ url: `${MOCK}/files/out.png`, kind: "image", source: "result", localPath: null }], result: null, error: null,
      estimate: null, creditsBefore: null, creditsAfter: null, creditsConsumed: 0.8, createdAt: completedAt - 60_000, submittedAt: completedAt - 50_000,
      completedAt, deadlineAt: null, lastPolledAt: completedAt, nextPollAt: null, pollAttempts: 1, pollError: null, webhookAt: null,
    },
    idempotencyKey: `seed-${id}`,
    synced: true,
  });
  const now = Date.now();
  await page.evaluate(
    async (rows) => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("studio-local");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const tx = db.transaction("tasks", "readwrite");
      for (const row of rows) tx.objectStore("tasks").put(row);
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    },
    [seed("expired", now - 15 * day), seed("lastday", now - 13.5 * day), seed("fresh", now - 2 * day)],
  );
  await page.reload();
  await expect(page.getByText("File expired")).toHaveCount(1, { timeout: 20_000 });
  await expect(page.getByText("Available 1 more day", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Available 12 more days", { exact: true })).toHaveCount(1);
});

test("a cloud result shows in the library and Explore, and can be picked as a reference", async ({ page }) => {
  await connectKey(page);
  await generateImage(page, `explore probe ${Date.now()}`);
  await expect(results(page).first()).toBeVisible({ timeout: 30_000 });

  await page.goto("/library");
  await expect(results(page).first()).toBeVisible({ timeout: 20_000 });

  await page.goto("/");
  await expect(page.getByText(/Kie\.ai keeps your results for 14 days/)).toBeVisible();
  await expect(page.getByText(/stay on this computer/)).toHaveCount(0);
  await expect(page.getByLabel("Start here").locator(`img[src^="${MOCK}/files/"]`).first()).toBeVisible({ timeout: 20_000 });

  await page.goto("/video");
  await page.getByRole("button", { name: /^Add references\./ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("tab", { name: "Images" }).click();
  await dialog.getByRole("button", { name: /^Z-Image / }).first().click();
  await dialog.getByRole("button", { name: "Add 1 reference" }).click();
  await expect(dialog).toHaveCount(0);
  const attached = page.getByLabel("Attached references");
  await expect(attached.getByText("image_1")).toBeVisible();
  // The Kie.ai link itself is the reference: shown from the mock, no local file involved.
  await expect(attached.locator(`img[src^="${MOCK}/files/"]`).first()).toBeVisible();
});
