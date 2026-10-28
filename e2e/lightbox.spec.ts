import fs from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

/**
 * Lightbox regressions: every aspect ratio with a 2,000+ character prompt at three
 * viewports. Media come from the mock (e2e/fixtures), stored locally like real results.
 */

const DATA = path.resolve(".e2e-data");
const OUT = "design/lightbox";
const LONG = "A three-panel character reference sheet, front, side and back views, same outfit, neutral studio light. ".repeat(22) + "#finish";

const CASES = [
  { id: "image-16x9", kind: "image", modelKey: "seedream/5-pro-text-to-image", input: { prompt: LONG, aspect_ratio: "16:9", quality: "basic" } },
  { id: "image-9x16", kind: "image", modelKey: "seedream/5-pro-text-to-image", input: { prompt: LONG, aspect_ratio: "9:16", quality: "basic" } },
  { id: "image-1x1", kind: "image", modelKey: "seedream/5-pro-text-to-image", input: { prompt: LONG, aspect_ratio: "1:1", quality: "basic" } },
  { id: "video-16x9", kind: "video", modelKey: "pixverse/text-to-video", input: { prompt: LONG, aspect_ratio: "16:9", duration: 3, quality: "360p", generate_audio_switch: false } },
  { id: "video-9x16", kind: "video", modelKey: "pixverse/text-to-video", input: { prompt: LONG, aspect_ratio: "9:16", duration: 3, quality: "360p", generate_audio_switch: false } },
] as const;

const VIEWPORTS = [
  { w: 1920, h: 1080 },
  { w: 1366, h: 768 },
  { w: 390, h: 844 },
];

const taskIds: Record<string, string> = {};

test.beforeAll(async ({ request }) => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const c of CASES) {
    const r = await request.post("/api/generate", {
      data: { modelKey: c.modelKey, variant: "Default", input: c.input, idempotencyKey: crypto.randomUUID(), confirmed: true },
    });
    expect(r.ok(), await r.text()).toBe(true);
    taskIds[c.id] = (await r.json()).task.id;
  }
  // Wait until every task is done and its file is stored locally.
  await expect
    .poll(
      async () => {
        // Polling is driven by the per-task route (the page does the same).
        const done = await Promise.all(
          CASES.map(async (c) => {
            const { task } = (await (await request.post(`/api/tasks/${taskIds[c.id]}`, { data: { action: "poll" } })).json()) as { task: { outputs: { localPath: string | null }[] } };
            return Boolean(task.outputs[0]?.localPath);
          }),
        );
        return done.every(Boolean);
      },
      { timeout: 60_000, intervals: [1000] },
    )
    .toBe(true);
});

async function open(page: Page, caseId: string) {
  await page.goto("/library");
  const card = page.locator(`[data-task-id="${taskIds[caseId]}"]`).first();
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.locator('button[aria-label^="Open"]').first().click();
  const dialog = page.getByTestId("lightbox");
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("lightbox-loading")).toHaveCount(0, { timeout: 15_000 });
  // Measure after the open animation (zoom-in), not during it.
  await dialog.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {}))));
  return dialog;
}

const inside = (b: { x: number; y: number; width: number; height: number }, w: number, h: number) =>
  b.x >= -0.5 && b.y >= -0.5 && b.x + b.width <= w + 0.5 && b.y + b.height <= h + 0.5;

