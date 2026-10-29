import { localOnly } from "@/lib/server/mode-guard";
import { GenerateBody, prepareGeneration } from "@/lib/generation/prepare";
import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { resolveApiKey } from "@/lib/server/key";
import { resolveLocalRefs } from "@/lib/server/local-refs";
import { submitTask } from "@/lib/server/tasks";

function callBackUrl(): string | undefined {
  if (process.env.KIE_WEBHOOK_ENABLED !== "1") return undefined;
  const base = process.env.KIE_PUBLIC_URL?.replace(/\/$/, "");
  if (!base || !process.env.KIE_WEBHOOK_HMAC_KEY) return undefined;
  return `${base}/api/webhook/kie`;
}

export async function POST(req: Request) {
  const off = localOnly();
  if (off) return off;
  const parsed = GenerateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse(new KieError("validation", "Malformed generate request"));
  const { idempotencyKey } = parsed.data;

  const { key } = await resolveApiKey();
  if (!key) return errorResponse(new KieError("missing_key", "Connect an API key first."));

  const prep = prepareGeneration(parsed.data);
  if (!prep.ok) return noStore(prep.body, { status: prep.status });
  const { model, variantTitle, estimate } = prep;

  try {
    // References are local files until now; upload them so the Kie.ai URLs are fresh.
    const input = await resolveLocalRefs(prep.input, key);
    const { task, duplicate } = await submitTask({
      model,
      variant: variantTitle,
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
