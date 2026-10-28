import { expect, test } from "@playwright/test";
import { TOOLS } from "../lib/catalog/tools";

/** Tools: card grid, one panel per tool, engines, per-tool drafts. Isolated server + mock Kie.ai. */

const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const png = (name: string) => ({ name, mimeType: "image/png", buffer: Buffer.concat([Buffer.from(PNG_1x1, "base64"), Buffer.from(`${name}:${Math.random()}`)]) });

test("the grid shows every tool by section and opens its own panel", async ({ page }) => {
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: "Tools", level: 1 })).toBeVisible({ timeout: 30_000 });
  for (const s of ["Image", "Video", "Audio", "Characters and voices"]) await expect(page.getByRole("heading", { name: s, level: 2 })).toBeVisible();
  await expect(page.locator('main a[href^="/tools/"]')).toHaveCount(TOOLS.length);
  await expect(page.getByRole("link", { name: /Upscale image/ })).toContainText("2 engines");

  await page.getByRole("link", { name: /^Remove background/ }).click();
  await expect(page).toHaveURL(/\/tools\/remove-background$/);
  await expect(page.getByRole("heading", { name: "Remove background", level: 2 })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: /^Model:/ })).toHaveCount(0);
  await expect(page.getByTestId("resolved-model")).toHaveText("recraft/remove-background");
  await page.getByRole("link", { name: "All tools" }).click();
  await expect(page).toHaveURL(/\/tools$/);
});

test("Upscale image: References, engine switch, required setting, and its own draft", async ({ page }) => {
  await page.goto("about:blank");
  await page.request.put("/api/drafts/tools.upscale-image", { data: {} });
  await page.goto("/tools/upscale-image");
  const zone = page.getByRole("button", { name: /^Add references\./ });
  await expect(zone).toBeVisible({ timeout: 30_000 });
  await zone.click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("dialog").getByRole("button", { name: "Upload file" }).first().click();
  await (await chooser).setFiles([png("small.png")]);
  await expect(page.getByLabel("Saving")).toHaveCount(0);
  await expect(page.getByTestId("resolved-model")).toHaveText("recraft/crisp-upscale");

  const engines = page.getByRole("radiogroup", { name: "Engine" });
  await expect(engines.getByRole("radio")).toHaveText(["Recraft Crisp", "Topaz"]);
  await engines.getByRole("radio", { name: "Topaz" }).click();
  await expect(page.getByTestId("resolved-model")).toHaveText("topaz/image-upscale");
  await expect(page.getByTestId("ref-thumb")).toHaveCount(1);

  await page.getByRole("button", { name: "Preview request" }).click();
  const p = JSON.parse((await page.getByTestId("request-preview").textContent())!);
  expect(p.model).toBe("topaz/image-upscale");
  expect(JSON.stringify(p.input)).toContain("local://upload/");
  expect(p.input.upscale_factor).toBeDefined();

  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.getByTestId("ref-thumb")).toHaveCount(1, { timeout: 30_000 });
  await expect(page.getByTestId("resolved-model")).toHaveText("topaz/image-upscale");
  // Another tool starts empty.
  await page.goto("/tools/remove-background");
  await expect(page.getByRole("button", { name: /^Add references\./ })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("ref-thumb")).toHaveCount(0);
});

test("390 px: grid and a tool panel fit without sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: "Tools", level: 1 })).toBeVisible({ timeout: 30_000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto("/tools/veo-hd");
  await expect(page.getByRole("button", { name: /^Generate/ })).toBeVisible({ timeout: 30_000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("a step-by-step tool opens on its first step", async ({ page }) => {
  await page.goto("about:blank");
  await page.request.put("/api/drafts/tools.suno-voice", { data: {} });
  await page.goto("/tools/suno-voice");
  const steps = page.getByRole("radiogroup", { name: "Engine" });
  await expect(steps.getByRole("radio", { name: "1. Verification phrase" })).toHaveAttribute("aria-checked", "true", { timeout: 30_000 });
  // Step 1 takes a voice recording; step 2 takes none, so References goes away.
  await expect(page.getByRole("button", { name: /^Add references\./ })).toContainText("Audio up to 1");
  await steps.getByRole("radio", { name: "2. New phrase" }).click();
  await expect(page.getByTestId("resolved-model")).toContainText("regenerate");
  await expect(page.getByRole("button", { name: /^Add references\./ })).toHaveCount(0);
});
