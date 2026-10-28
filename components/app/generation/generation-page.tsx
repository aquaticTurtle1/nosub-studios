"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudio } from "@/components/studio/app-context";
import { familyKinds } from "@/lib/catalog/families";
import { applyPreset, PRESETS } from "@/lib/presets";
import { useTasks } from "@/components/studio/use-tasks";
import { cn } from "@/lib/utils";
import { Feed } from "../media/feed";
import { Lightbox, lightboxItems } from "../media/lightbox";
import { useCardActions } from "../media/use-card-actions";
import { useCatalog } from "../use-catalog";
import { ControlPanel } from "./control-panel";
import { EmptyState } from "./empty-state";
import { MediaLibrary } from "./media-library";
import { MODES, type ModeId } from "./mode-config";
import { toolById } from "@/lib/catalog/tools";
import { useFileDragActive } from "./use-file-drop";
import { readRecent, readRecentFamilies, useGenerator } from "./use-generator";

/** Image, Video, Audio and Tools pages: identical layout, different config. */
export function GenerationPage({ modeId, toolId }: { modeId: ModeId; toolId?: string }) {
  const mode = MODES[modeId];
  const tool = toolId ? toolById(toolId) : null;
  const summaries = useCatalog();
  const { tasks, upsert, act } = useTasks({ limit: 300 });
  const { handoff, setHandoff } = useStudio();
  // A tool page shows only that tool's runs.
  const modeTasks = useMemo(
    () => tasks.filter((t) => t.category === mode.category && (!tool || tool.members.includes(t.modelKey))),
    [tasks, mode.category, tool],
  );
  const g = useGenerator(mode, { onSubmitted: upsert, history: tasks, summaries, lockFamily: tool?.id });
  const [libraryOpen, setLibraryOpen] = useState(false);
  const dragging = useFileDragActive();
  const switchedForHandoff = useRef(false);
  const { onAction, lightbox, openLightbox, closeLightbox } = useCardActions({
    act,
    local: { category: mode.category, reuse: g.reuse, addLibrary: g.addLibrary },
  });

  // Ctrl/Cmd+Enter generates.
  const submitRef = useRef(g.submit);
  useEffect(() => {
    submitRef.current = g.submit;
  }, [g.submit]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void submitRef.current(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Paste files from the clipboard (Ctrl+V) as references; plain text pastes are untouched.
  const addFilesRef = useRef(g.addFiles);
  useEffect(() => {
    addFilesRef.current = g.addFiles;
  }, [g.addFiles]);
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      if (!files.length) return;
      e.preventDefault();
      addFilesRef.current(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  // Files or a reused task handed over from another page ("Animate", Library).
  useEffect(() => {
    if (!handoff || handoff.mode !== mode.id || !summaries.length || !g.layout) return;
    if (handoff.reuse) {
      setHandoff(null);
      g.reuse(handoff.reuse);
      return;
    }
    const kinds = [...new Set(handoff.items.map((i) => i.kind))];
    if (mode.families) {
      // Explore names a family; "Animate" keeps the current family if it takes the files
      // (routing then picks image-to-video), otherwise picks one that does. Switch once,
      // then finish on the next run with the new family.
      if (!switchedForHandoff.current) {
        const takes = (f: (typeof g.families)[number]) => kinds.every((k) => familyKinds(f).includes(k));
        const recent = readRecentFamilies(mode.id).map((id) => g.families.find((f) => f.id === id));
        const pick = handoff.family
          ? g.families.find((f) => f.id === handoff.family)
          : kinds.every((k) => g.accepts.kinds.includes(k))
            ? undefined
            : (recent.find((f) => f && takes(f)) ??
              g.families.find((f) => f.members.includes(mode.defaultModel) && takes(f)) ??
              g.families.find((f) => f.featured && takes(f)));
        if (pick && pick.id !== g.family?.id) {
          switchedForHandoff.current = true;
          g.selectFamily(pick.id);
          return;
        }
      }
      // After a switch, wait until that family's model is loaded: a switch still in flight
      // would carry over the old values and drop the helper text.
      if (switchedForHandoff.current && !(g.model && g.family?.members.includes(g.model.key))) return;
      switchedForHandoff.current = false;
      setHandoff(null);
      const preset = PRESETS.find((p) => p.id === handoff.preset);
      const pf = g.layout.promptField;
      if (preset && pf) g.setValue(pf, applyPreset(String(g.values[pf] ?? ""), preset));
      if (handoff.items.length) g.addLibrary(handoff.items);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time open requested by Explore
      if (handoff.openLibrary) setLibraryOpen(true);
      return;
    }
    setHandoff(null);
    const takesImage = g.layout.refFields.some((f) => f.kinds.includes("image"));
    if (!takesImage) {
      const candidates = summaries.filter(
        (s) => s.category === mode.category && s.meta.refKinds.includes("image") && (!handoff.operation || s.operation === handoff.operation),
      );
      const recent = readRecent(mode.id);
      const pick = candidates.find((c) => recent.includes(c.key)) ?? candidates[0];
      if (pick) g.selectModel(pick.key);
    }
    g.addLibrary(handoff.items);
  }, [handoff, mode, summaries, g, setHandoff]);

  const needsRefs = Boolean(g.layout?.refFields.some((f) => f.required));
  const steps = mode.howTo(g.model?.operation ?? "", needsRefs);

  return (
    <div className="relative flex min-h-0 flex-1 max-lg:flex-col">
      <ControlPanel
        mode={mode}
        g={g}
        tasks={tasks}
        dragging={dragging && !libraryOpen}
        tool={tool}
        onBrowse={() => setLibraryOpen(true)}
      />

      <main className="min-w-0 flex-1 p-4 max-lg:pb-[52dvh] sm:p-6">
        <h1 className="sr-only">{tool?.name ?? mode.title}</h1>
        <div className="grid gap-8">
          {g.phase !== "idle" && (
            <div
              role="status"
              className="flex h-28 items-center justify-center gap-2 rounded-np-lg bg-np-bg-2 text-sm text-np-text-secondary animate-np-shimmer sm:max-w-[calc(50%-0.5rem)]"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {g.phase === "uploading" ? "Uploading references…" : "Submitting…"}
            </div>
          )}
          {modeTasks.length === 0 && g.phase === "idle" && <EmptyState title={tool ? "How it works" : `Make your first ${mode.title.toLowerCase()}`} steps={steps} />}
          {modeTasks.length > 0 && <Feed tasks={modeTasks} fallbackAspect={mode.defaultAspect} onAction={onAction} />}
        </div>
      </main>

      <MediaLibrary
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        modelName={g.accepts.name}
        accepts={g.accepts.kinds}
        tasks={tasks}
        dragging={dragging && libraryOpen}
        canAttach={g.canAttach}
        onFiles={g.addFiles}
        onAdd={g.addLibrary}
      />


      <Lightbox item={lightbox} items={lightboxItems(modeTasks)} onChange={openLightbox} onClose={closeLightbox} onAction={onAction} />

      <Dialog open={g.confirm !== null} onOpenChange={(o) => !o && g.setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold">Run this generation?</DialogTitle>
            <DialogDescription className="text-np-text-secondary">
              Kie.ai generations can’t be canceled. Once submitted, it will be charged even if you stop tracking it.
            </DialogDescription>
          </DialogHeader>
          <div className={cn("grid gap-1 rounded-np-md bg-np-bg-2 p-3")}>
            <span className="text-xs text-np-text-muted">Estimated cost</span>
            <span className="font-display text-2xl font-semibold tabular-nums">
              {g.confirm?.credits !== null && g.confirm?.credits !== undefined ? `${g.confirm.credits} credits` : "Unknown"}
            </span>
            <span className="text-xs text-np-text-muted">
              {g.confirm?.credits ? `≈ $${(g.confirm.credits * 0.005).toFixed(2)} · ` : ""}
              {g.confirm?.basis}
            </span>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => g.setConfirm(null)}>
              Back
            </Button>
            <Button onClick={() => void g.submit(true)}>Generate and pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
