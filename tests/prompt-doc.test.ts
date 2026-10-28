import { getSchema } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Mention from "@tiptap/extension-mention";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { serializePrompt } from "@/lib/catalog/prompt-refs";
import type { Catalog } from "@/lib/catalog/types";
import { CHIP_NODE, type DocNode, docToText, fmtCount, textToContent, textToDoc } from "@/lib/ui/prompt-doc";

/**
 * The rich-text prompt editor must not change what is saved or sent. The old editor sent the
 * textarea string as is; the new one sends docToText(document). For every input the two
 * strings — and so serializePrompt's output — are identical.
 */

const catalog = data as unknown as Catalog;
const model = (key: string) => catalog.models.find((m) => m.key === key)!;
// The editor's schema (same node names as the app), to check documents against the real model.
const schema = getSchema([Document, Paragraph, Text, Mention.extend({ name: CHIP_NODE })]);
/** Text → editor document (validated by ProseMirror) → text. */
const throughEditor = (s: string) => {
  const node = schema.nodeFromJSON(textToDoc(s));
  node.check();
  return docToText(node.toJSON() as DocNode);
};

const A = "local://upload/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "local://upload/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const V = "local://upload/cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const PROMPTS = [
  "",
  "a red kite",
  "a red kite @image_1 ",
  "@image_1 meets @image_2",
  "@image_1@image_2 side by side",
  "@video_1 then @image_2 holds @image_1",
  "line one\nline two\n\n\nafter blank lines\n",
  "\n\nleading blank lines",
  "keep @image_1x as text, and email@image_1.com too",
  "Ünïcode — «quotes» 🎈 @audio_1 and tabs\there",
  "@image_9 is no longer attached",
  Array.from({ length: 60 }, (_, i) => `Line ${i + 1}: same face, hair and clothing${i % 10 === 3 ? " @image_1" : ""}.`).join("\n"),
];

describe("prompt document ⇄ text", () => {
  it("text → document → text is the identity", () => {
    for (const p of PROMPTS) expect(throughEditor(p)).toBe(p);
  });

  it("Windows line breaks are read as line breaks", () => {
    expect(throughEditor("a\r\nb\rc")).toBe("a\nb\nc");
  });

  it("old drafts load as chips: each @image_1 becomes a chip node", () => {
    const doc = textToDoc("put a hat on @image_1\n@video_2 at night");
    expect(doc.content).toEqual([
      { type: "paragraph", content: [{ type: "text", text: "put a hat on " }, { type: CHIP_NODE, attrs: { id: "image_1" } }] },
      { type: "paragraph", content: [{ type: CHIP_NODE, attrs: { id: "video_2" } }, { type: "text", text: " at night" }] },
    ]);
  });

  it("a chip typed straight against a word still reads back as a chip", () => {
    const doc: DocNode = { type: "doc", content: [{ type: "paragraph", content: [{ type: CHIP_NODE, attrs: { id: "image_1" } }, { type: "text", text: "x" }] }] };
    expect(docToText(doc)).toBe("@image_1 x");
    expect(throughEditor(docToText(doc))).toBe("@image_1 x");
  });

  it("pasted text keeps its line breaks", () => {
    expect(textToContent("a\nb @image_1")).toHaveLength(2);
  });

  it("counts with thin grouping", () => {
    expect(fmtCount(1840)).toBe("1 840");
    expect(fmtCount(999)).toBe("999");
    expect(fmtCount(1234567)).toBe("1 234 567");
  });
});

describe("serializePrompt gives the same output for the old and new editor", () => {
  const refs = [
    { label: "image_1", kind: "image" as const, uri: A },
    { label: "image_2", kind: "image" as const, uri: B },
    { label: "video_1", kind: "video" as const, uri: V },
  ];
  const cases: [string, Record<string, unknown>][] = [
    ["kling/v4-reference-to-video", { image_urls: [B, A], video_urls: [V] }],
    ["happyhorse-1-1/reference-to-video", { reference_image: [A] }],
    ["kling/v4-keyframe-to-video", { first_frame_url: A, keyframe_urls: [B], last_frame_url: V }],
    ["wan/3-0-video", { reference_image_urls: [A], reference_audio_urls: [V] }],
    ["minimax-h3/image-to-video", { first_frame_url: A }],
    ["bytedance/seedance-2-5", { reference_image_urls: [A, B] }],
  ];
  for (const [key, extra] of cases) {
    it(key, () => {
      const m = model(key);
      for (const p of PROMPTS) {
        const old = serializePrompt({ ...extra, prompt: p }, m.variants[0].schema, m.promptReferenceSyntax, refs);
        const next = serializePrompt({ ...extra, prompt: throughEditor(p) }, m.variants[0].schema, m.promptReferenceSyntax, refs);
        expect(next).toEqual(old);
      }
    });
  }
});
