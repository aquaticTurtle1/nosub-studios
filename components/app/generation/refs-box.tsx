"use client";

import { AudioLines, Film, Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { humanize, type RefField, type RefKind } from "@/lib/ui/fields";
import { cn } from "@/lib/utils";
import type { Ref } from "./use-generator";

export const KINDS: { kind: RefKind; label: string; icon: typeof ImageIcon }[] = [
  { kind: "image", label: "Image", icon: ImageIcon },
  { kind: "video", label: "Video", icon: Film },
  { kind: "audio", label: "Audio", icon: AudioLines },
];

const LIMIT_WORD: Record<RefKind, string> = { image: "images", video: "video", audio: "audio" };

export const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** "Images up to 30 · video up to 10 · audio up to 10", from the model's schema. */
export function limitsText(accepts: RefKind[], limits: Record<RefKind, number>): string {
  return accepts
    .map((k) => `${LIMIT_WORD[k]} up to ${limits[k]}`)
    .join(" · ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** "Add references": one zone for every media kind the model takes. Clicking opens the Media library. */
export function RefsBox({
  modelName,
  accepts,
  limits,
  refs,
  fields,
  invalid,
  onBrowse,
  onRemove,
  onTarget,
  routes = [],
}: {
  modelName: string;
  accepts: RefKind[];
  limits: Record<RefKind, number>;
  refs: Ref[];
  fields: RefField[];
  invalid: boolean;
  onBrowse: () => void;
  onRemove: (id: string) => void;
  onTarget: (id: string, field: string) => void;
  /** Family pages: what each routed model takes; the active one is marked. */
  routes?: Route[];
}) {
  const subtitle = accepts.length ? limitsText(accepts, limits) : `${modelName} doesn't take references`;
  const summary = routes.length > 1 ? <RouteList routes={routes} /> : <span className="text-xs text-np-text-muted">{subtitle}</span>;
  const full = accepts.every((k) => refs.filter((r) => r.kind === k).length >= limits[k]);

  if (!refs.length) {
    return (
      <button
        type="button"
        onClick={onBrowse}
        disabled={!accepts.length}
        aria-label={`Add references. ${subtitle}`}
        className={cn(
          "flex h-[180px] w-full flex-col items-center justify-center gap-3 rounded-np-lg border border-dashed border-np-border-strong bg-np-bg-2 px-4 text-center transition-colors duration-150 hover:bg-np-bg-3",
          invalid && "border-np-danger",
          !accepts.length && "cursor-default opacity-60 hover:bg-np-bg-2",
        )}
      >
        <KindIcons modelName={modelName} accepts={accepts} />
        <span className="grid gap-1">
          <span className="font-display text-base font-semibold text-np-text-primary">Add references</span>
          {summary}
          <span className="text-xs text-np-text-muted">Drop files here, paste, or pick from your library</span>
        </span>
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <ul className="grid grid-cols-4 gap-2" aria-label="Attached references">
        {refs.map((r) => {
          const options = fields.filter((f) => f.kinds.includes(r.kind));
          return (
            <li key={r.id} className="grid min-w-0 content-start gap-1">
              <div className={cn("group relative overflow-hidden rounded-np-md bg-np-bg-2", r.problem && "ring-1 ring-np-danger")}>
                <RefThumb r={r} />
                <span className="absolute top-1 left-1 rounded-np-sm bg-np-scrim px-1 text-[11px] leading-[18px] text-np-text-primary">
                  {r.label}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(r.id)}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-np-full bg-np-scrim text-np-text-primary hover:bg-np-bg-3"
                  aria-label={`Remove ${r.name}`}
                >
                  <X className="size-3" />
                </button>
              </div>
              {r.problem ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="truncate text-[11px] leading-4 text-np-danger" />}>Not accepted</TooltipTrigger>
                  <TooltipContent>{r.problem}</TooltipContent>
                </Tooltip>
              ) : options.length > 1 && r.target ? (
                <select
                  value={r.target}
                  onChange={(e) => onTarget(r.id, e.target.value)}
                  className="h-6 w-full min-w-0 rounded-np-sm bg-np-bg-2 px-1 text-[11px] text-np-text-secondary"
                  aria-label={`Use ${r.name} as`}
                >
                  {options.map((f) => (
                    <option key={f.name} value={f.name}>
                      {humanize(f.name)}
                    </option>
                  ))}
                </select>
              ) : !r.target && !r.saving ? (
                <span className="truncate text-[11px] leading-4 text-np-warning">Not used</span>
              ) : null}
            </li>
          );
        })}
        {!full && (
          <li>
            <button
              type="button"
              onClick={onBrowse}
              aria-label={`Add more references. ${subtitle}`}
              className="flex aspect-square w-full items-center justify-center rounded-np-md border border-dashed border-np-border-strong bg-np-bg-2 text-np-text-secondary transition-colors duration-150 hover:bg-np-bg-3 hover:text-np-text-primary"
            >
              <Plus className="size-5" />
            </button>
          </li>
        )}
      </ul>
      {summary}
    </div>
  );
}

export interface Route {
  key: string;
  /** "Image-to-Video" */
  op: string;
  /** "Images up to 2" */
  text: string;
  active: boolean;
}

/** One line per model the family routes to, so the limits are never a mystery sum. */
function RouteList({ routes }: { routes: Route[] }) {
  return (
    <ul className="grid gap-0.5 text-xs" aria-label="What each mode takes">
      {routes.map((r) => (
        <li key={r.key} className={cn("flex justify-center gap-1.5", r.active ? "text-np-text-secondary" : "text-np-text-muted")}>
          <span className={cn(r.active && "font-medium text-np-text-primary")}>{r.op}</span>
          <span aria-hidden>·</span>
          <span>{r.text}</span>
          {r.active && <span className="sr-only">(current)</span>}
        </li>
      ))}
    </ul>
  );
}

function KindIcons({ modelName, accepts }: { modelName: string; accepts: RefKind[] }) {
  return (
    <span className="flex gap-2">
      {KINDS.map(({ kind, label, icon: Icon }) => {
        const ok = accepts.includes(kind);
        const tip = ok ? `${label} accepted` : `${modelName} doesn't take ${label.toLowerCase()}`;
        return (
          <Tooltip key={kind}>
            <TooltipTrigger
              render={
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-np-md",
                    ok ? "bg-np-bg-3 text-np-text-primary" : "text-np-text-muted opacity-40",
                  )}
                  aria-label={tip}
                  data-kind={kind}
                  data-accepted={ok}
                />
              }
            >
              <Icon className="size-5" />
            </TooltipTrigger>
            <TooltipContent>{tip}</TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}

function RefThumb({ r }: { r: Ref }) {
  const [measured, setMeasured] = useState<number | null>(null);
  const dur = r.duration ?? measured;
  return (
    <div className="relative aspect-square" data-testid="ref-thumb" data-kind={r.kind}>
      {r.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local file preview
        <img src={r.preview} alt={r.name} className="size-full object-cover" />
      ) : r.kind === "video" ? (
        <video
          src={`${r.preview}#t=0.1`}
          muted
          preload="metadata"
          onLoadedMetadata={(e) => setMeasured(e.currentTarget.duration)}
          className="size-full object-cover"
          aria-label={r.name}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1 text-np-text-secondary">
          <AudioLines className="size-6" aria-hidden />
          <audio src={r.preview} preload="metadata" onLoadedMetadata={(e) => setMeasured(e.currentTarget.duration)} />
        </div>
      )}
      {r.saving && (
        <span className="absolute inset-0 flex items-center justify-center bg-np-scrim" aria-label="Saving">
          <Loader2 className="size-4 animate-spin text-np-text-primary" />
        </span>
      )}
      {dur !== null && Number.isFinite(dur) && (
        <span className="absolute right-1 bottom-1 rounded-np-sm bg-np-scrim px-1 text-[11px] leading-4 text-np-text-primary tabular-nums">
          {fmtDur(dur)}
        </span>
      )}
    </div>
  );
}
