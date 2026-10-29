"use client";

import { Download, Search, SquareCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/components/studio/use-tasks";
import { backend } from "@/lib/backend";
import type { TaskRecord } from "@/lib/task-types";
import { isCloud } from "@/lib/mode";
import { outputUsable } from "@/lib/ui/output-media";
import { cn } from "@/lib/utils";
import { Feed } from "../media/feed";
import { Lightbox, lightboxItems } from "../media/lightbox";
import { useCardActions } from "../media/use-card-actions";

const FILTERS: { id: string; label: string; match: (t: TaskRecord) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "image", label: "Image", match: (t) => t.category === "image" },
  { id: "video", label: "Video", match: (t) => t.category === "video" },
  { id: "audio", label: "Audio", match: (t) => t.category === "audio" },
  { id: "tools", label: "Tools", match: (t) => t.category === "tools" },
  { id: "failed", label: "Failed", match: (t) => ["fail", "submit_failed", "submit_unknown"].includes(t.state) },
  { id: "stopped", label: "Stopped", match: (t) => t.tracking !== "active" && !["success", "fail", "submit_failed", "submit_unknown"].includes(t.state) },
];

const promptText = (t: TaskRecord) =>
  ["prompt", "text", "lyrics", "description"].map((k) => t.input[k]).filter((v) => typeof v === "string").join(" ");

export function LibraryPage() {
  const { tasks, loaded, act } = useTasks({ limit: 1000 });
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "cost">("newest");
  const { onAction, lightbox, openLightbox, closeLightbox } = useCardActions({ act });
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const stopSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const list = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    const needle = q.trim().toLowerCase();
    const out = tasks.filter((t) => f.match(t) && (!needle || `${promptText(t)} ${t.modelTitle}`.toLowerCase().includes(needle)));
    if (sort === "oldest") out.sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "cost") out.sort((a, b) => (b.creditsConsumed ?? 0) - (a.creditsConsumed ?? 0));
    else out.sort((a, b) => b.createdAt - a.createdAt);
    return out;
  }, [tasks, filter, q, sort]);
  const spent = tasks.reduce((n, t) => n + (t.creditsConsumed ?? 0), 0);
  const pickable = list.filter((t) => t.outputs.some((o) => outputUsable(t, o)));
  const files = tasks.filter((t) => selected.has(t.id)).reduce((n, t) => n + t.outputs.filter((o) => outputUsable(t, o)).length, 0);

  return (
    <main className="mx-auto grid w-full max-w-7xl content-start gap-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <h1 className="font-display text-[28px] leading-9 font-semibold">Library</h1>
          <p className="text-[13px] text-np-text-muted">
            {tasks.length} generations, {Math.round(spent * 100) / 100} credits charged. {isCloud() ? "Kie.ai keeps results for 14 days." : "Files are kept on this computer."}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Filter" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-8 rounded-np-md bg-np-bg-2 px-3 text-sm text-np-text-secondary hover:bg-np-bg-3",
                filter === f.id && "bg-np-accent-soft text-np-accent-text ring-1 ring-np-accent hover:bg-np-accent-soft",
              )}
            >
              {f.label} <span className="text-np-text-muted">{tasks.filter(f.match).length}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-np-text-muted" aria-hidden />
          <Input className="h-8 pl-8" placeholder="Search prompts" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search prompts" />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-8 rounded-np-md bg-np-bg-2 px-2 text-sm text-np-text-primary"
          aria-label="Sort"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="cost">Most expensive</option>
        </select>
        <Button variant={selecting ? "secondary" : "ghost"} size="sm" onClick={() => (selecting ? stopSelecting() : setSelecting(true))} aria-pressed={selecting}>
          {selecting ? <X /> : <SquareCheck />} {selecting ? "Done" : "Select"}
        </Button>
      </div>

      {selecting && (
        <div
          role="toolbar"
          aria-label="Selection"
          className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-np-lg bg-np-bg-2 px-3 py-2 shadow-np-popover"
        >
          <span className="text-sm">
            {selected.size ? `${selected.size} selected · ${files} file${files === 1 ? "" : "s"}` : "Click generations to select them"}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set(pickable.map((t) => t.id)))} disabled={!pickable.length}>
            Select all {pickable.length}
          </Button>
          {selected.size > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          )}
          <Button
            size="sm"
            className="ml-auto"
            // Stays enabled and explains, per the design rules.
            onClick={() => {
              if (selected.size) void backend.downloadZip([...selected]);
              else toast("Select generations first.", { description: "Click the cards you want, then download them as one ZIP." });
            }}
          >
            <Download /> Download {files || ""} {files === 1 ? "file" : "files"}
          </Button>
        </div>
      )}

      {loaded && list.length === 0 && (
        <p className="text-np-text-muted">{tasks.length ? "Nothing matches these filters." : "Nothing here yet. What you generate shows up here."}</p>
      )}
      <Feed tasks={list} fallbackAspect="1 / 1" onAction={onAction} selection={selecting ? { selected, onToggle: toggle } : undefined} />
      <Lightbox item={lightbox} items={lightboxItems(list)} onChange={openLightbox} onClose={closeLightbox} onAction={onAction} />
    </main>
  );
}
