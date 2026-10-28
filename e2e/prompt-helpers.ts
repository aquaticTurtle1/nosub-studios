import { expect, type Locator, type Page } from "@playwright/test";

/** The prompt editor (ProseMirror, contenteditable) on the visible page. */
export const promptEditor = (page: Page) => page.locator("#prompt").filter({ visible: true });

/** The prompt as plain text, read from what is on screen: chips are `@image_1`, lines are paragraphs. */
export function promptText(editor: Locator) {
  return editor.evaluate((root) =>
    [...root.children]
      .map((p) =>
        [...p.childNodes]
          .map((n) => (n instanceof HTMLElement && n.dataset.chip ? `@${n.dataset.chip}` : n instanceof HTMLElement && n.tagName === "BR" ? "" : n.textContent))
          .join(""),
      )
      .join("\n"),
  );
}

export async function expectPrompt(editor: Locator, text: string | RegExp, timeout?: number) {
  await expect.poll(() => promptText(editor), { timeout }).toEqual(typeof text === "string" ? text : expect.stringMatching(text));
}

/** Replaces the whole prompt by pasting plain text, the way a person would. */
export async function setPrompt(editor: Locator, text: string) {
  await editor.click();
  await editor.press("Control+a");
  await editor.evaluate((el, t) => {
    const dt = new DataTransfer();
    dt.setData("text/plain", t);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  }, text);
  await expectPrompt(editor, text);
}
