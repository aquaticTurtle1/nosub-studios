import { isTerminal, type TaskRecord } from "@/lib/task-types";

const freshness = (t: TaskRecord) => t.lastPolledAt ?? t.createdAt;

/** Merge local and remote history by id: terminal copy wins, else the fresher one. Newest first. */
export function mergeTasks(local: TaskRecord[], remote: TaskRecord[]): TaskRecord[] {
  const byId = new Map<string, TaskRecord>();
  for (const t of [...local, ...remote]) {
    const cur = byId.get(t.id);
    if (!cur) {
      byId.set(t.id, t);
      continue;
    }
    const a = isTerminal(cur.state);
    const b = isTerminal(t.state);
    if (a !== b) {
      if (b) byId.set(t.id, t);
    } else if (freshness(t) > freshness(cur)) byId.set(t.id, t);
  }
  return [...byId.values()].sort((x, y) => y.createdAt - x.createdAt);
}
