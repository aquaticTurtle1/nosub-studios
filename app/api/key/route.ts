import { z } from "zod";
import { getCredits } from "@/lib/kie/client";
import { KieError, serializeError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { clearKeyCookie, resolveApiKey, setKeyCookie } from "@/lib/server/key";

/** Key status only — the key itself is never returned. */
export async function GET() {
  const { key, source } = await resolveApiKey();
  return noStore({ configured: Boolean(key), source });
}

const Body = z.object({ key: z.string().trim().min(8).max(512) });

/** Saves the key in an HTTP-only cookie, then checks it against the credit endpoint. */
export async function POST(req: Request) {
  const { source } = await resolveApiKey();
  if (source === "env") {
    return errorResponse(new KieError("validation", "KIE_API_KEY is set in .env.local and takes priority; remove it there first."));
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse(new KieError("validation", "Paste the complete API key."));
  await setKeyCookie(parsed.data.key);
  try {
    const balance = await getCredits(parsed.data.key);
    return noStore({ saved: true, valid: true, balance });
  } catch (e) {
    // Saved, but report the exact error from the credit check.
    return noStore({ saved: true, valid: false, error: serializeError(e) });
  }
}

export async function DELETE() {
  const { source } = await resolveApiKey();
  await clearKeyCookie();
  return noStore({ removed: true, envStillActive: source === "env" });
}
