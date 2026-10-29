import { daysLeft } from "@/lib/cloud/expiry";
import { isCloud } from "@/lib/mode";
import type { TaskOutput, TaskRecord } from "@/lib/task-types";

/**
 * Whether a finished output can be shown or used as a reference right now.
 * Local mode: the file is saved on disk. Cloud mode: no local copy exists, the Kie.ai link is used
 * while Kie.ai still keeps the file (14 days).
 */
export function outputUsable(task: TaskRecord, o: TaskOutput, now = Date.now()): boolean {
  if (!isCloud()) return Boolean(o.localPath);
  return Boolean(o.url) && daysLeft(task, now) > 0;
}
