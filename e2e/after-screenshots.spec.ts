import { expect, test } from "@playwright/test";

/**
 * Regenerates design/after/*.png. Not part of the normal run. With your own media
 * (a copy of ./data; the original is only read), in Git Bash:
 *   SCREENSHOTS=1 E2E_SEED_FROM=data pnpm exec playwright test e2e/after-screenshots.spec.ts
 */
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to regenerate design/after");

const PAGES = [
  { name: "explore", url: "/", ready: () => /What are we making/ },
  { name: "image", url: "/image" },
  { name: "video", url: "/video" },
  { name: "audio", url: "/audio" },
  { name: "tools", url: "/tools" },
  { name: "tool-upscale-image", url: "/tools/upscale-image" },
  { name: "library", url: "/library" },
];

for (const size of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
  test(`after screenshots ${size.w}`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: size.w, height: size.h });
    for (const p of PAGES) {
      await page.goto(p.url);
      await expect(page.locator("main").first()).toBeVisible({ timeout: 30_000 });
      await page.waitForTimeout(2500);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${p.name} @${size.w}`).toBeLessThanOrEqual(size.w);
      await page.screenshot({ path: `design/after/${p.name}-${size.w}.png` });
    }
  });
}
