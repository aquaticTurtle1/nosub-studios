import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { chipLabels, serializePrompt } from "@/lib/catalog/prompt-refs";
import { DOCUMENTED_SYNTAX } from "@/lib/catalog/prompt-syntax";
import type { Catalog } from "@/lib/catalog/types";
import { layoutFields } from "@/lib/ui/fields";

const catalog = data as unknown as Catalog;
const model = (key: string) => catalog.models.find((m) => m.key === key)!;
const run = (key: string, input: Record<string, unknown>, refs: { label: string; kind: "image" | "video" | "audio"; uri: string }[]) => {
  const m = model(key);
  return serializePrompt(input, m.variants[0].schema, m.promptReferenceSyntax, refs);
};
const A = "local://upload/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "local://upload/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const V = "local://upload/cccccccc-cccc-4ccc-8ccc-cccccccccccc";

describe("catalog promptReferenceSyntax", () => {
  it("every model that takes references has one; documented ones link their docs page", () => {
    for (const m of catalog.models) {
      const refs = m.variants.some((v) => layoutFields(v.schema).refFields.length > 0);
      if (!refs) expect(m.promptReferenceSyntax).toBeUndefined();
      else if (DOCUMENTED_SYNTAX[m.key]) expect(m.promptReferenceSyntax).toMatchObject({ kind: "token", source: m.docUrl });
      else expect(m.promptReferenceSyntax).toEqual({ kind: "none", unverified: true });
    }
  });

  it("documented field names exist in the schema", () => {
    for (const [key, s] of Object.entries(DOCUMENTED_SYNTAX)) {
      const names = layoutFields(model(key).variants[0].schema).refFields.map((f) => f.name);
      for (const f of [...(s.fields ?? []), ...Object.keys(s.fieldFormats ?? {})]) expect(names, `${key}: ${f}`).toContain(f);
    }
  });

  it("identical docs variants are collapsed (MiniMax H3 had Variant 1 / Variant 2)", () => {
    for (const m of catalog.models) for (const v of m.variants) expect(v.title, m.key).not.toMatch(/^Variant \d+$/);
    expect(model("minimax-h3/image-to-video").variants).toHaveLength(1);
  });
});

describe("serializePrompt — token models", () => {
  it("Kling 4.0 Reference: @image_N / @video_N by position in the sent arrays", () => {
    const r = run("kling/v4-reference-to-video", { prompt: "@video_1 then @image_2 holds @image_1", image_urls: [B, A], video_urls: [V] }, [
      { label: "image_1", kind: "image", uri: A },
      { label: "image_2", kind: "image", uri: B },
      { label: "video_1", kind: "video", uri: V },
    ]);
    // image_2 (B) is sent first, so the model calls it @image_1.
    expect(r.input.prompt).toBe("@video_1 then @image_1 holds @image_2");
    expect(r.hint).toBeNull();
    expect(r.problems).toEqual([]);
  });

  it("HappyHorse 1.1, Wan 3.0, Grok: their own formats", () => {
    expect(run("happyhorse-1-1/reference-to-video", { prompt: "the cat in @image_1", reference_image: [A] }, [{ label: "image_1", kind: "image", uri: A }]).input.prompt).toBe(
      "the cat in [Image 1]",
    );
    expect(
      run("wan/3-0-video", { prompt: "@image_1 dances to @audio_1", reference_image_urls: [A], reference_audio_urls: [V] }, [
        { label: "image_1", kind: "image", uri: A },
        { label: "audio_1", kind: "audio", uri: V },
      ]).input.prompt,
    ).toBe("Image1 dances to Audio1");
    expect(run("grok-imagine/image-to-video", { prompt: "@image_2 waves", image_urls: [A, B] }, [{ label: "image_2", kind: "image", uri: B }]).input.prompt).toBe("@image2 waves");
  });

  it("Kling 4.0 Keyframes: field-specific tokens", () => {
    const r = run("kling/v4-keyframe-to-video", { prompt: "from @image_1 to @image_3 via @image_2", first_frame_url: A, keyframe_urls: [B], last_frame_url: V }, [
      { label: "image_1", kind: "image", uri: A },
      { label: "image_2", kind: "image", uri: B },
      { label: "image_3", kind: "image", uri: V },
    ]);
    expect(r.input.prompt).toBe("from @first_frame to @last_frame via @keyframe_1");
  });

  it("PixVerse reference-to-video: the label is sent as ref_name and named with @", () => {
    const r = run("pixverse/reference-to-video", { prompt: "@image_2 chases @image_1", image_references: [{ image_url: A }, { image_url: B }] }, [
      { label: "image_1", kind: "image", uri: A },
      { label: "image_2", kind: "image", uri: B },
    ]);
    expect(r.input.prompt).toBe("@image_2 chases @image_1");
    expect(r.input.image_references).toEqual([
      { image_url: A, ref_name: "image_1" },
      { image_url: B, ref_name: "image_2" },
    ]);
  });

  it("Wan 3.0 first frame is outside reference mode → words + hint", () => {
    const r = run("wan/3-0-video", { prompt: "@image_1 smiles", first_frame_url: A }, [{ label: "image_1", kind: "image", uri: A }]);
    expect(r.input.prompt).toBe("the first frame image smiles");
    expect(r.hint).toBe("This model names only its reference inputs. image_1 is used as the first frame.");
  });
});

describe("serializePrompt — models without a documented syntax", () => {
  it("MiniMax H3 image-to-video: role words and a hint", () => {
    const r = run("minimax-h3/image-to-video", { prompt: "@image_1 walks into the rain", first_frame_url: A }, [{ label: "image_1", kind: "image", uri: A }]);
    expect(r.input.prompt).toBe("the first frame image walks into the rain");
    expect(r.hint).toBe("This model doesn't read references by name. image_1 is used as the first frame.");
  });

  it("Seedance 2.5 reference images: ordinals in send order", () => {
    const r = run("bytedance/seedance-2-5", { prompt: "@image_1 hands a cup to @image_2", reference_image_urls: [A, B] }, [
      { label: "image_1", kind: "image", uri: A },
      { label: "image_2", kind: "image", uri: B },
    ]);
    expect(r.input.prompt).toBe("the reference image hands a cup to the second reference image");
    expect(r.hint).toContain("image_1 is the reference image, image_2 is the second reference image");
  });

  it("a chip whose reference was removed is a problem, not silently renumbered", () => {
    const r = run("bytedance/seedance-2-5", { prompt: "@image_1 and @image_2", reference_image_urls: [A] }, [{ label: "image_1", kind: "image", uri: A }]);
    expect(r.problems).toEqual(["image_2 is no longer attached"]);
  });

  it("no chips → input unchanged", () => {
    const input = { prompt: "a boat", first_frame_url: A };
    expect(run("minimax-h3/image-to-video", input, []).input).toBe(input);
    expect(chipLabels("@image_1 and @video_12 but not @imagex")).toEqual(["image_1", "video_12"]);
  });
});
