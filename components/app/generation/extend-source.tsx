"use client";

import { Check, Film } from "lucide-react";
import type { Family } from "@/lib/catalog/families";
import type { TaskRecord } from "@/lib/task-types";
import { cn } from "@/lib/utils";
import { fileUrl } from "../media/media-card";

export const TASK_ID_FIELD = /^(task_?id|taskId|original_task_id|origin_task_id)$/;

/** "Extend video": pick an earlier video from this family; its Kie task ID is sent. */
export function ExtendSource({
  family,
  tasks,
  selected,
  onSelect,
}: {
  family: Family;
  tasks: TaskRecord[];
  selected: string | undefined;
  onSelect: (kieTaskId: string) => void;
}) {
  const sources = family.entries.filter((e) => e.operation !== "extend").map((e) => e.key);
  const videos = tasks.filter(
    (t) => t.state === "success" && sources.includes(t.modelKey) && t.kieTaskId && t.outputs.some((o) => o.kind === "video"),
  );
  if (!videos.length) {
    return (
      <div className="flex items-center gap-3 rounded-np-md border border-dashed border-np-border-strong bg-np-bg-2 px-3 py-3 text-xs text-np-text-muted">
        <Film className="size-4 shrink-0" aria-hidden />
        No {family.name} videos yet. Generate one first, then extend it here.
      </div>
    );
  }
  return (
    <div className="grid gap-1.5">
      <span className="text-xs text-np-text-muted">Pick the video to continue</span>
      <ul className="grid grid-cols-3 gap-2">
        {videos.map((t) => {
          const out = t.outputs.find((o) => o.kind === "video")!;
          const src = fileUrl(out);
          const on = selected === t.kieTaskId;
          return (
            <li key={t.id}>
              <button
                onClick={() => onSelect(t.kieTaskId!)}
                aria-pressed={on}
                aria-label={`Extend ${t.modelTitle} video from ${new Date(t.createdAt).toLocaleString()}`}
                className={cn("relative block w-full overflow-hidden rounded-np-md bg-np-bg-2", on && "ring-2 ring-np-accent")}
              >
                {src ? (
                  <video src={`${src}#t=0.1`} muted preload="metadata" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video" />
                )}
                {on && (
                  <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-np-full bg-np-scrim text-np-accent-text">
                    <Check className="size-3" aria-hidden />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
