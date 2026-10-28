import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { FAMILIES, familiesFor, familyHasExtend, familyKinds, familyNeedsRef, resolveMember } from "@/lib/catalog/families";
import { modelMeta } from "@/lib/catalog/meta";
import type { Catalog, CatalogSummary } from "@/lib/catalog/types";
import { layoutFields } from "@/lib/ui/fields";

const catalog = data as unknown as Catalog;
const summaries: CatalogSummary[] = catalog.models.map((m) => ({
  key: m.key,
  modelId: m.modelId,
  title: m.title,
  provider: m.provider,
  family: m.family,
  category: m.category,
  operation: m.operation,
  issues: m.issues,
  free: m.free,
  meta: modelMeta(m),
}));
const fam = (id: string) => familiesFor("video", summaries).find((f) => f.id === id)!;
const none = { image: 0, video: 0, audio: 0 };

describe("families", () => {
  it("every family member is a real catalog key, used once", () => {
    const keys = new Set(catalog.models.map((m) => m.key));
    const seen = new Set<string>();
    for (const f of FAMILIES) {
      for (const k of f.members) {
        expect(keys.has(k), `${f.id}: ${k}`).toBe(true);
        expect(seen.has(k), `duplicate ${k}`).toBe(false);
        seen.add(k);
      }
    }
  });

  it("every video catalog entry is reachable through some family", () => {
    const reachable = new Set(familiesFor("video", summaries).flatMap((f) => f.entries.map((e) => e.key)));
    for (const m of catalog.models.filter((x) => x.category === "video")) expect(reachable.has(m.key), m.key).toBe(true);
  });

  it("routes PixVerse V6 by attachment", () => {
    const f = fam("pixverse-v6");
    expect(resolveMember(f, none)?.key).toBe("pixverse/text-to-video");
    expect(resolveMember(f, { ...none, image: 1 })?.key).toBe("pixverse/image-to-video");
    expect(resolveMember(f, { ...none, image: 5 })?.key).toBe("pixverse/reference-to-video");
    expect(resolveMember(f, { ...none, video: 1 })?.key).toBe("pixverse/extend");
    expect(resolveMember(f, none, true)?.key).toBe("pixverse/extend");
    expect(familyHasExtend(f)).toBe(true);
    expect(familyKinds(f)).toEqual(["image"]);
  });

  it("routes Wan 2.7 video to video edit and Kling Omni images to image-to-video", () => {
    expect(resolveMember(fam("wan-2-7"), { ...none, video: 1 })?.key).toBe("wan/2-7-videoedit");
    expect(resolveMember(fam("kling-3-0-omni"), { ...none, image: 1 })?.key).toBe("kling/v3-omni-image-to-video");
    expect(resolveMember(fam("kling-3-0-omni"), none)?.key).toBe("kling/v3-omni-text-to-video");
  });

  it("families with only image-to-video need a reference", () => {
    expect(familyNeedsRef(fam("hailuo-2-3-pro"))).toBe(true);
    expect(familyNeedsRef(fam("pixverse-v6"))).toBe(false);
    expect(resolveMember(fam("hailuo-2-3-pro"), none)?.key).toBe("hailuo/2-3-image-to-video-pro");
  });

  it("returns null when nothing in the family takes the attachment", () => {
    expect(resolveMember(fam("pixverse-v6"), { ...none, audio: 1 })).toBeNull();
  });
});

describe("reference detection (bug: PixVerse V6 Image-to-Video had no References box)", () => {
  it("finds media inputs whose description never says 'URL'", () => {
    const l = layoutFields(catalog.models.find((m) => m.key === "pixverse/image-to-video")!.variants[0].schema);
    expect(l.refFields.map((r) => r.name)).toEqual(["image_urls"]);
  });

  it("every video model that needs media has a References field", () => {
    for (const m of catalog.models.filter((x) => x.category === "video")) {
      const anyRefs = m.variants.some((v) => layoutFields(v.schema).refFields.length > 0);
      if (/image-to|reference|video-to|keyframe|avatar|lip|motion/.test(m.operation)) expect(anyRefs, m.key).toBe(true);
    }
  });

  it("maps object-array references (image_references[].image_url)", () => {
    const l = layoutFields(catalog.models.find((m) => m.key === "pixverse/reference-to-video")!.variants[0].schema);
    expect(l.refFields).toEqual([expect.objectContaining({ name: "image_references", itemKey: "image_url", capacity: 7, kinds: ["image"] })]);
  });
});

describe("image and audio families", () => {
  const famIn = (category: "image" | "audio", id: string) => familiesFor(category, summaries).find((f) => f.id === id)!;

  it("every image and audio catalog entry is reachable", () => {
    for (const category of ["image", "audio"] as const) {
      const reachable = new Set(familiesFor(category, summaries).flatMap((f) => f.entries.map((e) => e.key)));
      for (const m of catalog.models.filter((x) => x.category === category)) expect(reachable.has(m.key), m.key).toBe(true);
    }
  });

  it("image pairs route text → text-to-image, attached image → edit", () => {
    expect(resolveMember(famIn("image", "nano-banana"), none)?.key).toBe("google/nano-banana");
    expect(resolveMember(famIn("image", "nano-banana"), { ...none, image: 2 })?.key).toBe("google/nano-banana-edit");
    expect(resolveMember(famIn("image", "seedream-5-pro"), { ...none, image: 1 })?.key).toBe("seedream/5-pro-image-to-image");
    expect(resolveMember(famIn("image", "gpt-image-2"), none)?.key).toBe("gpt/gpt-image-2-text-to-image");
  });

  it("a lone extend model is an ordinary model with References (Suno Upload And Extend)", () => {
    const f = famIn("audio", "suno-upload-extend");
    expect(familyKinds(f)).toEqual(["audio"]);
    expect(familyHasExtend(f)).toBe(false);
    expect(resolveMember(f, { ...none, audio: 1 })?.key).toBe("suno-api/upload-and-extend-audio");
    expect(familyNeedsRef(f)).toBe(true);
  });

  it("video families keep their Extend tab", () => {
    expect(familyHasExtend(fam("pixverse-v6"))).toBe(true);
    expect(familyKinds(fam("pixverse-v6"))).toEqual(["image"]);
  });
});
