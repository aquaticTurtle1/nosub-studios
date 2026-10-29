import { z } from "zod";
import { bad, gate, readJson, TaskRecordSchema } from "@/lib/cloud/server/api";
import { listTasks, saveTasks } from "@/lib/cloud/server/history";
import { noStore } from "@/lib/server/http";
import type { TaskRecord } from "@/lib/task-types";

const Batch = z.object({ tasks: z.array(TaskRecordSchema).max(50) });

export async function GET(req: Request) {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const q = new URL(req.url).searchParams;
  const limit = Number(q.get("limit"));
  const tasks = await listTasks(g.owner, {
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    category: q.get("category") || undefined,
    activeOnly: q.get("active") === "1",
  });
  return noStore({ tasks });
}

export async function POST(req: Request) {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const body = await readJson(req);
  if (body instanceof Response) return body;
  const parsed = Batch.safeParse(body.value);
  if (!parsed.success) return bad("Invalid tasks");
  await saveTasks(g.owner, parsed.data.tasks as unknown as TaskRecord[]);
  return noStore({ saved: parsed.data.tasks.length });
}
