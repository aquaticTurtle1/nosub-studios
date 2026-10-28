import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectPrompt, promptEditor, promptText, setPrompt } from "./prompt-helpers";

/**
 * The prompt editor is one layer (ProseMirror): a click or a selection edits exactly the
 * text under it, in a long prompt with chips, after resizing and in the Expand dialog.
 * Isolated e2e server + mock Kie.ai; nothing here generates.
 */

// Real scrollbars, as in a desktop browser: the old two-layer editor broke exactly when one appeared.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const png = (name: string) => ({ name, mimeType: "image/png", buffer: Buffer.concat([Buffer.from(PNG_1x1, "base64"), Buffer.from(`${name}:${Math.random()}`)]) });

/** 60 lines, chips image_1…image_6 on six of them, long enough to wrap and scroll. */
const LINES = Array.from(
  { length: 60 },
  (_, i) => `Line ${i + 1}: keep the same face, hair and clothing${i % 10 === 3 ? ` @image_${Math.floor(i / 10) + 1}` : ""}; ignore the background and stay sharp`,
);
const PROMPT = LINES.join("\n");

async function open(page: Page) {
  await page.goto("about:blank");
  await page.request.put("/api/drafts/video", { data: {} });
  await page.goto("/video");
  await expect(page.getByRole("button", { name: /^Add references\./ })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /^Model:/ }).click();
  await page.getByPlaceholder("Search models").fill("MiniMax H3");
  await page.getByRole("option").filter({ hasText: "MiniMax H3" }).first().click();
  await page.getByRole("button", { name: /^Add references\./ }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("dialog").getByRole("button", { name: "Upload file" }).first().click();
  await (await chooser).setFiles(["a", "b", "c", "d", "e", "f"].map((n) => png(`${n}.png`)));
  await expect(page.getByLabel("Saving")).toHaveCount(0);
  await setPrompt(promptEditor(page), PROMPT);
}

/** Viewport point just right of the last character of line `n` (1-based). */
async function endOfLine(editor: Locator, n: number) {
  const line = editor.locator(`> p:nth-child(${n})`);
  await line.scrollIntoViewIfNeeded();
  return line.evaluate((p) => {
    const r = document.createRange();
    r.selectNodeContents(p);
    const rects = [...r.getClientRects()];
    const last = rects[rects.length - 1];
    const box = p.getBoundingClientRect();
    return { x: Math.min(last.right + 6, box.right - 1), y: last.top + last.height / 2 };
  });
}

/** Viewport centre of `word` on line `n`. */
async function wordOnLine(editor: Locator, n: number, word: string) {
  const line = editor.locator(`> p:nth-child(${n})`);
  await line.scrollIntoViewIfNeeded();
  return line.evaluate((p, w) => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const i = t.textContent!.indexOf(w);
      if (i < 0) continue;
      const r = document.createRange();
      r.setStart(t, i);
      r.setEnd(t, i + w.length);
      const b = r.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }
    throw new Error(`${w} not on the line`);
  }, word);
}

/** Click at the end of line 40 → X lands there; double-click a word on line 30 → only it changes. */
async function editsLandWhereClicked(page: Page, editor: Locator) {
  const before = (await promptText(editor)).split("\n");
  const at = await endOfLine(editor, 40);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.type("X");
  const expected = [...before];
  expected[39] += "X";
  await expectPrompt(editor, expected.join("\n"));

  const w = await wordOnLine(editor, 30, "clothing");
  await page.mouse.dblclick(w.x, w.y);
  await page.keyboard.type("outfit");
  expected[29] = expected[29].replace("clothing", "outfit");
  await expectPrompt(editor, expected.join("\n"));
}

test("one layer: no overlay, no textarea; chips are inline nodes with thumbnails", async ({ page }) => {
  await open(page);
  const editor = promptEditor(page);
  await expect(page.getByTestId("prompt-overlay")).toHaveCount(0);
  await expect(page.locator("textarea")).toHaveCount(0);
  await expect(editor).toHaveAttribute("contenteditable", "true");
  await expect(editor.locator("[data-chip]")).toHaveCount(6);
  await expect(editor.locator("[data-chip] img")).toHaveCount(6);
  await expect(editor.locator("[data-chip]").first()).toHaveAttribute("contenteditable", "false");
});

test("60 lines with 6 chips: a click and a double-click edit exactly the text under them", async ({ page }) => {
  await open(page);
  await editsLandWhereClicked(page, promptEditor(page));
  await page.getByRole("complementary").filter({ visible: true }).first().screenshot({ path: "design/editor/after-panel-1440.png" });
});

