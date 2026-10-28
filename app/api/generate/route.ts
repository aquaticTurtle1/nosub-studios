import { z } from "zod";
import { estimateCost, needsConfirmation } from "@/lib/catalog/pricing";
import { getModel } from "@/lib/catalog/registry";
import { validateInput } from "@/lib/catalog/schema";
import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { resolveApiKey } from "@/lib/server/key";
import { submitTask } from "@/lib/server/tasks";

const Body = z.object({
  modelKey: z.string().min(1),
  variant: z.string().nullable().optional(),
  input: z.record(z.string(), z.unknown()),
  idempotencyKey: z.string().uuid(),
  confirmed: z.boolean().optional(),
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
  const { modelKey, variant, input, idempotencyKey, confirmed } = parsed.data;

  const { key } = await resolveApiKey();
  if (!key) return errorResponse(new KieError("missing_key", "Connect an API key first."));

  const model = getModel(modelKey);
  if (!model) return errorResponse(new KieError("not_found", `Unknown model ${modelKey}`));
  const v = model.variants.find((x) => x.title === variant) ?? model.variants[0];

  // Server-side validation against the documented schema before anything reaches Kie.ai.
  const check = validateInput(v.schema, input);
  if (!check.ok) {
    return noStore({ error: { kind: "validation", label: "Invalid settings", message: "Input does not match the documented schema" }, issues: check.issues }, { status: 422 });
  }

  const estimate = estimateCost(model.pricing, check.value, model.free);
  if (needsConfirmation(model.category, estimate) && !confirmed) {
    return noStore({ needsConfirmation: true, estimate }, { status: 409 });
  }

  try {
    const { task, duplicate } = await submitTask({
      model,
      variant: model.variants.length > 1 ? v.title : null,
      input: check.value,
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
