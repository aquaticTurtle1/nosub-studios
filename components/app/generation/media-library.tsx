"use client";

import { AudioLines, CloudUpload, Search, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { backend } from "@/lib/backend";
import type { TaskRecord } from "@/lib/task-types";
import type { RefKind } from "@/lib/ui/fields";

import { cn } from "@/lib/utils";
import { generatedItems, type LibraryEntry, uploadItem } from "./library-items";
import { fmtDur } from "./refs-box";
import { dropTarget } from "./use-file-drop";
import type { LibraryItem } from "./use-generator";

type Tab = "uploads" | RefKind;
const TABS: { id: Tab; label: string }[] = [
  { id: "uploads", label: "Uploads" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audio" },
];

const EMPTY: Record<Tab, string> = {
  uploads: "Files you add as references are kept here.",
  image: "Images you generate show up here.",
  video: "Videos you generate show up here.",
  audio: "Audio you generate shows up here.",
};

/** Pick references from earlier uploads and finished generations (all local files). */
export function MediaLibrary({
  open,
  onOpenChange,
  modelName,
  accepts,
  tasks,
  dragging,
  canAttach,
  onFiles,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  modelName: string;
  accepts: RefKind[];
  tasks: TaskRecord[];
  /** Files are being dragged over the page. */
  dragging: boolean;
  canAttach: (items: LibraryItem[]) => string | null;
  onFiles: (files: File[]) => void;
  onAdd: (items: LibraryItem[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("uploads");
  const [query, setQuery] = useState("");
  const [uploads, setUploads] = useState<LibraryEntry[] | null>(null);
  const [selected, setSelected] = useState<LibraryEntry[]>([]);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    backend.uploads
      .list()
      .then((r) => !cancelled && setUploads(r.map(uploadItem)))
      .catch(() => !cancelled && setUploads([]));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const generated = useMemo(() => generatedItems(tasks), [tasks]);
  const items = useMemo(() => {
    const list = tab === "uploads" ? (uploads ?? []) : generated.filter((g) => g.kind === tab);
    const q = query.trim().toLowerCase();
    return q ? list.filter((i) => i.name.toLowerCase().includes(q) || i.prompt.toLowerCase().includes(q)) : list;
  }, [tab, uploads, generated, query]);

  const close = () => {
    setSelected([]);
    setQuery("");
    onOpenChange(false);
  };
  const fromDisk = (files: File[]) => {
    close();
    onFiles(files);
  };
  const toggle = (it: LibraryEntry) => {
    if (selected.some((s) => s.uri === it.uri)) {
      setSelected((s) => s.filter((x) => x.uri !== it.uri));
      return;
    }
    const why = canAttach([...selected, it]);
    if (why) toast.error(why);
    else setSelected((s) => [...s, it]);
  };

  const uploadTile = (
    <button
      type="button"
      onClick={() => input.current?.click()}
      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-np-md border border-dashed border-np-border-strong bg-np-bg-2 text-sm text-np-text-secondary transition-colors duration-150 hover:bg-np-bg-3 hover:text-np-text-primary"
    >
      <CloudUpload className="size-6" aria-hidden />
      Upload file
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent
        {...dropTarget(fromDisk)}
        className={cn(
          "flex flex-col gap-0 overflow-hidden bg-np-bg-1 p-0",
          "sm:h-[min(600px,calc(100dvh-4rem))] sm:max-w-[880px]",
          "max-sm:inset-0 max-sm:h-dvh max-sm:max-h-none max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none",
        )}
      >
        <div className="grid gap-3 border-b border-np-border-subtle px-5 pt-5 pb-4">
          <DialogTitle className="font-display text-lg font-semibold">Media library</DialogTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Library" className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "h-8 rounded-np-full px-3.5 text-[13px] text-np-text-secondary transition-colors duration-150 hover:text-np-text-primary",
                    tab === t.id ? "bg-np-bg-3 font-medium text-np-text-primary ring-1 ring-np-border-strong" : "hover:bg-np-bg-2",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label className="ml-auto flex h-8 min-w-0 items-center gap-2 rounded-np-full bg-np-bg-2 px-3 text-np-text-muted max-sm:w-full">
              <Search className="size-3.5 shrink-0" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by file name or prompt"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-np-text-primary outline-none placeholder:text-np-text-muted sm:w-56"
              />
            </label>
          </div>
        </div>

        <div className="np-scroll relative min-h-0 flex-1 overflow-y-auto p-5">
          {items.length === 0 && !(tab === "uploads" && uploads === null) ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-np-text-secondary">{query ? "Nothing matches your search." : EMPTY[tab]}</p>
              <Button variant="secondary" onClick={() => input.current?.click()}>
                <Upload /> Upload file
              </Button>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {tab === "uploads" && <li>{uploadTile}</li>}
              {items.map((it) => {
                const ok = accepts.includes(it.kind);
                const n = selected.findIndex((s) => s.uri === it.uri);
                const tile = (
                  <button
                    type="button"
                    onClick={() => ok && toggle(it)}
                    aria-disabled={!ok}
                    aria-pressed={n >= 0}
                    aria-label={`${it.name}${ok ? "" : ` (${modelName} doesn't take ${it.kind})`}`}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-np-md bg-np-bg-2",
                      n >= 0 && "ring-2 ring-np-accent",
                      !ok && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <LibraryThumb it={it} />
                    {n >= 0 && (
                      <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-np-full bg-np-accent text-xs font-semibold text-np-on-accent tabular-nums">
                        {n + 1}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 grid bg-np-scrim px-2 py-1 text-left opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="truncate text-[11px] text-np-text-primary">{it.label === "Uploaded" ? it.name : it.label}</span>
                      <span className="text-[11px] text-np-text-muted">{new Date(it.createdAt).toLocaleDateString()}</span>
                    </span>
                  </button>
                );
                return (
                  <li key={it.uri}>
                    {ok ? (
                      tile
                    ) : (
                      <Tooltip>
                        <TooltipTrigger render={tile} />
                        <TooltipContent>
                          {modelName} doesn&rsquo;t take {it.kind}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {dragging && (
            <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-np-lg bg-np-accent-soft ring-2 ring-np-accent" data-testid="drop-overlay">
              <span className="flex items-center gap-2 text-sm font-medium text-np-text-primary">
                <Upload className="size-4 text-np-accent-text" aria-hidden /> Drop to add as reference
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="m-0 flex-row justify-end gap-2 border-t border-np-border-subtle bg-np-bg-1 px-5 py-3">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!selected.length}
            onClick={() => {
              const picked = selected;
              close();
              onAdd(picked);
            }}
          >
            {selected.length ? `Add ${selected.length} reference${selected.length === 1 ? "" : "s"}` : "Add references"}
          </Button>
        </DialogFooter>
        <input
          ref={input}
          type="file"
          accept={accepts.map((k) => `${k}/*`).join(",")}
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length) fromDisk(files);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function LibraryThumb({ it }: { it: LibraryEntry }) {
  const src = backend.previewUrl(it.uri);
  const [measured, setMeasured] = useState<number | null>(null);
  const dur = it.duration ?? measured;
  return (
    <>
      {it.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local file
        <img src={src} alt="" loading="lazy" className="size-full object-cover" />
      ) : it.kind === "video" ? (
        <video src={`${src}#t=0.1`} muted preload="metadata" onLoadedMetadata={(e) => setMeasured(e.currentTarget.duration)} className="size-full object-cover" />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1 px-2 text-np-text-secondary">
          <AudioLines className="size-6" aria-hidden />
          <span className="w-full truncate text-center text-[11px]">{it.name}</span>
        </span>
      )}
      {dur !== null && Number.isFinite(dur) && (
        <span className="absolute top-1.5 left-1.5 rounded-np-sm bg-np-scrim px-1 text-[11px] leading-4 text-np-text-primary tabular-nums">{fmtDur(dur)}</span>
      )}
    </>
  );
}
