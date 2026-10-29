import { bad, gate, ModeParam, readJson } from "@/lib/cloud/server/api";
import { getDraft, putDraft } from "@/lib/cloud/server/history";
import { noStore } from "@/lib/server/http";

export async function GET(req: Request, ctx: RouteContext<"/api/cloud/drafts/[mode]">) {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const mode = ModeParam.safeParse((await ctx.params).mode);
  if (!mode.success) return bad("Invalid mode");
  return noStore({ draft: await getDraft(g.owner, mode.data) });
}

export async function PUT(req: Request, ctx: RouteContext<"/api/cloud/drafts/[mode]">) {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const mode = ModeParam.safeParse((await ctx.params).mode);
  if (!mode.success) return bad("Invalid mode");
  const body = await readJson(req);
  if (body instanceof Response) return body;
  const v = body.value;
  if (!v || typeof v !== "object" || Array.isArray(v)) return bad("Draft must be an object");
  await putDraft(g.owner, mode.data, v);
  return noStore({ ok: true });
}
