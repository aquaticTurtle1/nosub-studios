import { getModel } from "@/lib/catalog/registry";

export async function GET(_req: Request, ctx: RouteContext<"/api/catalog/[...key]">) {
  const { key } = await ctx.params;
  const model = getModel(key.map(decodeURIComponent).join("/"));
  if (!model) return Response.json({ error: { kind: "not_found", message: "Unknown model" } }, { status: 404 });
  return Response.json(model);
}