for (const vp of VIEWPORTS) {
  for (const c of CASES) {
    test(`${c.id} with a long prompt at ${vp.w}×${vp.h}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      const dialog = await open(page, c.id);
      const media = page.getByTestId("lightbox-media");
      const stage = page.getByTestId("lightbox-stage");
      const info = page.getByTestId("lightbox-info");

      // Loaded.
      if (c.kind === "image") expect(await media.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
      else await expect.poll(() => media.evaluate((el: HTMLVideoElement) => el.readyState)).toBeGreaterThanOrEqual(2);

      // The media is whole and inside the viewport: the picture inside the object-contain element.
      const box = (await media.boundingBox())!;
      const [nw, nh] = await media.evaluate((el: HTMLImageElement & HTMLVideoElement) =>
        el.tagName === "IMG" ? [el.naturalWidth, el.naturalHeight] : [el.videoWidth, el.videoHeight],
      );
      const k = Math.min(box.width / nw, box.height / nh);
      const m = { x: box.x + (box.width - nw * k) / 2, y: box.y + (box.height - nh * k) / 2, width: nw * k, height: nh * k };
      expect(inside(m, vp.w, vp.h), JSON.stringify(m)).toBe(true);
      const s = (await stage.boundingBox())!;
      const d = (await dialog.boundingBox())!;
      if (vp.w >= 768) {
        // The stage gets at least half of the dialog, and the media is fitted to it (contain:
        // it touches the stage on one axis — a 9:16 image can't fill a landscape stage).
        expect(s.width * s.height).toBeGreaterThanOrEqual(0.5 * d.width * d.height);
        // The video sits in a small inset so its controls clear the stage edges.
        const pad = await media.evaluate((el) => 2 * parseFloat(getComputedStyle(el.parentElement!).paddingLeft));
        const fits = Math.abs(m.width - (s.width - pad)) < 2 || Math.abs(m.height - (s.height - pad)) < 2;
        expect(fits, `media ${m.width}×${m.height} in stage ${s.width}×${s.height}`).toBe(true);
      }

      // The dialog never scrolls or clips: nothing is shifted out of view.
      const dlg = await dialog.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight, top: el.scrollTop }));
      expect(dlg.sh).toBe(dlg.ch);
      expect(dlg.top).toBe(0);

      // The panel starts at the title and the first line of the prompt; the actions are visible.
      const prompt = page.getByTestId("lightbox-prompt");
      const p = (await prompt.boundingBox())!;
      const i = (await info.boundingBox())!;
      expect(p.y).toBeGreaterThanOrEqual(i.y);
      expect(p.y).toBeLessThan(i.y + i.height);
      for (const name of ["Reuse prompt", "Download"]) {
        const b = (await dialog.getByRole("button", { name }).boundingBox())!;
        expect(inside(b, vp.w, vp.h), name).toBe(true);
      }

      await page.screenshot({ path: `${OUT}/${vp.w}x${vp.h}-${c.id}.png` });

      // The panel scrolls on its own (expand the prompt so there is something to scroll).
      await dialog.getByRole("button", { name: "Show more" }).click();
      await info.hover();
      await page.mouse.wheel(0, 400);
      await expect.poll(() => info.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await dialog.evaluate((el) => el.scrollTop)).toBe(0);
    });
  }
}

test("image zoom: wheel zooms, drag pans, double-click resets, click toggles fit ↔ 100 %", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await open(page, "image-16x9");
  const media = page.getByTestId("lightbox-media");
  const scale = () => media.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  const box = (await media.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -600);
  await expect.poll(scale).toBeGreaterThan(1.5);
  const before = await media.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => media.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e)).not.toBe(before);
  await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(scale).toBeCloseTo(1, 2);
  // A single click goes to actual pixels (1600 px image fitted smaller), and back.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId("lightbox").getByText("100 %")).toBeVisible();
});

test("video: autoplays muted, unmute and loop toggles, Space plays and pauses", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  const dialog = await open(page, "video-9x16");
  const v = page.getByTestId("lightbox-media");
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.muted && !el.paused)).toBe(true);
  await dialog.getByRole("button", { name: "Unmute" }).click();
  expect(await v.evaluate((el: HTMLVideoElement) => el.muted)).toBe(false);
  await dialog.getByRole("button", { name: "Loop" }).click();
  expect(await v.evaluate((el: HTMLVideoElement) => el.loop)).toBe(false);
  await page.getByTestId("lightbox-stage").focus();
  await page.keyboard.press("Space");
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.keyboard.press("Space");
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
});

test("← / → step through the feed, Esc closes and focus returns to the card", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  const dialog = await open(page, "image-9x16");
  const title = async () => (await dialog.getByText(/^\d+ \/ \d+$/).textContent())!;
  const first = await title();
  await page.keyboard.press("ArrowRight");
  await expect.poll(title).not.toBe(first);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(title).toBe(first);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  const focused = await page.evaluate(() => document.activeElement?.closest("[data-task-id]")?.getAttribute("data-task-id"));
  expect(focused).toBe(taskIds["image-9x16"]);
});

test("a missing file shows an error with Retry, not an empty box", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  const { tasks } = (await (await page.request.get("/api/tasks?limit=200")).json()) as { tasks: { id: string; outputs: { localPath: string }[] }[] };
  const rel = tasks.find((t) => t.id === taskIds["image-1x1"])!.outputs[0].localPath;
  fs.rmSync(path.join(DATA, "outputs", rel));
  await page.goto("/library");
  await page.locator(`[data-task-id="${taskIds["image-1x1"]}"] button[aria-label^="Open"]`).first().click();
  const dialog = page.getByTestId("lightbox");
  await expect(dialog.getByRole("alert")).toContainText("The file didn't load.");
  await expect(dialog.getByRole("button", { name: "Retry" })).toBeVisible();
  await page.screenshot({ path: `${OUT}/1366x768-missing-file.png` });
});

test.describe("other dialogs and popovers stay inside the window", () => {
  const within = async (page: Page, sel: ReturnType<Page["getByRole"]>) => {
    const b = (await sel.boundingBox())!;
    const vp = page.viewportSize()!;
    expect(inside(b, vp.width, vp.height), JSON.stringify(b)).toBe(true);
  };

  test("Generate examples in a short window: inside the viewport, scrolls to its buttons", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 420 });
    await page.goto("/");
    await page.getByRole("button", { name: "Generate examples" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("list", { name: "Runs" })).toBeVisible();
    await dialog.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {}))));
    await within(page, dialog);
    const notNow = dialog.getByRole("button", { name: "Not now" });
    await notNow.scrollIntoViewIfNeeded();
    await within(page, notNow);
    await notNow.click();
  });

  test("Media library is full screen on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("about:blank");
    await page.request.put("/api/drafts/video", { data: {} });
    await page.goto("/video");
    await page.getByRole("button", { name: "Expand settings" }).click();
    await page.getByRole("button", { name: /^Add references\./ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {}))));
    const b = (await dialog.boundingBox())!;
    expect(Math.round(b.width)).toBe(390);
    expect(Math.round(b.height)).toBe(844);
    await within(page, dialog.getByRole("button", { name: "Cancel" }));
  });

  test("model picker in a short window keeps its list scrollable and its footer visible", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 500 });
    await page.goto("/video");
    await page.getByRole("button", { name: /^Model:/ }).click();
    const list = page.locator('[data-slot="command-list"]');
    await expect(list).toBeVisible();
    const pop = page.locator('[data-slot="popover-content"]');
    await pop.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {}))));
    const b = (await pop.boundingBox())!;
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.y + b.height).toBeLessThanOrEqual(500.5);
    await expect(page.getByText("Show all variants")).toBeInViewport();
    await list.hover();
    await page.mouse.wheel(0, 300);
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });
});
