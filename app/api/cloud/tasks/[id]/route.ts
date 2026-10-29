import { gate } from "@/lib/cloud/server/api";
import { getTask } from "@/lib/cloud/server/history";
import { noStore } from "@/lib/server/http";

export async function GET(req: Request, ctx: RouteContext<"/api/cloud/tasks/[id]">) {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  const task = await getTask(g.owner, id);
  if (!task) return noStore({ error: "Not found" }, { status: 404 });
  return noStore({ task });
}
