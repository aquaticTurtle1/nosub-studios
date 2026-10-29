import { localOnly } from "@/lib/server/mode-guard";
import { z } from "zod";
import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { resolveApiKey } from "@/lib/server/key";
import { getTask, pollTask, resumeTracking, retryDownloads, stopTracking } from "@/lib/server/tasks";

/** Returns the task, polling Kie.ai first when the backoff schedule says it is due. */
export async function GET(_req: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  const off = localOnly();
  if (off) return off;
  const { id } = await ctx.params;
  const { key } = await resolveApiKey();
  const task = await pollTask(id, key);
  if (!task) return errorResponse(new KieError("not_found", "Unknown task"));
  return noStore({ task, keyMissing: !key });
}

const Action = z.object({ action: z.enum(["stop", "resume", "redownload", "poll"]) });

export async function POST(req: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  const off = localOnly();
  if (off) return off;
  const { id } = await ctx.params;
  const parsed = Action.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse(new KieError("validation", "Unknown action"));
  if (!getTask(id)) return errorResponse(new KieError("not_found", "Unknown task"));
  const { key } = await resolveApiKey();
  switch (parsed.data.action) {
    case "stop":
      return noStore({ task: stopTracking(id) });
    case "resume":
      resumeTracking(id);
      return noStore({ task: await pollTask(id, key, { force: true }) });
    case "poll":
      return noStore({ task: await pollTask(id, key, { force: true }) });
    case "redownload":
      return noStore({ task: await retryDownloads(id, key) });
  }
}
