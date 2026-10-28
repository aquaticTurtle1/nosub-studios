import fs from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectPrompt, promptEditor, setPrompt } from "./prompt-helpers";

/**
 * References on the Video page: drag & drop overlay, the shared add path, limits,
 * draft persistence, the Media library and what is sent at submit. Runs against the
 * isolated e2e server and mock Kie.ai from playwright.config.ts — no credits.
 */

const MOCK = "http://127.0.0.1:3199";
const DATA = path.resolve(".e2e-data");

interface FakeFile {
  name: string;
  type: string;
  b64: string;
}

const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
/** Distinct bytes per call (trailing data after IEND still decodes), so dedupe doesn't merge them. */
const png = (name: string): FakeFile => ({
  name,
  type: "image/png",
  b64: Buffer.concat([Buffer.from(PNG_1x1, "base64"), Buffer.from(`${name}:${Math.random()}`)]).toString("base64"),
});
function wav(name: string): FakeFile {
  const rate = 8000;
  const samples = rate * 2; // 2 s of silence
  const b = Buffer.alloc(44 + samples);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + samples, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate, 28);
  b.writeUInt16LE(1, 32);
  b.writeUInt16LE(8, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples, 40);
  b.fill(128, 44);
  b[44] = Math.floor(Math.random() * 256); // distinct bytes per file
  return { name, type: "audio/wav", b64: b.toString("base64") };
}
const mp4 = (name: string): FakeFile => ({ name, type: "video/mp4", b64: Buffer.from(`fake mp4 ${name} ${Math.random()}`).toString("base64") });

async function transfer(page: Page, files: FakeFile[]) {
  return page.evaluateHandle((list) => {
    const dt = new DataTransfer();
    for (const f of list) {
      const bin = atob(f.b64);
      dt.items.add(new File([Uint8Array.from(bin, (c) => c.charCodeAt(0))], f.name, { type: f.type }));
    }
    return dt;
  }, files);
}

/** What the OS does when files are dragged from Explorer and dropped on `target`. */
async function drop(page: Page, target: Locator, files: FakeFile[]) {
  const dataTransfer = await transfer(page, files);
  await target.dispatchEvent("dragenter", { dataTransfer });
  await target.dispatchEvent("dragover", { dataTransfer });
  await expect(page.getByTestId("drop-overlay")).toBeVisible();
  await target.dispatchEvent("drop", { dataTransfer });
}

const panel = (page: Page) => page.getByRole("complementary", { name: "Generation settings" });
const overlay = (page: Page) => page.getByTestId("drop-overlay");
const zone = (page: Page) => page.getByRole("button", { name: /^Add references\./ });
const thumbs = (page: Page) => page.getByTestId("ref-thumb");
const uploadsCount = async (page: Page) => ((await (await page.request.get("/api/uploads")).json()).uploads as unknown[]).length;

/** The overlay is gone and nothing covers the page: Playwright's hit test must reach the Generate button. */
async function expectClickable(page: Page) {
  await expect(overlay(page)).toHaveCount(0);
  await page.getByRole("button", { name: /^Generate/ }).click({ trial: true, timeout: 2000 });
}

async function openVideo(page: Page) {
  // Fresh draft for every test.
  // Leave the page first: closing it saves its pending draft, which would undo the reset.
  await page.goto("about:blank");
  await page.request.put("/api/drafts/video", { data: {} });
  await page.goto("/video");
  await expect(zone(page)).toBeVisible({ timeout: 30_000 });
}

async function pickFamily(page: Page, name: string, exclude?: RegExp) {
  await page.getByRole("button", { name: /^Model:/ }).click();
  await page.getByPlaceholder("Search models").fill(name);
  const options = page.getByRole("option").filter({ hasText: name });
  await (exclude ? options.filter({ hasNotText: exclude }) : options).first().click();
  await expect(page.getByRole("button", { name: new RegExp(`^Model: ${name.replace(/\./g, "\\.")}\\.`) })).toBeVisible();
}

