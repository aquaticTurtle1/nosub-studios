import { expect, type Page, test } from "@playwright/test";
import { expectPrompt, promptEditor, setPrompt } from "./prompt-helpers";

/** The new panel on Image and Audio, and Animate from an Image card into Video. Isolated server + mock Kie.ai. */

const MOCK = "http://127.0.0.1:3199";
const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const png = (name: string) => ({ name, mimeType: "image/png", buffer: Buffer.concat([Buffer.from(PNG_1x1, "base64"), Buffer.from(`${name}:${Math.random()}`)]) });
function wav(name: string) {
  const b = Buffer.alloc(44 + 16000);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + 16000, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24);
  b.writeUInt32LE(8000, 28);
  b.writeUInt16LE(1, 32);
  b.writeUInt16LE(8, 34);
  b.write("data", 36);
  b.writeUInt32LE(16000, 40);
  b.fill(128, 44);
  b[44] = Math.floor(Math.random() * 256);
  return { name, mimeType: "audio/wav", buffer: b };
}

const zone = (page: Page) => page.getByRole("button", { name: /^Add references\./ });

async function open(page: Page, mode: "image" | "audio" | "video", family?: string) {
  // Leave the page first: closing it saves its pending draft, which would undo the reset.
  await page.goto("about:blank");
  await page.request.put(`/api/drafts/${mode}`, { data: {} });
  await page.goto(`/${mode}`);
  await expect(page.getByRole("button", { name: /^Model:/ })).toBeVisible({ timeout: 30_000 });
  if (family) {
    await page.getByRole("button", { name: /^Model:/ }).click();
    await page.getByPlaceholder("Search models").fill(family);
    await page.getByRole("option").filter({ hasText: family }).first().click();
    await expect(page.getByRole("button", { name: new RegExp(`^Model: ${family.replace(/[.()]/g, "\\$&")}\\.`) })).toBeVisible();
  }
}

async function attach(page: Page, files: { name: string; mimeType: string; buffer: Buffer }[]) {
  await zone(page).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("dialog").getByRole("button", { name: "Upload file" }).first().click();
  await (await chooser).setFiles(files);
  await expect(page.getByLabel("Saving")).toHaveCount(0);
  await expect(page.getByTestId("ref-thumb")).toHaveCount(files.length);
}

test("Image: family picker, References zone, routing to edit, chips, own draft", async ({ page }) => {
  await open(page, "image", "Seedream 4.5");
  await expect(page.getByTestId("resolved-model")).toContainText("seedream/4.5-text-to-image · auto · text only");
  await expect(zone(page)).toContainText("Images up to 14");
  await attach(page, [png("cat.png")]);
  await expect(page.getByTestId("resolved-model")).toContainText("seedream/4.5-edit");
  await setPrompt(promptEditor(page), "put a hat on @image_1");
  await expect(page.getByTestId("prompt-hint")).toContainText("image_1 is the reference image");
  await page.getByRole("button", { name: "Preview request" }).click();
  const p = JSON.parse((await page.getByTestId("request-preview").textContent())!);
  expect(p.input.prompt).toBe("put a hat on the reference image");
  expect(p.input.image_urls).toEqual([expect.stringMatching(/^local:\/\/upload\//)]);
  // Setting tiles, not chips.
  await expect(page.getByRole("region", { name: "Main settings" }).locator("button").first()).toHaveClass(/h-14/);

  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.getByTestId("ref-thumb")).toHaveCount(1, { timeout: 30_000 });
  // The Video page has its own draft.
  await page.goto("about:blank");
  await page.request.put("/api/drafts/video", { data: {} });
  await page.goto("/video");
  await expect(page.getByRole("button", { name: /^Model:/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("ref-thumb")).toHaveCount(0);
});

test("Audio: an upload-and-extend model takes an audio file", async ({ page }) => {
  await open(page, "audio", "Suno Extend (upload)");
  await expect(zone(page)).toContainText("Audio up to 1");
  await attach(page, [wav("song.wav")]);
  await expect(page.getByTestId("ref-thumb")).toHaveAttribute("data-kind", "audio");
  await expect(page.getByTestId("resolved-model")).toContainText("upload-and-extend");
});

test("Animate on an Image card opens Video with that image attached", async ({ page }) => {
  await page.request.post(`${MOCK}/__reset`);
  await page.request.put("/api/drafts/video", { data: {} });
  await open(page, "image", "Z-Image");
  await setPrompt(promptEditor(page), "a ceramic teapot");
  await page.getByRole("button", { name: /^Generate/ }).click();
  const pay = page.getByRole("button", { name: "Generate and pay" });
  if (await pay.isVisible({ timeout: 1500 }).catch(() => false)) await pay.click();
  const card = page.getByRole("button", { name: /^Open Z-Image result/ }).first();
  await expect(card).toBeVisible({ timeout: 45_000 });
  await card.hover();
  await page.getByRole("button", { name: "Animate" }).first().click();
  await expect(page).toHaveURL(/\/video$/);
  await expect(page.getByTestId("ref-thumb").filter({ visible: true })).toHaveCount(1, { timeout: 30_000 });
  // Next keeps the Image page mounted but hidden after client navigation: look at the visible panel only.
  await expect(page.getByTestId("resolved-model").filter({ visible: true })).toContainText(/image-to-video|reference-to-video/);
  // Straight from data/outputs, not re-uploaded.
  // The hidden Image page must not react to this page's paste (its listeners are unmounted).
  const dt = await page.evaluateHandle(() => {
    const d = new DataTransfer();
    d.items.add(new File([new Uint8Array([137, 80, 78, 71])], "pasted.png", { type: "image/png" }));
    return d;
  });
  await page.evaluate((clipboardData) => window.dispatchEvent(new ClipboardEvent("paste", { clipboardData })), dt);
  await expect(page.getByTestId("ref-thumb").filter({ visible: true })).toHaveCount(2);
  await expect(page.getByTestId("ref-thumb")).toHaveCount(2);
  await page.getByRole("button", { name: "Remove pasted.png" }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Preview request" }).filter({ visible: true }).click();
  await expect(page.getByTestId("request-preview").filter({ visible: true })).toContainText("local://output/");
});

test("a reload right after typing keeps the last keystrokes", async ({ page }) => {
  await open(page, "image");
  await setPrompt(promptEditor(page), "typed just before the reload");
  await page.reload(); // no wait: the 400 ms save hasn't fired, pagehide flushes it
  await expectPrompt(promptEditor(page), "typed just before the reload", 30_000);
});
