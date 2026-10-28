"use client";

import {
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Copy,
  Download,
  ImagePlus,
  Repeat,
  RotateCcw,
  TriangleAlert,
  Undo2,
  Volume2,
  VolumeX,
  ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { TaskOutput, TaskRecord } from "@/lib/task-types";
import { humanize } from "@/lib/ui/fields";
import { cn } from "@/lib/utils";
import { type CardAction, fileUrl } from "./media-card";

const PROMPT_KEYS = ["prompt", "text", "lyrics", "description", "descriptions"];

export interface LightboxItem {
  task: TaskRecord;
  output: TaskOutput;
}

/** The media a feed can step through with ← / →, in feed order. */
export function lightboxItems(tasks: TaskRecord[]): LightboxItem[] {
  return tasks.flatMap((t) =>
    t.state === "success" ? (t.outputs as TaskOutput[]).filter((o) => o.kind !== "file").map((output) => ({ task: t, output })) : [],
  );
}

const same = (a: LightboxItem, b: LightboxItem) => a.task.id === b.task.id && a.output.url === b.output.url;

/**
 * Fullscreen preview for images, videos and audio. Layout rules (the old version broke
 * them): the dialog has a fixed size and never scrolls; every flex child down to the
 * info panel has min-h-0, so the panel scrolls on its own; the stage fills its column and
 * the media is fitted inside it (object-contain), never stretched by a tall prompt.
 */
export function Lightbox({
  item,
  items = [],
  onClose,
  onChange,
  onAction,
}: {
  item: LightboxItem | null;
  /** The feed's items, for ← / →. */
  items?: LightboxItem[];
  onClose: () => void;
  onChange?: (item: LightboxItem) => void;
  onAction: (a: CardAction, task: TaskRecord, output?: TaskOutput) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const index = item ? items.findIndex((x) => same(x, item)) : -1;
  const step = useCallback(
    (d: number) => {
      if (index < 0 || !onChange) return;
      const next = items[index + d];
      if (next) onChange(next);
    },
    [index, items, onChange],
  );

  const task = item?.task;
  const output = item?.output;
  const prompt = task ? (PROMPT_KEYS.map((k) => task.input[k]).find((v) => typeof v === "string") as string | undefined) : undefined;
  const settings = task
    ? Object.entries(task.input).filter(([k, v]) => !PROMPT_KEYS.includes(k) && !(typeof v === "string" && /^(https?|local):/.test(v)) && !Array.isArray(v) && typeof v !== "object")
    : [];

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        initialFocus={stage}
        showCloseButton
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            const t = e.target as HTMLElement;
            if (t.closest("input, textarea, video, audio, [role=slider]")) return;
            e.preventDefault();
            step(e.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        className={cn(
          // Fixed size: viewport minus 16px each side (max 1600×1000); full screen on phones.
          "flex h-[calc(100dvh-2rem)] max-h-[1000px] w-[calc(100vw-2rem)] max-w-[1600px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1600px] md:flex-row",
          "max-md:h-dvh max-md:max-h-none max-md:w-screen max-md:max-w-none max-md:rounded-none",
        )}
        data-testid="lightbox"
      >
        {task && output && (
          <>
            <div
              ref={stage}
              tabIndex={-1}
              data-testid="lightbox-stage"
              className="relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-np-bg-0 outline-none max-md:h-[55dvh] max-md:shrink-0 md:flex-1"
            >
              <Media key={`${task.id}:${output.url}`} task={task} output={output} prompt={prompt} onAction={onAction} />
              {items.length > 1 && index >= 0 && (
                <>
                  <StepButton side="left" disabled={index === 0} onClick={() => step(-1)} />
                  <StepButton side="right" disabled={index === items.length - 1} onClick={() => step(1)} />
                  <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-np-sm bg-np-scrim px-1.5 text-[11px] leading-5 text-np-text-secondary tabular-nums">
                    {index + 1} / {items.length}
                  </span>
                </>
              )}
            </div>

            <aside className="flex min-h-0 flex-col bg-np-bg-1 max-md:flex-1 md:w-[380px] md:shrink-0" aria-label="Details">
              <div className="np-scroll min-h-0 flex-1 overflow-y-auto p-5 pr-4" data-testid="lightbox-info">
                <div className="grid content-start gap-4">
                  <div className="grid gap-0.5 pr-8">
                    <DialogTitle className="font-display text-lg font-semibold">{task.modelTitle.trim()}</DialogTitle>
                    <DialogDescription className="text-xs text-np-text-muted">{new Date(task.createdAt).toLocaleString()}</DialogDescription>
                  </div>
                  {prompt && <Prompt key={task.id} text={prompt} />}
                  {settings.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                      {settings.map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-np-text-muted">{humanize(k)}</dt>
                          <dd className="truncate" title={String(v)}>
                            {String(v)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                    <dt className="text-np-text-muted">Charged</dt>
                    <dd>{task.creditsConsumed !== null ? `${task.creditsConsumed} credits` : "—"}</dd>
                    <dt className="text-np-text-muted">Estimated</dt>
                    <dd>{task.estimate?.credits ?? "—"}</dd>
                  </dl>
                </div>
              </div>
              {/* Pinned: always visible without scrolling. */}
              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-np-border-subtle p-4" data-testid="lightbox-actions">
                <Button variant="secondary" onClick={() => (onAction("reuse", task), onClose())}>
                  <Undo2 /> Reuse prompt
                </Button>
                {fileUrl(output) ? (
                  <Button variant="secondary" render={<a href={fileUrl(output, true)!} download />} nativeButton={false}>
                    <Download /> Download
                  </Button>
                ) : (
                  <span />
                )}
                {output.kind === "image" && (
                  <>
                    <Button variant="secondary" onClick={() => (onAction("reference", task, output), onClose())}>
                      <ImagePlus /> Use as reference
                    </Button>
                    <Button variant="secondary" onClick={() => (onAction("animate", task, output), onClose())}>
                      <Clapperboard /> Animate
                    </Button>
                  </>
                )}
              </div>
            </aside>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepButton({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      aria-disabled={disabled}
      className={cn(
        "absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-np-full bg-np-scrim text-np-text-primary transition-opacity duration-150 hover:bg-np-bg-3",
        side === "left" ? "left-3" : "right-3",
        disabled && "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

/** Prompt collapsed to six lines, with Show more and Copy. */
function Prompt({ text }: { text: string }) {
  const p = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  useLayoutEffect(() => {
    const el = p.current;
    if (el) setLong(el.scrollHeight > el.clientHeight + 1);
  }, [text]);
  return (
    <div className="grid gap-1.5">
      <p ref={p} data-testid="lightbox-prompt" className={cn("text-sm whitespace-pre-line text-np-text-secondary", !open && "line-clamp-6")}>
        {text}
      </p>
      <div className="flex gap-1">
        {(long || open) && (
          <Button variant="ghost" size="xs" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? "Show less" : "Show more"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            void navigator.clipboard
              .writeText(text)
              .then(() => toast.success("Prompt copied."))
              .catch(() => toast.error("Couldn't copy.", { description: "Select the text and copy it instead." }))
          }
        >
          <Copy /> Copy
        </Button>
      </div>
    </div>
  );
}

type LoadState = "loading" | "ready" | "error";

function Media({ task, output, prompt, onAction }: { task: TaskRecord; output: TaskOutput; prompt?: string; onAction: (a: CardAction, task: TaskRecord, output?: TaskOutput) => void }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const base = fileUrl(output);
  const src = base ? `${base}${attempt ? `${base.includes("?") ? "&" : "?"}retry=${attempt}` : ""}` : null;
  const retry = () => {
    setState("loading");
    setAttempt((a) => a + 1);
  };

  if (!src) {
    return (
      <Problem
        title="This file isn't on this computer."
        text={output.downloadError ? "The download from Kie.ai failed." : "It was never saved locally."}
        action={{ label: "Retry download", onClick: () => onAction("redownload", task) }}
      />
    );
  }
  return (
    <>
      {state === "loading" && <div className="absolute inset-6 animate-np-shimmer rounded-np-lg bg-np-bg-2" data-testid="lightbox-loading" aria-label="Loading" />}
      {state === "error" && <Problem title="The file didn't load." text="It may have been moved or deleted from data/outputs." action={{ label: "Retry", onClick: retry }} />}
      {output.kind === "image" && <ZoomImage key={src} src={src} alt={prompt ?? task.modelTitle} hidden={state !== "ready"} onState={setState} />}
      {output.kind === "video" && <VideoPlayer key={src} src={src} hidden={state === "error"} onState={setState} />}
      {output.kind === "audio" && <AudioPlayer key={src} src={src} title={task.modelTitle.trim()} hidden={state === "error"} onState={setState} />}
    </>
  );
}

function Problem({ title, text, action }: { title: string; text: string; action: { label: string; onClick: () => void } }) {
  return (
    <div role="alert" className="relative z-10 grid max-w-sm justify-items-center gap-2 p-6 text-center">
      <TriangleAlert className="size-6 text-np-danger" aria-hidden />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-np-text-secondary">{text}</p>
      <Button variant="secondary" onClick={action.onClick}>
        <RotateCcw /> {action.label}
      </Button>
    </div>
  );
}

/** Size of the picture inside an object-contain <img> (the element itself fills the stage). */
function fitted(el: HTMLImageElement | null): { w: number; h: number } {
  if (!el || !el.naturalWidth || !el.clientWidth) return { w: 0, h: 0 };
  const r = Math.min(el.clientWidth / el.naturalWidth, el.clientHeight / el.naturalHeight);
  return { w: el.naturalWidth * r, h: el.naturalHeight * r };
}
/** Zoom at which one image pixel is one screen pixel. */
const actualOf = (el: HTMLImageElement | null) => {
  const f = fitted(el);
  return f.w ? Math.max(1, el!.naturalWidth / f.w) : 1;
};
const maxOf = (el: HTMLImageElement | null) => Math.max(4, actualOf(el) * 2);

/**
 * Fit-to-stage image with zoom: click toggles fit ↔ 100 % (actual pixels), the wheel zooms
 * in steps toward the cursor, drag pans when zoomed, double-click resets.
 */
function ZoomImage({ src, alt, hidden, onState }: { src: string; alt: string; hidden: boolean; onState: (s: LoadState) => void }) {
  const img = useRef<HTMLImageElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Scale at which one image pixel is one screen pixel, relative to the fitted size.
  const [actual, setActual] = useState(1);
  const measure = useCallback(() => setActual(actualOf(img.current)), []);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const clamp = useCallback((s: number, x: number, y: number) => {
    const el = img.current;
    const b = box.current;
    if (!el || !b) return { s, x, y };
    const f = fitted(el);
    const mx = Math.max(0, (f.w * s - b.clientWidth) / 2);
    const my = Math.max(0, (f.h * s - b.clientHeight) / 2);
    return { s, x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  }, []);

  /** Zoom to `s`, keeping the point under (cx, cy) (relative to the stage centre) still. */
  const zoomTo = useCallback(
    (s: number, cx = 0, cy = 0) =>
      setView((v) => {
        const next = Math.min(maxOf(img.current), Math.max(1, s));
        const k = next / v.s;
        return clamp(next, cx - (cx - v.x) * k, cy - (cy - v.y) * k);
      }),
    [clamp],
  );

  useEffect(() => {
    const b = box.current;
    if (!b) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = b.getBoundingClientRect();
      setView((v) => {
        const next = Math.min(maxOf(img.current), Math.max(1, v.s * Math.pow(1.0015, -e.deltaY)));
        const cx = e.clientX - r.left - r.width / 2;
        const cy = e.clientY - r.top - r.height / 2;
        const k = next / v.s;
        return clamp(next, cx - (cx - v.x) * k, cy - (cy - v.y) * k);
      });
    };
    b.addEventListener("wheel", onWheel, { passive: false });
    return () => b.removeEventListener("wheel", onWheel);
  }, [clamp]);

  const zoomed = view.s > 1.001;
  return (
    <div
      ref={box}
      className={cn("absolute inset-0 flex touch-none items-center justify-center select-none", zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in", hidden && "invisible")}
      onPointerDown={(e) => {
        drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.px;
        const dy = e.clientY - d.py;
        if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
        if (d.moved && zoomed) {
          setDragging(true);
          setView((v) => clamp(v.s, d.x + dx, d.y + dy));
        }
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        setDragging(false);
        if (!d || d.moved || e.detail > 1) return;
        const r = e.currentTarget.getBoundingClientRect();
        const cx = e.clientX - r.left - r.width / 2;
        const cy = e.clientY - r.top - r.height / 2;
        // Fit ↔ actual pixels (or 2× when the image is smaller than the stage).
        if (zoomed) zoomTo(1);
        else zoomTo(actual > 1.05 ? actual : 2, cx, cy);
      }}
      onDoubleClick={() => setView({ s: 1, x: 0, y: 0 })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local file */}
      <img
        ref={img}
        src={src}
        alt={alt}
        draggable={false}
        data-testid="lightbox-media"
        onLoad={() => {
          measure();
          onState("ready");
        }}
        onError={() => onState("error")}
        className="size-full object-contain will-change-transform"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, transition: dragging ? "none" : "transform 150ms ease-out" }}
      />
      <div className="absolute top-3 left-3 flex items-center gap-1">
        <span className="pointer-events-none flex items-center gap-1 rounded-np-sm bg-np-scrim px-1.5 text-[11px] leading-6 text-np-text-secondary tabular-nums">
          <ZoomIn className="size-3" aria-hidden /> {zoomed ? `${Math.round((view.s / actual) * 100)} %` : "Fit"}
        </span>
        {zoomed && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={() => setView({ s: 1, x: 0, y: 0 })}
            className="rounded-np-sm bg-np-scrim px-1.5 text-[11px] leading-6 text-np-text-primary hover:bg-np-bg-3"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/** Native controls kept inside the stage; autoplays muted, with unmute, loop and Space to play/pause. */
function VideoPlayer({ src, hidden, onState }: { src: string; hidden: boolean; onState: (s: LoadState) => void }) {
  const v = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loop, setLoop] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const t = e.target as HTMLElement;
      // The native controls and other buttons handle Space themselves.
      if (t.closest("button, a, input, textarea, video")) return;
      e.preventDefault();
      const el = v.current;
      if (el) void (el.paused ? el.play() : el.pause());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center p-4", hidden && "invisible")}>
      <video
        ref={v}
        src={src}
        controls
        autoPlay
        muted={muted}
        loop={loop}
        playsInline
        data-testid="lightbox-media"
        onLoadedData={() => onState("ready")}
        onError={() => onState("error")}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        className="size-full object-contain"
      />
      <div className="absolute top-3 left-3 flex gap-1">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={!muted}
          className="flex h-7 items-center gap-1 rounded-np-sm bg-np-scrim px-2 text-xs text-np-text-primary hover:bg-np-bg-3"
        >
          {muted ? <VolumeX className="size-3.5" aria-hidden /> : <Volume2 className="size-3.5" aria-hidden />} {muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={() => setLoop((l) => !l)}
          aria-pressed={loop}
          className={cn("flex h-7 items-center gap-1 rounded-np-sm bg-np-scrim px-2 text-xs hover:bg-np-bg-3", loop ? "text-np-accent-text" : "text-np-text-secondary")}
        >
          <Repeat className="size-3.5" aria-hidden /> Loop
        </button>
      </div>
    </div>
  );
}

/** A large player with the file's waveform (decoded locally), centred in the stage. */
function AudioPlayer({ src, title, hidden, onState }: { src: string; title: string; hidden: boolean; onState: (s: LoadState) => void }) {
  const [peaks, setPeaks] = useState<number[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    const Ctx = window.AudioContext;
    if (!Ctx) return;
    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => new Ctx().decodeAudioData(buf))
      .then((audio) => {
        const data = audio.getChannelData(0);
        const n = 96;
        const size = Math.floor(data.length / n) || 1;
        const out = Array.from({ length: n }, (_, i) => {
          let m = 0;
          for (let j = i * size; j < Math.min(data.length, (i + 1) * size); j++) m = Math.max(m, Math.abs(data[j]));
          return m;
        });
        const top = Math.max(...out, 0.0001);
        if (!cancelled) setPeaks(out.map((x) => x / top));
      })
      .catch(() => {
        // No waveform; the player still works.
      });
    return () => {
      cancelled = true;
    };
  }, [src]);
  return (
    <div className={cn("grid w-full max-w-2xl gap-5 p-8", hidden && "invisible")}>
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-np-md bg-np-bg-2 text-np-accent-text">
          <AudioLines className="size-6" aria-hidden />
        </span>
        <span className="font-display text-lg font-semibold">{title}</span>
      </div>
      {peaks && (
        <svg viewBox={`0 0 ${peaks.length * 4} 64`} className="h-24 w-full" aria-hidden preserveAspectRatio="none">
          {peaks.map((p, i) => (
            <rect key={i} x={i * 4} y={32 - Math.max(1, p * 30)} width={2.5} height={Math.max(2, p * 60)} rx={1} className="fill-np-accent-text" />
          ))}
        </svg>
      )}
      <audio src={src} controls data-testid="lightbox-media" onLoadedData={() => onState("ready")} onError={() => onState("error")} className="w-full" />
    </div>
  );
}
