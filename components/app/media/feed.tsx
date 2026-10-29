"use client";

import { Check } from "lucide-react";
import type { TaskOutput, TaskRecord } from "@/lib/task-types";
import { outputUsable } from "@/lib/ui/output-media";
import { cn } from "@/lib/utils";
import { type CardAction, MediaCard } from "./media-card";

export interface FeedSelection {
  selected: Set<string>;
  onToggle: (taskId: string) => void;
}

/** Newest-first masonry of tasks: one card per output for finished tasks. */
export function Feed({
  tasks,
  fallbackAspect,
  onAction,
  selection,
}: {
  tasks: TaskRecord[];
  fallbackAspect: string;
  onAction: (a: CardAction, task: TaskRecord, output?: TaskOutput) => void;
  /** Library "Select": cards toggle instead of opening; only tasks with local files can be picked. */
  selection?: FeedSelection;
}) {
  const items = tasks.flatMap((t) =>
    t.state === "success" && t.outputs.length
      ? t.outputs.map((o, i) => ({ key: `${t.id}:${i}`, task: t, output: o as TaskOutput | undefined }))
      : [{ key: t.id, task: t, output: undefined }],
  );
  return (
    <div className="columns-1 gap-4 sm:columns-2 2xl:columns-3">
      {items.map((it) => {
        const pickable = Boolean(selection && it.task.outputs.some((o) => outputUsable(it.task, o)));
        const on = Boolean(selection?.selected.has(it.task.id));
        return (
          <div key={it.key} className="relative mb-4 break-inside-avoid">
            <div className={cn(selection && !pickable && "opacity-50", on && "rounded-np-lg ring-2 ring-np-accent")}>
              <MediaCard task={it.task} output={it.output} fallbackAspect={fallbackAspect} onAction={onAction} />
            </div>
            {selection && pickable && (
              <button
                type="button"
                onClick={() => selection.onToggle(it.task.id)}
                aria-pressed={on}
                aria-label={`${on ? "Deselect" : "Select"} ${it.task.modelTitle} from ${new Date(it.task.createdAt).toLocaleString()}`}
                className="absolute inset-0 rounded-np-lg focus-visible:outline-2 focus-visible:outline-np-focus-ring"
              >
                <span
                  className={cn(
                    "absolute top-2 left-2 flex size-6 items-center justify-center rounded-np-sm bg-np-scrim text-np-text-primary ring-1 ring-np-border-strong",
                    on && "bg-np-accent text-np-on-accent ring-np-accent",
                  )}
                >
                  {on && <Check className="size-4" aria-hidden />}
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
