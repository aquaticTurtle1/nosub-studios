import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { modelMeta } from "@/lib/catalog/meta";
import { pruneEmpty, validateInput } from "@/lib/catalog/schema";
import type { Catalog } from "@/lib/catalog/types";
import { applyPreset, PRESETS } from "@/lib/presets";
import { fileProblem, initialChipValue, layoutFields } from "@/lib/ui/fields";
import { assignTargets, mergeRefs, nextLabel } from "@/lib/ui/request";

const catalog = data as unknown as Catalog;
const model = (key: string) => catalog.models.find((m) => m.key === key)!;

describe("panel field layout", () => {
  it("PixVerse V6: prompt, duration/aspect/quality/audio tiles, rest advanced", () => {
    const l = layoutFields(model("pixverse/text-to-video").variants[0].schema);
    expect(l.promptField).toBe("prompt");
    expect(l.core.map((c) => c.name)).toEqual(["duration", "aspect_ratio", "quality", "generate_audio_switch"]);
    expect(l.advanced).toEqual(expect.arrayContaining(["seed", "generate_multi_clip_switch"]));
    expect(l.refFields).toEqual([]);
  });

  it("every model's fields are covered exactly once across sections", () => {
    for (const m of catalog.models) {
      for (const v of m.variants) {
        const l = layoutFields(v.schema);
        const all = [l.promptField, ...l.refFields.map((r) => r.name), ...l.core.map((c) => c.name), ...l.required, ...l.advanced].filter(Boolean);
        const expected = Object.entries(v.schema.properties ?? {}).filter(([, p]) => !p.deprecated).map(([n]) => n);
        expect(new Set(all).size).toBe(all.length);
        expect([...all].sort()).toEqual([...expected].sort());
      }
    }
  });

  it("required chips start with a documented option", () => {
    const l = layoutFields(model("pixverse/text-to-video").variants[0].schema);
    const init = Object.fromEntries(l.core.map((c) => [c.name, initialChipValue(c)]));
    expect(init).toMatchObject({ duration: 5, aspect_ratio: "16:9", generate_audio_switch: false });
    expect(["360p", "540p", "720p", "1080p"]).toContain(init.quality);
  });
});

describe("core settings are never hidden in Advanced", () => {
  it("duration, aspect, quality, audio and output count are core whenever the schema has them", () => {
    const core = /^(duration|aspect_ratio|resolution|quality|n|num_images)$/;
    for (const m of catalog.models) for (const v of m.variants) {
      const l = layoutFields(v.schema);
      for (const n of l.advanced) {
        const p = v.schema.properties![n];
        if (core.test(n) && (p.enum || p.type === "boolean" || p.type === "integer" || p.type === "number")) throw new Error(`${m.key}: ${n} in Advanced`);
      }
    }
  });

  it("required non-core fields (e.g. task_id for extend) are always visible", () => {
    const l = layoutFields(catalog.models.find((m) => m.key === "grok-imagine/extend")!.variants[0].schema);
    expect(l.required).toContain("task_id");
    expect(l.core.map((c) => c.name)).toContain("extend_times");
  });
});

describe("file limits from docs", () => {
  it("reads size and formats from the description", () => {
    const f = layoutFields(catalog.models.find((m) => m.key === "kling/v3-omni-image-to-video")!.variants[0].schema).refFields[0];
    expect(f.limits.maxBytes).toBe(50 * 1024 * 1024);
    expect(f.limits.formats).toEqual(expect.arrayContaining(["jpg", "png"]));
    expect(fileProblem({ name: "a.webp", type: "image/webp", size: 1000 }, f)).toMatch(/JPG/);
    expect(fileProblem({ name: "a.png", type: "image/png", size: 60 * 1024 * 1024 }, f)).toMatch(/50 MB/);
    expect(fileProblem({ name: "a.png", type: "image/png", size: 1000 }, f)).toBeNull();
  });
});

describe("references → request payload", () => {
  const fields = layoutFields(model("kling/v2-1-pro").variants[0].schema).refFields;

  it("fills required fields first and respects capacity", () => {
    const refs = assignTargets(
      [
        { id: "a", kind: "image", name: "a.png", value: "A", target: null },
        { id: "b", kind: "image", name: "b.png", value: "B", target: null },
        { id: "c", kind: "image", name: "c.png", value: "C", target: null },
      ],
      fields,
    );
    expect(refs.map((r) => r.target)).toEqual(["image_url", "tail_image_url", null]);
    const input = mergeRefs({ prompt: "x", duration: "5" }, refs, fields);
    expect(input).toEqual({ prompt: "x", duration: "5", image_url: "A", tail_image_url: "B" });
    expect(validateInput(model("kling/v2-1-pro").variants[0].schema, input).ok).toBe(true);
  });

  it("keeps a valid manual target", () => {
    const refs = assignTargets([{ id: "a", kind: "image", name: "a", value: "A", target: "tail_image_url" }], fields);
    expect(refs[0].target).toBe("tail_image_url");
  });

  it("puts multiple refs of an array field into an array", () => {
    const f = layoutFields(model("google/nano-banana-edit").variants[0].schema).refFields;
    const refs = assignTargets(
      [
        { id: "a", kind: "image", name: "a", value: "A", target: null },
        { id: "b", kind: "image", name: "b", value: "B", target: null },
      ],
      f,
    );
    expect(mergeRefs({}, refs, f)).toEqual({ image_urls: ["A", "B"] });
  });

  it("labels are stable: removing image_1 doesn't renumber, and numbers still in the prompt aren't reused", () => {
    expect(nextLabel([], "image")).toBe("image_1");
    expect(nextLabel([{ kind: "image", label: "image_2" }], "image")).toBe("image_3");
    expect(nextLabel([{ kind: "image", label: "image_1" }], "video")).toBe("video_1");
    expect(nextLabel([], "image", "a cat @image_4 waves")).toBe("image_5");
  });

  it("chip + advanced values produce the exact documented payload", () => {
    const schema = model("pixverse/text-to-video").variants[0].schema;
    const payload = pruneEmpty({ prompt: "boat", duration: 3, aspect_ratio: "16:9", quality: "360p", generate_audio_switch: false, seed: "" });
    const r = validateInput(schema, payload);
    expect(r).toEqual({ ok: true, value: { prompt: "boat", duration: 3, aspect_ratio: "16:9", quality: "360p", generate_audio_switch: false } });
  });
});

describe("model meta and presets", () => {
  it("summarizes price range, duration and audio", () => {
    const m = modelMeta(model("pixverse/text-to-video"));
    expect(m.maxDuration).toBe(15);
    expect(m.hasAudio).toBe(true);
    expect(m.minCredits).toBeLessThan(m.maxCredits!);
    expect(modelMeta(model("google/nano-banana-edit")).refKinds).toContain("image");
  });

  it("appends a preset phrase once", () => {
    const p = PRESETS[0];
    const once = applyPreset("A boat", p);
    expect(once).toBe(`A boat. ${p.phrase}`);
    expect(applyPreset(once, p)).toBe(once);
  });
});
