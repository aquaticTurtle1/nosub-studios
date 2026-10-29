import { localOnly } from "@/lib/server/mode-guard";
import fs from "node:fs";
import path from "node:path";
import { resolveOutputPath } from "@/lib/server/storage";
import { getTask } from "@/lib/server/tasks";
import { zip } from "@/lib/zip";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/** Library "Download": the local files of the chosen tasks as one ZIP (?tasks=id,id,…). */
export async function GET(req: Request) {
  const off = localOnly();
  if (off) return off;
  const ids = (new URL(req.url).searchParams.get("tasks") ?? "").split(",").filter(Boolean).slice(0, 200);
  const entries: { name: string; data: Uint8Array; date: Date }[] = [];
  for (const id of ids) {
    const t = getTask(id);
    if (!t) continue;
    const day = new Date(t.createdAt).toISOString().slice(0, 10);
    for (const o of t.outputs) {
      const full = o.localPath ? resolveOutputPath(o.localPath) : null;
      if (!full) continue;
      entries.push({ name: `${day}-${slug(t.modelTitle)}-${t.id.slice(0, 8)}/${path.basename(full)}`, data: fs.readFileSync(full), date: new Date(t.createdAt) });
    }
  }
  if (!entries.length) return new Response("No local files for these generations", { status: 404 });
  return new Response(zip(entries), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="studio-${new Date().toISOString().slice(0, 10)}-${entries.length}-files.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
