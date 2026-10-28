import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { familiesFor } from "@/lib/catalog/families";
import { modelMeta } from "@/lib/catalog/meta";
import type { Catalog, CatalogSummary } from "@/lib/catalog/types";
import { kindCapacity, layoutFields } from "@/lib/ui/fields";
import { collectLocalUris, outputUri, parseLocalUri, previewUrl, replaceLocalUris, uploadUri } from "@/lib/ui/local-ref";
import { assignTargets, mergeRefs } from "@/lib/ui/request";

const catalog = data as unknown as Catalog;
const model = (key: string) => catalog.models.find((m) => m.key === key)!;
const caps = (key: string) => kindCapacity(layoutFields(model(key).variants[0].schema).refFields);

describe("reference limits come from the schema", () => {
  it("Seedance 2.5: frames OR up to 30 images, 10 videos, 10 audio — not 52", () => {
    // 52 was 1 + 1 + 30 + 10 + 10: every field summed, although the docs say the
    // first/last frame fields are mutually exclusive with the reference_* lists.
    expect(caps("bytedance/seedance-2-5")).toEqual({ image: 30, video: 10, audio: 10 });
  });

  it("fields that can be combined still add up", () => {
    expect(caps("kling/v4-keyframe-to-video").image).toBe(10); // first + 8 keyframes + last
    expect(caps("pixverse/transition").image).toBe(2);
    expect(caps("pixverse/reference-to-video").image).toBe(7);
  });

  it("family limits are the largest entry's, per kind", () => {
    const summaries: CatalogSummary[] = catalog.models.map((m) => ({ ...m, meta: modelMeta(m) }) as unknown as CatalogSummary);
    const pv = familiesFor("video", summaries).find((f) => f.id === "pixverse-v6")!;
    const image = Math.max(...pv.entries.filter((e) => e.operation !== "extend").map((e) => e.meta.refCapacity.image));
    expect(image).toBe(7);
  });
});

describe("local references", () => {
  const id = "0b6f0a3e-6d7c-4f7e-9a51-2a2f1c9c1d10";

  it("round-trips upload and output URIs and rejects traversal", () => {
    expect(parseLocalUri(uploadUri(id))).toEqual({ source: "upload", id });
    expect(parseLocalUri(outputUri("task_1/01.png"))).toEqual({ source: "output", path: "task_1/01.png" });
    expect(parseLocalUri("local://output/../studio.db")).toBeNull();
    expect(parseLocalUri("local://upload/not-an-id")).toBeNull();
    expect(previewUrl(uploadUri(id))).toBe(`/api/uploads/${id}`);
    expect(previewUrl(outputUri("task 1/01.png"))).toBe("/api/files/task%201/01.png");
  });

  it("a dropped file and a library pick both land in the schema's reference field", () => {
    const fields = layoutFields(model("pixverse/reference-to-video").variants[0].schema).refFields;
    const refs = assignTargets(
      [
        { id: "a", kind: "image" as const, name: "drop.png", value: uploadUri(id), target: null },
        { id: "b", kind: "image" as const, name: "gen.png", value: outputUri("task_1/01.png"), target: null },
      ],
      fields,
    );
    const input: Record<string, unknown> = mergeRefs({ prompt: "x" } as Record<string, unknown>, refs, fields);
    expect(input.image_references).toEqual([{ image_url: uploadUri(id) }, { image_url: outputUri("task_1/01.png") }]);
    expect(collectLocalUris(input)).toHaveLength(2);
    const sent = replaceLocalUris(input, new Map([[uploadUri(id), "https://kie/1.png"], [outputUri("task_1/01.png"), "https://kie/2.png"]]));
    expect(sent).toEqual({ prompt: "x", image_references: [{ image_url: "https://kie/1.png" }, { image_url: "https://kie/2.png" }] });
  });
});
