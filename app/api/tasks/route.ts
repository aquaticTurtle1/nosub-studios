import { localOnly } from "@/lib/server/mode-guard";
import { noStore } from "@/lib/server/http";
import { listTasks } from "@/lib/server/tasks";

export async function GET(req: Request) {
  const off = localOnly();
  if (off) return off;
  const url = new URL(req.url);
  const tasks = listTasks({
    limit: Math.min(Number(url.searchParams.get("limit")) || 200, 1000),
    activeOnly: url.searchParams.get("active") === "1",
    category: url.searchParams.get("category") || undefined,
  });
  return noStore({ tasks });
}
