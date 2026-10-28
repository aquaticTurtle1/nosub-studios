import { expect, type Page, test } from "@playwright/test";

/** @ reference chips in the prompt and how they are sent. Isolated e2e server + mock Kie.ai. */

const MOCK = "http://127.0.0.1:3199";
const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const png = (name: string) => ({ name, mimeType: "image/png", buffer: Buffer.concat([Buffer.from(PNG_1x1, "base64"), Buffer.from(`${name}:${Math.random()}`)]) });

const prompt = (page: Page) => page.locator("#prompt");
const chip = (page: Page, label: string) => page.getByTestId("prompt-overlay").locator(`[data-chip="${label}"]`);

async function openVideo(page: Page, family?: string, exclude?: RegExp) {
  // Leave the page first: closing it saves its pending draft, which would undo the reset.
  await page.goto("about:blank");
  await page.request.put("/api/drafts/video", { data: {} });
  await page.goto("/video");
  await expect(page.getByRole("button", { name: /^Add references\./ })).toBeVisible({ timeout: 30_000 });
  if (family) {
    await page.getByRole("button", { name: /^Model:/ }).click();
    await page.getByPlaceholder("Search models").fill(family);
    const options = page.getByRole("option").filter({ hasText: family });
    await (exclude ? options.filter({ hasNotText: exclude }) : options).first().click();
    await expect(page.getByRole("button", { name: new RegExp(`^Model: ${family.replace(/\./g, "\\.")}\\.`) })).toBeVisible();
  }
}

async function attach(page: Page, names: string[]) {
  const first = await page.getByRole("button", { name: /^Add references\./ }).count();
  await page.getByRole("button", { name: first ? /^Add references\./ : /^Add more references/ }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("dialog").getByRole("button", { name: "Upload file" }).first().click();
  await (await chooser).setFiles(names.map(png));
  await expect(page.getByLabel("Saving")).toHaveCount(0);
}

async function previewInput(page: Page) {
  const btn = page.getByRole("button", { name: /Preview request|Hide request/ });
  if ((await btn.textContent())?.includes("Hide")) await btn.click();
  await page.getByRole("button", { name: "Preview request" }).click();
  return JSON.parse((await page.getByTestId("request-preview").textContent())!) as { model: string; input: Record<string, unknown> };
}

test("typing @ lists references; Enter inserts a chip; Backspace removes it whole; Ctrl+Z brings it back", async ({ page }) => {
  await openVideo(page);
  await attach(page, ["kite.png"]);
  await prompt(page).click();
  await page.keyboard.type("a red kite @");
  const list = page.getByRole("listbox", { name: "Attached references" });
  await expect(list.getByRole("option")).toHaveText([/image_1\s*kite\.png/]);
  await page.keyboard.press("Enter");
  await expect(prompt(page)).toHaveValue("a red kite @image_1 ");
  await expect(chip(page, "image_1")).toBeVisible();
  await expect(chip(page, "image_1")).not.toHaveAttribute("data-missing", "true");
  await expect(chip(page, "image_1").locator("img")).toHaveCount(1);

  await page.keyboard.press("Backspace"); // the space
  await page.keyboard.press("Backspace"); // the whole chip
  await expect(prompt(page)).toHaveValue("a red kite ");
  await page.keyboard.press("Control+z");
  await expect(prompt(page)).toHaveValue("a red kite @image_1");

  // The caret can't stop inside a chip: arrows jump over it ("a red kite " is 11 characters).
  const caret = () => prompt(page).evaluate((el: HTMLTextAreaElement) => el.selectionStart);
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  expect(await caret()).toBe(11);
  await page.keyboard.press("ArrowRight");
  expect(await caret()).toBe(19);

  // Hover shows the full thumbnail.
  const box = (await chip(page, "image_1").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole("tooltip").locator("img")).toBeVisible();
});

test("labels stay put; a removed reference turns its chip into a warning and Generate explains", async ({ page }) => {
  await page.request.post(`${MOCK}/__reset`);
  await openVideo(page);
  await attach(page, ["one.png", "two.png"]);
  await prompt(page).fill("@image_1 meets @image_2");
  await page.getByRole("button", { name: "Remove one.png" }).click();
  await expect(chip(page, "image_1")).toHaveAttribute("data-missing", "true");
  await expect(chip(page, "image_2")).not.toHaveAttribute("data-missing", "true");
  // A new file must not take over image_1 while the prompt still points at it.
  await attach(page, ["three.png"]);
  await expect(page.getByLabel("Attached references").getByText("image_3", { exact: true })).toBeVisible();
  await expect(chip(page, "image_1")).toHaveAttribute("data-missing", "true");

  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("image_1 is no longer attached.")).toBeVisible();
  expect((await (await page.request.get(`${MOCK}/__calls`)).json()).filter((c: { type: string }) => c.type === "createTask")).toHaveLength(0);
});

