"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useStudio } from "@/components/studio/app-context";
import type { Category } from "@/lib/catalog/types";
import type { TaskOutput, TaskRecord } from "@/lib/task-types";
import { outputItem } from "../generation/library-items";
import type { LibraryItem } from "../generation/use-generator";
import type { CardAction } from "./media-card";

/**
 * Card actions shared by generation pages and the Library. When `local` handlers
 * are given (we are on the right generation page) they act in place; otherwise
 * the action is handed to the right page.
 */
export function useCardActions(opts: {
  act: (id: string, a: "stop" | "resume" | "redownload") => Promise<void>;
  local?: { category: Category; reuse: (t: TaskRecord) => void; addLibrary: (items: LibraryItem[]) => void };
}) {
  const router = useRouter();
  const { setHandoff } = useStudio();
  const [lightbox, setLightbox] = useState<{ task: TaskRecord; output: TaskOutput } | null>(null);
  const { act, local } = opts;

  const onAction = useCallback(
    async (a: CardAction, task: TaskRecord, output?: TaskOutput) => {
      switch (a) {
        case "open":
          if (output) setLightbox({ task, output });
          return;
        case "stop":
          await act(task.id, "stop");
          toast("Stopped tracking.", { description: "Generation continues on Kie.ai and will still be charged." });
          return;
        case "resume":
        case "redownload":
          await act(task.id, a);
          return;
        case "reuse":
          if (local && local.category === task.category) local.reuse(task);
          else {
            setHandoff({ mode: task.category, items: [], reuse: task });
            router.push(`/${task.category}`);
          }
          return;
        case "reference":
        case "animate": {
          if (!output) return;
          // The generated file is used straight from data/outputs; nothing is re-uploaded here.
          const item = outputItem(task, output);
          if (!item) return;
          if (a === "reference" && local) {
            local.addLibrary([item]);
          } else if (a === "reference") {
            setHandoff({ mode: "image", items: [item] });
            router.push("/image");
          } else {
            setHandoff({ mode: "video", items: [item], operation: "image-to-video" });
            router.push("/video");
          }
          return;
        }
        case "download":
          return;
      }
    },
    [act, local, router, setHandoff],
  );

  return { onAction, lightbox, openLightbox: setLightbox, closeLightbox: () => setLightbox(null) };
}
