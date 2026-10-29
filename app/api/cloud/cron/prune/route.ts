import { prune } from "@/lib/cloud/server/history";
import { pruneRate } from "@/lib/cloud/server/rate-limit";
import { noStore } from "@/lib/server/http";
import { cloudOnly } from "@/lib/server/mode-guard";

export async function GET(req: Request) {
  const off = cloudOnly();
  if (off) return off;
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return noStore({ error: "Unauthorized" }, { status: 401 });
  }
  const now = Date.now();
  await prune(now);
  await pruneRate(now);
  return noStore({ ok: true });
}
