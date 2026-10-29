import { expect, test } from "@playwright/test";

/**
 * Security headers on a production build in cloud mode (project cloud-prod: `next build` + `next start`, port 3102).
 * CSP and friends are production-only, so the dev servers do not send them.
 */

test("CSP header present", async ({ request }) => {
  const res = await request.get("/");
  const csp = res.headers()["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("script-src 'self' 'unsafe-inline';");
  expect(csp).not.toContain("unsafe-eval");
  expect(csp).toContain("connect-src 'self' https://api.kie.ai");
  expect(csp).toContain("object-src 'none'");
  expect(res.headers()["strict-transport-security"]).toBe("max-age=63072000; includeSubDomains");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(res.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
});

test("page works under the CSP", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.goto("/");
  // Hydration needs the nonce'd scripts: the key dialog only opens when React runs.
  await page.getByRole("button", { name: "Connect API key" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(violations).toEqual([]);
});