test.describe("drag overlay never gets stuck", () => {
  test("drop on the References zone", async ({ page }) => {
    await openVideo(page);
    await drop(page, zone(page), [png("zone.png")]);
    await expectClickable(page);
    await expect(thumbs(page)).toHaveCount(1);
  });

  test("drop on the main area: blocked with a hint, nothing attached", async ({ page }) => {
    await openVideo(page);
    await drop(page, page.locator("main"), [png("main.png")]);
    await expectClickable(page);
    await expect(page.getByText("Drop files on the left panel to add them")).toBeVisible();
    await expect(thumbs(page)).toHaveCount(0);
  });

  test("drag in, then out of the window without dropping", async ({ page }) => {
    await openVideo(page);
    const dataTransfer = await transfer(page, [png("leave.png")]);
    await page.locator("main").dispatchEvent("dragenter", { dataTransfer });
    await expect(overlay(page)).toBeVisible();
    // Leaving the window: dragleave with no relatedTarget.
    await page.locator("main").dispatchEvent("dragleave", { dataTransfer });
    await expectClickable(page);
  });

  test("drag in, then Escape", async ({ page }) => {
    await openVideo(page);
    const dataTransfer = await transfer(page, [png("esc.png")]);
    await panel(page).dispatchEvent("dragenter", { dataTransfer });
    await expect(overlay(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expectClickable(page);
  });

  test("safety net: hides 300 ms after the last dragover", async ({ page }) => {
    await openVideo(page);
    const dataTransfer = await transfer(page, [png("idle.png")]);
    await panel(page).dispatchEvent("dragenter", { dataTransfer });
    await expect(overlay(page)).toBeVisible();
    await page.waitForTimeout(450);
    await expectClickable(page);
  });

  test("the overlay covers the left panel only and ignores the pointer", async ({ page }) => {
    await openVideo(page);
    const dataTransfer = await transfer(page, [png("box.png")]);
    await panel(page).dispatchEvent("dragenter", { dataTransfer });
    const o = await overlay(page).boundingBox();
    const p = await panel(page).boundingBox();
    expect(o!.x).toBeGreaterThanOrEqual(p!.x);
    expect(o!.x + o!.width).toBeLessThanOrEqual(p!.x + p!.width);
    expect(await overlay(page).evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    expect(await overlay(page).evaluate((el) => el.closest("button"))).toBeNull();
  });
});

test.describe("adding files", () => {
  test("image, video and audio dropped on the panel (Seedance 2.5)", async ({ page }) => {
    await openVideo(page);
    await pickFamily(page, "Seedance 2.5", /Draft/);
    await expect(zone(page)).toContainText("Images up to 30 · video up to 10 · audio up to 10");
    await drop(page, panel(page), [png("still.png"), mp4("clip.mp4"), wav("voice.wav")]);
    await expectClickable(page);
    await expect(thumbs(page)).toHaveCount(3);
    for (const h of ["image_1", "video_1", "audio_1"]) await expect(panel(page).getByText(h, { exact: true })).toBeVisible();
    await expect(page.getByLabel("Saving")).toHaveCount(0);
    await expect(panel(page).getByText("0:02")).toBeVisible(); // audio duration
  });

  test("wrong type and too many files: a toast, nothing saved", async ({ page }) => {
    await openVideo(page);
    await expect(zone(page)).toContainText("Images up to 7");
    const before = await uploadsCount(page);
    await drop(page, panel(page), [wav("song.wav")]);
    await expect(page.getByText("PixVerse V6 doesn't take audio.")).toBeVisible();
    await drop(page, panel(page), Array.from({ length: 8 }, (_, i) => png(`many-${i}.png`)));
    await expect(page.getByText("PixVerse V6 takes up to 7 images.")).toBeVisible();
    await expectClickable(page);
    await expect(thumbs(page)).toHaveCount(0);
    expect(await uploadsCount(page)).toBe(before);
  });

  test("paste from the clipboard uses the same path", async ({ page }) => {
    await openVideo(page);
    const dt = await transfer(page, [png("pasted.png")]);
    await page.evaluate((clipboardData) => window.dispatchEvent(new ClipboardEvent("paste", { clipboardData })), dt);
    await expect(thumbs(page)).toHaveCount(1);
    await expect(page.getByLabel("Saving")).toHaveCount(0);
  });
});

test.describe("draft survives a reload", () => {
  test("dropped file and file-picker file come back; Clear empties; missing files are dropped", async ({ page }) => {
    await openVideo(page);
    await drop(page, panel(page), [png("dropped.png")]);
    await expect(page.getByLabel("Saving")).toHaveCount(0);

    // File picker path: Media library → Upload file.
    await page.getByRole("button", { name: /^Add more references/ }).click();
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("dialog").getByRole("button", { name: "Upload file" }).first().click();
    const f = png("picked.png");
    await (await chooser).setFiles({ name: f.name, mimeType: f.type, buffer: Buffer.from(f.b64, "base64") });
    await expect(thumbs(page)).toHaveCount(2);
    await expect(page.getByLabel("Saving")).toHaveCount(0);
    await setPrompt(promptEditor(page), "a red kite over the sea");
    await page.waitForTimeout(700); // draft save is debounced

    await page.reload();
    await expect(thumbs(page)).toHaveCount(2, { timeout: 30_000 });
    await expectPrompt(promptEditor(page), "a red kite over the sea", 30_000);
    await expect(page.getByTestId("resolved-model")).toContainText("image-to-video");

    // A file removed from data/uploads is dropped from the draft with a toast.
    const draft = await (await page.request.get("/api/drafts/video")).json();
    const id = (draft.draft.refs[0].uri as string).split("/").pop()!;
    for (const name of fs.readdirSync(path.join(DATA, "uploads"))) if (name.startsWith(id)) fs.rmSync(path.join(DATA, "uploads", name));
    await page.reload();
    await expect(page.getByText("A reference was removed from your draft.")).toBeVisible({ timeout: 30_000 });
    await expect(thumbs(page)).toHaveCount(1);

    await panel(page).getByRole("button", { name: "Clear references" }).click();
    await expect(thumbs(page)).toHaveCount(0);
    await page.waitForTimeout(700);
    await page.reload();
    await expect(zone(page)).toBeVisible({ timeout: 30_000 });
    await expect(thumbs(page)).toHaveCount(0);
  });
});

test.describe("Media library", () => {
  test("tabs, dimmed kinds, numbered selection, add", async ({ page }) => {
    await openVideo(page);
    // Make sure the library has two images and one audio file.
    for (const f of [png("lib-a.png"), png("lib-b.png"), wav("lib-c.wav")]) {
      await page.request.post("/api/uploads", { multipart: { file: { name: f.name, mimeType: f.type, buffer: Buffer.from(f.b64, "base64") } } });
    }
    await zone(page).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Media library" })).toBeVisible();
    await expect(dialog.getByRole("tab")).toHaveText(["Uploads", "Images", "Videos", "Audio"]);
    await expect(dialog.getByRole("button", { name: "Upload file" }).first()).toBeVisible();
    await expect(dialog.getByRole("button", { name: /lib-c\.wav \(PixVerse V6 doesn't take audio\)/ })).toHaveAttribute("aria-disabled", "true");

    await dialog.getByRole("button", { name: "lib-a.png", exact: true }).click();
    await dialog.getByRole("button", { name: "lib-b.png", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "lib-b.png", exact: true })).toContainText("2");
    await dialog.getByRole("button", { name: "Add 2 references" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(thumbs(page)).toHaveCount(2);
    // Library picks are labelled image_1, image_2 (labels used to be picked inside a state updater, which dev runs twice).
    await expect(page.getByLabel("Attached references").getByText(/^image_\d$/)).toHaveText(["image_1", "image_2"]);

    await page.getByRole("button", { name: /^Add more references/ }).click();
    await dialog.getByRole("tab", { name: "Images" }).click();
    // Empty state, or finished images when an earlier spec generated some (mock).
    await expect(dialog.getByText("Images you generate show up here.").or(dialog.getByRole("button", { name: /^Z-Image / }).first())).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });
});

test.describe("what is sent", () => {
  test("a dropped file and a library pick both become the schema's URL field; fresh Kie URLs at submit", async ({ page }) => {
    await page.request.post(`${MOCK}/__reset`);
    await openVideo(page);
    await drop(page, panel(page), [png("sent-drop.png")]);
    await expect(page.getByLabel("Saving")).toHaveCount(0);
    const lib = png("sent-lib.png");
    await page.request.post("/api/uploads", { multipart: { file: { name: lib.name, mimeType: lib.type, buffer: Buffer.from(lib.b64, "base64") } } });
    await page.getByRole("button", { name: /^Add more references/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: "sent-lib.png", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Add 1 reference" }).click();
    await setPrompt(promptEditor(page), "two stills, one motion");

    await page.getByRole("button", { name: "Preview request" }).click();
    const preview = JSON.parse((await page.getByTestId("request-preview").textContent())!);
    expect(preview.model).toBe("pixverse-v6/image-to-video");
    expect(preview.input.image_urls).toHaveLength(2);
    for (const u of preview.input.image_urls) expect(u).toMatch(/^local:\/\/upload\/[0-9a-f-]{36}$/);

    await page.getByRole("button", { name: /^Generate/ }).click();
    // Paid models ask first; against the mock this costs nothing.
    const pay = page.getByRole("button", { name: "Generate and pay" });
    const uploading = page.getByRole("status").filter({ hasText: "Uploading references…" });
    await expect(pay.or(uploading)).toBeVisible();
    if (await pay.isVisible()) await pay.click();
    await expect(uploading).toBeVisible();
    await expect.poll(async () => (await (await page.request.get(`${MOCK}/__calls`)).json()).some((c: { type: string }) => c.type === "createTask"), { timeout: 20_000 }).toBe(true);
    const calls = (await (await page.request.get(`${MOCK}/__calls`)).json()) as { type: string; body?: { input: { image_urls: string[] } } }[];
    expect(calls.filter((c) => c.type === "upload")).toHaveLength(2);
    const sent = calls.find((c) => c.type === "createTask")!.body!.input.image_urls;
    expect(sent).toEqual(["https://mock-kie.test/upload/1", "https://mock-kie.test/upload/2"]);
  });
});
