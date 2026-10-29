import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import type { Catalog } from "@/lib/catalog/types";
import { type GenerateBody, prepareGeneration } from "@/lib/generation/prepare";

const catalog = data as unknown as Catalog;
const A = "https://example.com/first.jpg";
const ID = "11111111-1111-4111-8111-111111111111";
const KEY = "minimax-h3/image-to-video";

const body = (over: Partial<GenerateBody> = {}): GenerateBody => ({
  modelKey: KEY,
  input: { prompt: "a red kite", first_frame_url: A, duration: 15, resolution: "2K" },
  idempotencyKey: ID,
  ...over,
});

describe("prepareGeneration", () => {
  it("unknown model -> 404", () => {
    const r = prepareGeneration(body({ modelKey: "nope/none" }));
    expect(r).toMatchObject({ ok: false, status: 404 });
    expect((r as { body: { error: { kind: string } } }).body.error.kind).toBe("not_found");
  });

  it("invalid input -> 422 with issues", () => {
    const r = prepareGeneration(body({ input: { prompt: "x", duration: 99 } }));
    expect(r).toMatchObject({ ok: false, status: 422 });
    const b = (r as { body: { error: { kind: string }; issues: unknown[] } }).body;
    expect(b.error.kind).toBe("validation");
    expect(b.issues.length).toBeGreaterThan(0);
  });

  it("expensive without confirmed -> 409 with estimate; confirmed passes", () => {
    const r = prepareGeneration(body());
    expect(r).toMatchObject({ ok: false, status: 409 });
    expect((r as { body: { needsConfirmation: boolean; estimate: unknown } }).body.needsConfirmation).toBe(true);
    expect((r as { body: { estimate: unknown } }).body.estimate).toBeTruthy();
    expect(prepareGeneration(body({ confirmed: true })).ok).toBe(true);
  });

  it("valid -> ok with serialized prompt", () => {
    const r = prepareGeneration(body({ input: { prompt: "@image_1 flies", first_frame_url: A, duration: 4, resolution: "768P" }, references: [{ label: "image_1", kind: "image", uri: A }] }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.model.key).toBe(KEY);
    expect(r.input.first_frame_url).toBe(A);
    expect(typeof r.input.prompt).toBe("string");
    expect(r.input.prompt).not.toContain("@image_1");
    expect(r.estimate).toBeTruthy();
    expect(r.variantTitle === null || typeof r.variantTitle === "string").toBe(true);
    expect(catalog.models.some((m) => m.key === KEY)).toBe(true);
  });
});
