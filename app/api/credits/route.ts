import { getCredits } from "@/lib/kie/client";
import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { resolveApiKey } from "@/lib/server/key";

export async function GET() {
  const { key, source } = await resolveApiKey();
  if (!key) return errorResponse(new KieError("missing_key", "Connect an API key first."), { source });
  try {
    return noStore({ balance: await getCredits(key), source, checkedAt: Date.now() });
  } catch (e) {
    return errorResponse(e, { source });
  }
}
