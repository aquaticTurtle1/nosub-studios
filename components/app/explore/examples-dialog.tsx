"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError, postJson } from "@/components/studio/api";
import { estimateCost } from "@/lib/catalog/pricing";
import { validateInput } from "@/lib/catalog/schema";
import type { CatalogModel } from "@/lib/catalog/types";
import type { TaskRecord } from "@/lib/task-types";
import { notifyError } from "../notify";

/**
 * "Generate examples": a few cheap runs that fill Explore with your own media. Nothing
 * runs until you press the button in the dialog; the list and costs are shown first.
 * Edit the list freely.
 */
const EXAMPLES: { label: string; modelKey: string; input: Record<string, unknown> }[] = [
  { label: "Image · Z-Image", modelKey: "z-image/z-image", input: { prompt: "A ceramic teapot on a linen tablecloth, soft morning light", aspect_ratio: "1:1" } },
  { label: "Image · Z-Image", modelKey: "z-image/z-image", input: { prompt: "A neon-lit ramen stall on a rainy street at night, reflections on wet asphalt", aspect_ratio: "16:9" } },
  {
    label: "Video · PixVerse V6, 3 s, 360p",
    modelKey: "pixverse/text-to-video",
    input: { prompt: "A paper boat drifting on a calm lake at dawn, slow push-in", duration: 3, quality: "360p", aspect_ratio: "16:9", generate_audio_switch: false },
  },
];

interface Planned {
  label: string;
  model: CatalogModel;
  input: Record<string, unknown>;
  credits: number | null;
  problem: string | null;
}

export function ExamplesDialog({ open, onOpenChange, onStarted }: { open: boolean; onOpenChange: (o: boolean) => void; onStarted: (t: TaskRecord) => void }) {
  const [plan, setPlan] = useState<Planned[] | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all(
      EXAMPLES.map(async (ex) => {
        const model = await api<CatalogModel>(`/api/catalog/${ex.modelKey}`);
        const check = validateInput(model.variants[0].schema, ex.input);
        return {
          label: ex.label,
          model,
          input: ex.input,
          credits: check.ok ? estimateCost(model.pricing, check.value, model.free).credits : null,
          problem: check.ok ? null : check.issues.map((i) => i.message).join(", "),
        };
      }),
    )
      .then((p) => !cancelled && setPlan(p))
      .catch(() => !cancelled && setPlan([]));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const runnable = plan?.filter((p) => !p.problem) ?? [];
  const known = runnable.filter((p) => p.credits !== null);
  const total = Math.round(known.reduce((n, p) => n + p.credits!, 0) * 100) / 100;
  const totalText = known.length === runnable.length ? `${total} credits` : `at least ${total} credits`;

  async function run() {
    setRunning(true);
    let started = 0;
    for (const p of runnable) {
      try {
        const r = await api<{ task: TaskRecord }>(
          "/api/generate",
          postJson({ modelKey: p.model.key, variant: p.model.variants[0].title, input: p.input, idempotencyKey: crypto.randomUUID(), confirmed: true }),
        );
        onStarted(r.task);
        started++;
      } catch (e) {
        if (e instanceof ApiError) notifyError(e.error);
      }
    }
    setRunning(false);
    onOpenChange(false);
    if (started) toast.success(`${started} example${started === 1 ? "" : "s"} started.`, { description: "They appear in the gallery when ready." });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !running && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold">Generate examples?</DialogTitle>
          <DialogDescription className="text-np-text-secondary">
            These runs fill Explore with your own media. Kie.ai generations can’t be canceled; they are charged once started.
          </DialogDescription>
        </DialogHeader>
        {!plan ? (
          <div className="flex h-24 items-center justify-center text-np-text-muted">
            <Loader2 className="size-5 animate-spin" aria-label="Working out the cost" />
          </div>
        ) : (
          <ul className="grid gap-2" aria-label="Runs">
            {plan.map((p, i) => (
              <li key={i} className="grid gap-0.5 rounded-np-md bg-np-bg-2 p-3">
                <span className="flex justify-between gap-3 text-sm">
                  <span className="font-medium">{p.label}</span>
                  <span className="shrink-0 text-np-text-secondary tabular-nums">{p.problem ? "Skipped" : p.credits !== null ? `${p.credits} credits` : "Cost unknown"}</span>
                </span>
                <span className="text-xs text-np-text-muted">{String(p.input.prompt)}</span>
                {p.problem && <span className="text-xs text-np-warning">Not valid for this model: {p.problem}</span>}
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={running}>
            Not now
          </Button>
          <Button onClick={() => void run()} disabled={!runnable.length || running}>
            {running ? <Loader2 className="animate-spin" /> : null}
            Run {runnable.length} · {totalText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
