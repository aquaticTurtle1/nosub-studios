import { z } from "zod";
import { type CostEstimate, estimateCost, needsConfirmation } from "@/lib/catalog/pricing";
import { serializePrompt } from "@/lib/catalog/prompt-refs";
import { getModel } from "@/lib/catalog/registry";
import { validateInput } from "@/lib/catalog/schema";
import type { CatalogModel } from "@/lib/catalog/types";
import { KieError, serializeError } from "@/lib/kie/errors";

export const GenerateBody = z.object({
  modelKey: z.string().min(1),
  variant: z.string().nullable().optional(),
  input: z.record(z.string(), z.unknown()),
  idempotencyKey: z.string().uuid(),
  confirmed: z.boolean().optional(),
  /** Labels of attached references, for `@image_1` chips in the prompt. */
  references: z
    .array(z.object({ label: z.string().regex(/^(image|video|audio)_\d+$/), kind: z.enum(["image", "video", "audio"]), uri: z.string() }))
    .max(100)
    .optional(),
});
export type GenerateBody = z.infer<typeof GenerateBody>;

export type PrepareResult =
  | { ok: true; model: CatalogModel; variantTitle: string | null; input: Record<string, unknown>; estimate: CostEstimate }
  | { ok: false; status: 400 | 404 | 409 | 422; body: unknown };

/** Pure validation, prompt serialization and pricing — shared by the server route and the browser pipeline. */
export function prepareGeneration(body: GenerateBody): PrepareResult {
  const { modelKey, variant, input: raw, confirmed, references } = body;

  const model = getModel(modelKey);
  if (!model) return { ok: false, status: 404, body: { error: serializeError(new KieError("not_found", `Unknown model ${modelKey}`)) } };
  const v = model.variants.find((x) => x.title === variant) ?? model.variants[0];

  // Reference chips become the model's documented token, or plain words (see lib/catalog/prompt-refs.ts).
  const prompt = serializePrompt(raw, v.schema, model.promptReferenceSyntax, references ?? []);
  if (prompt.problems.length) {
    return { ok: false, status: 422, body: { error: serializeError(new KieError("validation", `${prompt.problems[0]}.`)) } };
  }

  // Validation against the documented schema before anything reaches Kie.ai.
  const check = validateInput(v.schema, prompt.input);
  if (!check.ok) {
    return {
      ok: false,
      status: 422,
      body: { error: { kind: "validation", label: "Invalid settings", message: "Input does not match the documented schema" }, issues: check.issues },
    };
  }

  const estimate = estimateCost(model.pricing, check.value, model.free);
  if (needsConfirmation(model.category, estimate) && !confirmed) {
    return { ok: false, status: 409, body: { needsConfirmation: true, estimate } };
  }
  return { ok: true, model, variantTitle: model.variants.length > 1 ? v.title : null, input: check.value, estimate };
}
