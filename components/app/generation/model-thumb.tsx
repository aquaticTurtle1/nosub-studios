"use client";

import { AudioLines, Clapperboard, Image as ImageIcon, Wrench } from "lucide-react";
import { backend } from "@/lib/backend";
import type { CatalogSummary } from "@/lib/catalog/types";
import type { TaskRecord } from "@/lib/task-types";
import { cn } from "@/lib/utils";

const CAT_ICON = { image: ImageIcon, video: Clapperboard, audio: AudioLines, tools: Wrench } as const;

/** Newest local image this model made, for its picker thumbnail. */
export function lastThumb(tasks: TaskRecord[], key: string): string | null {
  for (const t of tasks) {
    if (t.modelKey !== key || t.state !== "success") continue;
    const img = t.outputs.find((o) => o.kind === "image" && o.localPath);
    if (img) return backend.outputUrl(img);
  }
  return null;
}

export function ModelThumb({ model, thumb, className }: { model: CatalogSummary; thumb: string | null; className?: string }) {
  const Icon = CAT_ICON[model.category];
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-np-md bg-np-bg-3", className)}>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- local generation
        <img src={thumb} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-np-accent-soft to-np-bg-3 text-np-text-secondary">
          <Icon className="size-5" aria-hidden />
        </div>
      )}
    </div>
  );
}
