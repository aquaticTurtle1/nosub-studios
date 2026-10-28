import { z } from "zod";
import { KieError } from "@/lib/kie/errors";
import { readDraft, writeDraft } from "@/lib/server/drafts";
import { errorResponse, noStore } from "@/lib/server/http";
import { localFile } from "@/lib/server/local-refs";
import { isLocalUri } from "@/lib/ui/local-ref";

/** A page's draft key: the mode, or `tools.<tool id>` for a tool panel. */
const KEY = /^(image|video|audio|tools)(\.[a-z0-9-]{1,60})?$/;

const DraftRef = z.object({
  uri: z.string().refine(isLocalUri, "References are stored as local files only"),
  kind: z.enum(["image", "video", "audio"]),
  label: z.string().regex(/^(image|video|audio)_[0-9]+$/).optional(),
  name: z.string().max(300),
  mime: z.string().max(100),
  size: z.number().nonnegative(),
  duration: z.number().nullable().optional(),
  target: z.string().nullable(),
});

const Draft = z.object({
  familyId: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
  modelKey: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
  extendMode: z.boolean().optional(),
  values: z.record(z.string(), z.unknown()).optional(),
  refs: z.array(DraftRef).max(100).optional(),
});

export type DraftBody = z.infer<typeof Draft>;

/** Per-mode panel draft. References whose local file is gone are left out and named in `dropped`. */
export async function GET(_req: Request, ctx: RouteContext<"/api/drafts/[mode]">) {
  const { mode } = await ctx.params;
  if (!KEY.test(mode)) return errorResponse(new KieError("not_found", "Unknown mode"));
  const parsed = Draft.safeParse(readDraft(mode));
  if (!parsed.success) return noStore({ draft: null, dropped: [] });
  const refs = parsed.data.refs ?? [];
  const kept = refs.filter((r) => localFile(r.uri));
  const dropped = refs.filter((r) => !kept.includes(r)).map((r) => r.name);
  // Read-only: the page saves the cleaned draft itself (a second read must report the same).
  return noStore({ draft: { ...parsed.data, refs: kept }, dropped });
}

export async function PUT(req: Request, ctx: RouteContext<"/api/drafts/[mode]">) {
  const { mode } = await ctx.params;
  if (!KEY.test(mode)) return errorResponse(new KieError("not_found", "Unknown mode"));
  const parsed = Draft.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse(new KieError("validation", "Malformed draft"));
  writeDraft(mode, parsed.data);
  return noStore({ ok: true });
}
