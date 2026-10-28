import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import { expectPrompt, promptEditor } from "./prompt-helpers";

/** Explore (start cards, opt-in examples) and Library multi-select download. Isolated server + mock Kie.ai. */

const MOCK = "http://127.0.0.1:3199";
const createCalls = async (page: Page) =>
  ((await (await page.request.get(`${MOCK}/__calls`)).json()) as { type: string }[]).filter((c) => c.type === "createTask").length;

async function resetDrafts(page: Page) {
  await page.goto("about:blank");
  for (const m of ["image", "video"]) await page.request.put(`/api/drafts/${m}`, { data: {} });
}

test("Explore is the home page with four start cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What are we making?", level: 1 })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("link", { name: "Explore" })).toHaveAttribute("aria-current", "page");
  const starts = page.getByRole("region", { name: "Start here" }).getByRole("link");
  await expect(starts).toHaveCount(4);
  await expect(starts).toContainText(["Text to video", "Animate a photo", "Product shot", "Upscale"]);
});

test("start cards open the right page, model and helper", async ({ page }) => {
  await resetDrafts(page);
  await page.goto("/");
  await page.getByRole("link", { name: /^Product shot/ }).click();
  await expect(page).toHaveURL(/\/image$/);
  await expect(page.getByRole("button", { name: /^Model: Nano Banana Pro\./ }).filter({ visible: true })).toBeVisible({ timeout: 30_000 });
  await expectPrompt(promptEditor(page), /Clean studio product shot on a seamless backdrop/);

  await resetDrafts(page);
  await page.goto("/");
  await page.getByRole("link", { name: /^Animate a photo/ }).click();
  await expect(page).toHaveURL(/\/video$/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Media library" })).toBeVisible({ timeout: 30_000 });
  await page.keyboard.press("Escape"); // the modal hides the page from the accessibility tree
  await expect(page.getByRole("button", { name: /^Model: PixVerse V6\./ }).filter({ visible: true })).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: /^Upscale/ }).click();
  await expect(page).toHaveURL(/\/tools\/upscale-image$/);
});

test("Generate examples lists runs and costs, and runs nothing until confirmed", async ({ page }) => {
  await page.request.post(`${MOCK}/__reset`);
  await page.goto("/");
  await page.getByRole("button", { name: "Generate examples" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Generate examples?" })).toBeVisible();
  const runs = dialog.getByRole("list", { name: "Runs" }).getByRole("listitem");
  await expect(runs).toHaveCount(3);
  await expect(runs.first()).toContainText(/credits/);
  await expect(dialog.getByRole("button", { name: /^Run 3 · / })).toBeVisible();
  await dialog.getByRole("button", { name: "Not now" }).click();
  expect(await createCalls(page)).toBe(0);

  // Confirmed (against the mock: no real credits).
  await page.getByRole("button", { name: "Generate examples" }).click();
  await dialog.getByRole("button", { name: /^Run 3 · / }).click();
  await expect(page.getByText("3 examples started.")).toBeVisible({ timeout: 20_000 });
  expect(await createCalls(page)).toBe(3);
  // The two Z-Image examples finish in the mock and show up in the gallery.
  await expect(page.getByRole("button", { name: /^Open Z-Image result/ })).toHaveCount(2, { timeout: 45_000 });
});

test("Library: select generations and download them as one ZIP", async ({ page }, info) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Library" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Select" }).click();
  const bar = page.getByRole("toolbar", { name: "Selection" });
  await bar.getByRole("button", { name: /^Download/ }).click();
  await expect(page.getByText("Select generations first.")).toBeVisible();

  const picks = page.getByRole("button", { name: /^Select Z-Image from/ });
  await expect(picks.first()).toBeVisible({ timeout: 30_000 });
  const n = await picks.count();
  expect(n).toBeGreaterThanOrEqual(2);
  // Each click turns that card's label into "Deselect…", so the next "Select" is always first.
  await picks.first().click();
  await picks.first().click();
  await expect(bar).toContainText("2 selected · 2 files");
  const download = page.waitForEvent("download");
  await bar.getByRole("button", { name: /Download 2 files/ }).click();
  const file = info.outputPath("library.zip");
  await (await download).saveAs(file);
  const tar = process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "bsdtar";
  const entries = execFileSync(tar, ["-tf", file], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  expect(entries).toHaveLength(2);
  for (const e of entries) expect(e).toMatch(/^\d{4}-\d{2}-\d{2}-z-image-[0-9a-f]{8}\/01\.png$/);

  await page.getByRole("button", { name: "Done" }).click();
  await expect(bar).toHaveCount(0);
});
