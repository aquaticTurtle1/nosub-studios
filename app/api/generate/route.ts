import { z } from "zod";
import { estimateCost, needsConfirmation } from "@/lib/catalog/pricing";
import { serializePrompt } from "@/lib/catalog/prompt-refs";
import { getModel } from "@/lib/catalog/registry";
import { validateInput } from "@/lib/catalog/schema";
import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { resolveApiKey } from "@/lib/server/key";
import { resolveLocalRefs } from "@/lib/server/local-refs";
import { submitTask } from "@/lib/server/tasks";

const Body = z.object({
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

function callBackUrl(): string | undefined {
  if (process.env.KIE_WEBHOOK_ENABLED !== "1") return undefined;
  const base = process.env.KIE_PUBLIC_URL?.replace(/\/$/, "");
  if (!base || !process.env.KIE_WEBHOOK_HMAC_KEY) return undefined;
  return `${base}/api/webhook/kie`;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse(new KieError("validation", "Malformed generate request"));
  const { modelKey, variant, input: raw, idempotencyKey, confirmed, references } = parsed.data;

  const { key } = await resolveApiKey();
  if (!key) return errorResponse(new KieError("missing_key", "Connect an API key first."));

  const model = getModel(modelKey);
  if (!model) return errorResponse(new KieError("not_found", `Unknown model ${modelKey}`));
  const v = model.variants.find((x) => x.title === variant) ?? model.variants[0];

  // Reference chips become the model's documented token, or plain words (see lib/catalog/prompt-refs.ts).
  const prompt = serializePrompt(raw, v.schema, model.promptReferenceSyntax, references ?? []);
  if (prompt.problems.length) return errorResponse(new KieError("validation", `${prompt.problems[0]}.`));

  // Server-side validation against the documented schema before anything reaches Kie.ai.
  const check = validateInput(v.schema, prompt.input);
  if (!check.ok) {
    return noStore({ error: { kind: "validation", label: "Invalid settings", message: "Input does not match the documented schema" }, issues: check.issues }, { status: 422 });
  }

  const estimate = estimateCost(model.pricing, check.value, model.free);
  if (needsConfirmation(model.category, estimate) && !confirmed) {
    return noStore({ needsConfirmation: true, estimate }, { status: 409 });
  }

  try {
    // References are local files until now; upload them so the Kie.ai URLs are fresh.
    const input = await resolveLocalRefs(check.value, key);
    const { task, duplicate } = await submitTask({
      model,
      variant: model.variants.length > 1 ? v.title : null,
      input,
      idempotencyKey,
      estimate,
      key,
      callBackUrl: callBackUrl(),
    });
    return noStore({ task, duplicate });
  } catch (e) {
    return errorResponse(e);
  }
}