test("the box is ~12 lines, grows to half the viewport, then scrolls; the resized height is kept", async ({ page }) => {
  await page.goto("/video");
  await page.evaluate(() => localStorage.removeItem("studio.promptHeight"));
  await open(page);
  const box = page.getByTestId("prompt-editor").filter({ visible: true });
  const h = async () => (await box.boundingBox())!.height;
  // Long prompt: capped at 50% of the 900px viewport, scrolling inside.
  expect(await h()).toBeCloseTo(450, -1);
  expect(await box.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await setPrompt(promptEditor(page), "short");
  expect(await h()).toBeCloseTo(260, -1);

  // Drag the handle 200px down; the edits still land where clicked.
  await setPrompt(promptEditor(page), PROMPT);
  const handle = page.getByRole("separator", { name: "Resize prompt" }).filter({ visible: true });
  const hb = (await handle.boundingBox())!;
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 + 200, { steps: 8 });
  await page.mouse.up();
  expect(await h()).toBeCloseTo(650, -1);
  await editsLandWhereClicked(page, promptEditor(page));

  await page.reload();
  await expect(promptEditor(page)).toBeVisible({ timeout: 30_000 });
  await expect.poll(h).toBeGreaterThan(600);
});

test("Expand: the same document in a large dialog; edits land where clicked; chips insert at the caret", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Expand prompt" }).click();
  const dialog = page.getByRole("dialog", { name: "Prompt" });
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((el) => el.getAnimations().length)).toBe(0); // zoom-in done
  const d = (await dialog.boundingBox())!;
  // 90vw × 85vh (a page scrollbar, when there is one, takes ~15px of the width).
  expect(d.width).toBeGreaterThan((1440 - 20) * 0.9);
  expect(d.width).toBeLessThanOrEqual(1440 * 0.9 + 1);
  expect(d.height).toBeCloseTo(900 * 0.85, -1);
  const editor = dialog.locator("#prompt");
  await expect(editor).toHaveCSS("font-size", "15px");
  await editsLandWhereClicked(page, editor);
  await page.screenshot({ path: "design/editor/after-expand-1440.png" });

  // A reference from the side list goes in at the caret.
  const at = await wordOnLine(editor, 2, "ignore");
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Home");
  await dialog.getByRole("button", { name: "Insert image_6" }).click();
  expect((await promptText(editor)).split("\n")[1]).toMatch(/^@image_6 Line 2:/);
  await page.keyboard.press("Control+z");
  expect((await promptText(editor)).split("\n")[1]).toMatch(/^Line 2:/);

  const text = await promptText(editor);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expectPrompt(promptEditor(page), text);
});

test("paste is plain text, Ctrl+Enter generates instead of a new line, helpers insert at the caret", async ({ page }) => {
  await open(page);
  const editor = promptEditor(page);
  await setPrompt(editor, "first line\nsecond line");
  // Formatted paste: formatting dropped, line breaks kept, @image_2 becomes a chip.
  await editor.locator("> p:nth-child(1)").click();
  await page.keyboard.press("End");
  await editor.evaluate((el) => {
    const dt = new DataTransfer();
    dt.setData("text/html", "<b>bold</b><br><i>@image_2</i>");
    dt.setData("text/plain", " bold\nwith @image_2");
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await expectPrompt(editor, "first line bold\nwith @image_2\nsecond line");
  await expect(editor.locator("b, i, strong, em")).toHaveCount(0);
  await expect(editor.locator('[data-chip="image_2"]')).toHaveCount(1);

  // Ctrl+A then type replaces everything; Ctrl+Z restores it.
  await page.keyboard.press("Control+a");
  await page.keyboard.type("gone");
  await expectPrompt(editor, "gone");
  await page.keyboard.press("Control+z");
  await expectPrompt(editor, "first line bold\nwith @image_2\nsecond line");

  // Ctrl+Enter runs Generate (a confirmation or the pending card) and adds no line.
  await page.keyboard.press("Control+Enter");
  await expect(page.getByRole("button", { name: "Generate and pay" }).or(page.getByRole("status").filter({ hasText: "Uploading references…" }))).toBeVisible();
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await promptText(editor)).split("\n").length).toBe(3);
});

test("helpers go in at the caret; the counter warns near the limit and Generate is blocked past it", async ({ page }) => {
  await page.goto("about:blank");
  await page.request.put("/api/drafts/video", { data: {} });
  await page.goto("/video");
  const editor = promptEditor(page);
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await setPrompt(editor, "a cat\na dog");
  await editor.locator("> p:nth-child(1)").click();
  await page.keyboard.press("End");
  await page.getByRole("button", { name: "Golden hour" }).click();
  await expectPrompt(editor, "a cat. Warm golden-hour sunlight, long soft shadows, gentle lens flare.\na dog");

  const counter = page.getByTestId("prompt-counter").filter({ visible: true });
  const limit = Number((await counter.textContent())!.split("/")[1].replace(/\D/g, ""));
  expect(limit).toBeGreaterThan(0);
  await setPrompt(editor, "a".repeat(Math.ceil(limit * 0.95)));
  await expect(counter).toHaveClass(/text-np-warning/);
  await expect(page.getByTestId("prompt-too-long")).toHaveCount(0);
  await setPrompt(editor, "a".repeat(limit + 40));
  await expect(counter).toHaveClass(/text-np-danger/);
  await expect(counter).toHaveText(new RegExp(`^${(limit + 40).toLocaleString("fr-FR").replace(/\s/g, "\\s")} / `));
  await expect(page.getByTestId("prompt-too-long")).toContainText("Shorten it to generate");
  await expect(page.getByRole("button", { name: /^Generate/ })).toBeDisabled();
});
