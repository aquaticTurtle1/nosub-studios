import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { estimateCost, needsConfirmation } from "@/lib/catalog/pricing";
import { pruneEmpty, validateInput } from "@/lib/catalog/schema";
import type { Catalog } from "@/lib/catalog/types";

const catalog = data as unknown as Catalog;
const model = (key: string) => {
  const m = catalog.models.find((x) => x.key === key);
  if (!m) throw new Error(`missing ${key}`);
  return m;
};

describe("generated catalog", () => {
  it("has unique keys and only media categories", () => {
    const keys = catalog.models.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const m of catalog.models) expect(["image", "video", "audio", "tools"]).toContain(m.category);
  });

  it("contains no LLM/chat models", () => {
    for (const m of catalog.models) {
      expect(m.key).not.toMatch(/(^|\/)(chat|claude|codex|kimi|deepseek)\b/);
      expect(m.modelId).not.toMatch(/^(gpt-\d|claude|gemini-\d.*(pro|flash)$)/);
    }
  });

  it("every market model has a model ID and at least one variant", () => {
    for (const m of catalog.models) {
      expect(m.modelId).toBeTruthy();
      expect(m.variants.length).toBeGreaterThan(0);
    }
  });
});

describe("schema validation", () => {
  const nano = model("google/nano-banana").variants[0].schema;

  it("accepts a documented input and prunes empty fields", () => {
    const r = validateInput(nano, { prompt: "a cat", output_format: "png", aspect_ratio: "" });
    expect(r).toEqual({ ok: true, value: { prompt: "a cat", output_format: "png" } });
  });

  it("rejects missing required, bad enum and unknown fields", () => {
    expect(validateInput(nano, {}).ok).toBe(false);
    expect(validateInput(nano, { prompt: "x", output_format: "gif" }).ok).toBe(false);
    expect(validateInput(nano, { prompt: "x", seed_of_doom: 1 }).ok).toBe(false);
  });

  it("pruneEmpty drops nested empties", () => {
    expect(pruneEmpty({ a: "", b: [], c: { d: null }, e: 0, f: false })).toEqual({ e: 0, f: false });
  });
});

describe("cost estimate", () => {
  it("multiplies per-second prices by duration and picks the row matching the settings", () => {
    const m = model("bytedance/seedance-2");
    const est = estimateCost(m.pricing, { resolution: "720p", duration: 5 });
    expect(est.row?.description).toMatch(/720p/);
    expect(est.credits).toBe(est.row!.credits * 5);
  });

  it("picks the no-audio row when the audio switch is off (live: PixVerse V6 charged 12 for 3 s 360p)", () => {
    const m = model("pixverse/text-to-video");
    const off = estimateCost(m.pricing, { quality: "360p", duration: 3, generate_audio_switch: false });
    expect(off.row?.description).toMatch(/360p\(no audio\)/);
    expect(off.credits).toBe(12);
    const on = estimateCost(m.pricing, { quality: "360p", duration: 3, generate_audio_switch: true });
    expect(on.row?.description).toMatch(/360p\(with audio\)/);
  });

  it("free endpoints cost 0 and need no confirmation", () => {
    const est = estimateCost([], {}, true);
    expect(est.credits).toBe(0);
    expect(needsConfirmation("tools", est)).toBe(false);
  });

  it("requires confirmation for expensive or unknown-cost video", () => {
    expect(needsConfirmation("video", { row: null, credits: null, basis: "", ranked: [] })).toBe(true);
    expect(needsConfirmation("image", { row: null, credits: 150, basis: "", ranked: [] })).toBe(true);
    expect(needsConfirmation("image", { row: null, credits: 4, basis: "", ranked: [] })).toBe(false);
  });
});