test("chips survive a reload with the draft", async ({ page }) => {
  await openVideo(page);
  await attach(page, ["keep.png"]);
  await prompt(page).fill("@image_1 at dawn");
  await page.waitForTimeout(700);
  await page.reload();
  await expect(chip(page, "image_1")).toBeVisible({ timeout: 30_000 });
  await expect(chip(page, "image_1")).not.toHaveAttribute("data-missing", "true");
});

test("MiniMax H3: no Variant switch, honest limits, chips sent as words with a hint", async ({ page }) => {
  await openVideo(page, "MiniMax H3");
  const zone = page.getByRole("button", { name: /^Add references\./ });
  await expect(zone).toContainText("Image to video·Images up to 2");
  await expect(zone).toContainText("Reference to video·Images up to 9 · video up to 3 · audio up to 3");
  await attach(page, ["rain.png"]);
  await expect(page.getByRole("radiogroup", { name: "Input type" })).toHaveCount(0);
  await prompt(page).fill("@image_1 walks into the rain");
  await expect(page.getByTestId("prompt-hint")).toHaveText("This model doesn't read references by name. image_1 is used as the first frame.");
  const p = await previewInput(page);
  expect(p.model).toBe("minimax-h3/image-to-video");
  expect(p.input.prompt).toBe("the first frame image walks into the rain");
  expect(p.input.first_frame_url).toMatch(/^local:\/\/upload\//);

  // Submit: the server does the same serialization (mock Kie.ai, no credits).
  await page.request.post(`${MOCK}/__reset`);
  await page.getByRole("button", { name: /^Generate/ }).click();
  const pay = page.getByRole("button", { name: "Generate and pay" });
  const card = page.getByRole("status").filter({ hasText: "Uploading references…" });
  await expect(pay.or(card)).toBeVisible();
  if (await pay.isVisible()) await pay.click();
  await expect.poll(async () => (await (await page.request.get(`${MOCK}/__calls`)).json()).find((c: { type: string }) => c.type === "createTask")?.body.input.prompt, { timeout: 20_000 }).toBe(
    "the first frame image walks into the rain",
  );
});

test("Seedance 2.5 with two images: words for frames; Kling 4.0 Reference: documented @image_N tokens", async ({ page }) => {
  await openVideo(page, "Seedance 2.5", /Draft/);
  await attach(page, ["cup-a.png", "cup-b.png"]);
  await prompt(page).fill("@image_1 hands a cup to @image_2");
  let p = await previewInput(page);
  expect(p.input.prompt).toBe("the first frame image hands a cup to the last frame image");
  await expect(page.getByTestId("prompt-hint")).toContainText("image_1 is used as the first frame, image_2 is used as the last frame");

  await openVideo(page, "Kling 4.0 Reference");
  await attach(page, ["hero.png", "doll.png"]);
  await prompt(page).fill("@image_2 is held by @image_1");
  p = await previewInput(page);
  expect(p.input.prompt).toBe("@image_2 is held by @image_1");
  expect(p.input.image_urls).toHaveLength(2);
  await expect(page.getByTestId("prompt-hint")).toHaveCount(0);
});
