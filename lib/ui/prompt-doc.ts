import { CHIP_RE } from "@/lib/catalog/prompt-refs";

/**
 * The prompt editor's document and the plain prompt string. The string is what drafts store
 * and what `serializePrompt` reads: each line is a paragraph and each chip is `@image_1`.
 * Converting text → doc → text gives back the same string, so the editor changes nothing
 * about what is saved or sent.
 */

export const CHIP_NODE = "refChip";

export interface DocNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
}

function lineToNodes(line: string): DocNode[] {
  const out: DocNode[] = [];
  let at = 0;
  for (const m of line.matchAll(CHIP_RE)) {
    if (m.index! > at) out.push({ type: "text", text: line.slice(at, m.index) });
    out.push({ type: CHIP_NODE, attrs: { id: m[0].slice(1) } });
    at = m.index! + m[0].length;
  }
  if (at < line.length) out.push({ type: "text", text: line.slice(at) });
  return out;
}

/** Inline content for text inserted at the caret (paste, helpers); line breaks become paragraphs. */
export function textToContent(text: string): DocNode[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => ({ type: "paragraph", content: lineToNodes(line) }));
}

export function textToDoc(text: string): DocNode {
  return { type: "doc", content: textToContent(text) };
}

export function docToText(doc: DocNode): string {
  return (doc.content ?? [])
    .map((p) => {
      let s = "";
      let afterChip = false;
      for (const n of p.content ?? []) {
        if (n.type === CHIP_NODE) s += `@${String(n.attrs?.id)}`;
        // A chip followed straight by a letter or digit wouldn't read back as a chip ("@image_1x").
        else if (n.type === "text") s += afterChip && /^\w/.test(n.text ?? "") ? ` ${n.text}` : (n.text ?? "");
        else if (n.type === "hardBreak") s += "\n";
        afterChip = n.type === CHIP_NODE;
      }
      return s;
    })
    .join("\n");
}

/** 1840 → "1 840" (no-break space between thousands). */
export const fmtCount = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
