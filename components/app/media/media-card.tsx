"use client";

import { AlertTriangle, CircleAlert, Clapperboard, Download, FileAudio, Maximize2, Pause, Play, RotateCcw, Square, Undo2, ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isTerminal, type TaskOutput, type TaskRecord } from "@/lib/task-types";
import { humanError } from "@/lib/ui/human-error";
import { cn } from "@/lib/utils";

export type CardAction = "download" | "open" | "reuse" | "reference" | "animate" | "stop" | "resume" | "redownload";

export const fileUrl = (o: TaskOutput, download = false) =>
  o.localPath ? `/api/files/${o.localPath.split("/").map(encodeURIComponent).join("/")}${download ? "?download" : ""}` : null;

export function formatClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`;
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** CSS aspect-ratio from the task's settings ("16:9" → "16 / 9"). */
export function aspectOf(task: TaskRecord, fallback: string): string {
  const raw = task.input.aspect_ratio ?? task.input.ratio ?? task.input.size ?? task.input.image_size;
  const m = typeof raw === "string" ? raw.match(/^(\d+(?:\.\d+)?)\s*[:x]\s*(\d+(?:\.\d+)?)$/) : null;
  return m ? `${m[1]} / ${m[2]}` : fallback;
}

const promptOf = (t: TaskRecord) =>
  ["prompt", "text", "lyrics", "description", "descriptions"].map((k) => t.input[k]).find((v) => typeof v === "string") as string | undefined;

/** One feed card: a finished output, or the task's in-progress / failed / stopped state. */
export function MediaCard({
  task,
  output,
  fallbackAspect,
  onAction,
}: {
  task: TaskRecord;
  output?: TaskOutput;
  fallbackAspect: string;
  onAction: (a: CardAction, task: TaskRecord, output?: TaskOutput) => void;
}) {
  const live = !isTerminal(task.state) && task.tracking === "active";
  const now = useNow(live);
  const aspect = aspectOf(task, fallbackAspect);
  const prompt = promptOf(task);

  if (task.state === "success" && output) return <DoneCard task={task} output={output} aspect={aspect} prompt={prompt} onAction={onAction} />;

  if (task.state === "success") {
    // Text / ID results (lyrics, detection results, Omni IDs).
    return (
      <article className="grid gap-2 rounded-np-lg bg-np-bg-2 p-4">
        <CardHead task={task} status="Done" tone="success" />
        <pre className="max-h-56 overflow-auto rounded-np-md bg-np-bg-0 p-3 text-xs text-np-text-secondary">
          {JSON.stringify(task.result, null, 2)}
        </pre>
      </article>
    );
  }

  if (live) {
    const label = task.state === "submitting" ? "Submitting" : task.state === "pending" ? "Queued" : "Generating…";
    const start = task.submittedAt ?? task.createdAt;
    return (
      <article className="relative overflow-hidden rounded-np-lg bg-np-bg-2 animate-np-shimmer" style={{ aspectRatio: aspect }} aria-busy>
        <div className="absolute inset-0 flex flex-col justify-end gap-1 p-4">
          <span className="text-sm font-medium">{task.modelTitle}</span>
          <span className="text-sm text-np-accent-text tabular-nums" role="status">
            {label} {formatClock(now - start)}
            {task.progress !== null ? ` · ${task.progress}%` : ""}
          </span>
          {task.pollError && <span className="text-xs text-np-text-muted">Connection hiccup, still checking…</span>}
          {prompt && <span className="line-clamp-2 text-xs text-np-text-muted">{prompt}</span>}
        </div>
        <div className="absolute top-3 right-3">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={() => onAction("stop", task)}
                  className="flex h-8 items-center gap-1.5 rounded-np-md bg-np-scrim px-2.5 text-xs text-np-text-primary hover:bg-np-bg-3"
                />
              }
            >
              <Square className="size-3" aria-hidden /> Stop tracking
            </TooltipTrigger>
            <TooltipContent>Generation continues on Kie.ai and will still be charged.</TooltipContent>
          </Tooltip>
        </div>
      </article>
    );
  }

  if (!isTerminal(task.state)) {
    // Tracking stopped or timed out — still running remotely.
    return (
      <article className="grid gap-2 rounded-np-lg bg-np-bg-2 p-4">
        <CardHead task={task} status={task.tracking === "timed_out" ? "Tracking timed out" : "Stopped tracking"} tone="muted" />
        <p className="text-[13px] text-np-text-secondary">Still running on Kie.ai and still charged.</p>
        {prompt && <p className="line-clamp-2 text-xs text-np-text-muted">{prompt}</p>}
        <button
          onClick={() => onAction("resume", task)}
          className="flex h-8 w-fit items-center gap-1.5 rounded-np-md bg-np-bg-3 px-3 text-xs hover:text-np-text-primary"
        >
          <Play className="size-3.5" aria-hidden /> Resume tracking
        </button>
      </article>
    );
  }

  // fail / submit_failed / submit_unknown
  const err = task.error ?? { kind: "server" as const, label: "Failed", message: "No reason given", ambiguous: false, code: undefined };
  const h = humanError(err);
  const unknown = task.state === "submit_unknown";
  return (
    <article className={cn("grid gap-2 rounded-np-lg p-4", unknown ? "bg-np-warning-soft" : "bg-np-danger-soft")}>
      <CardHead task={task} status={unknown ? "Not confirmed" : task.state === "submit_failed" ? "Not submitted" : "Failed"} tone={unknown ? "warning" : "danger"} />
      <p className="text-[13px] text-np-text-primary">
        {task.state === "fail" && task.error?.message ? `${task.error.message}. ` : `${h.title} `}
        <span className="text-np-text-secondary">{task.state === "fail" ? "Try a different prompt or settings." : h.next}</span>
      </p>
      {prompt && <p className="line-clamp-2 text-xs text-np-text-muted">{prompt}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onAction("reuse", task)} className="flex h-8 items-center gap-1.5 rounded-np-md bg-np-bg-2 px-3 text-xs hover:bg-np-bg-3">
          <Undo2 className="size-3.5" aria-hidden /> Reuse prompt
        </button>
        <details className="text-xs text-np-text-muted">
          <summary className="cursor-pointer select-none">Details</summary>
          {err.label}
          {task.error?.failCode ? ` · failCode ${task.error.failCode}` : err.code ? ` · code ${err.code}` : ""} — {err.message}
        </details>
      </div>
    </article>
  );
}

function CardHead({ task, status, tone }: { task: TaskRecord; status: string; tone: "success" | "danger" | "warning" | "muted" }) {
  const Icon = tone === "danger" ? CircleAlert : tone === "warning" ? AlertTriangle : tone === "muted" ? Pause : Clapperboard;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon
        className={cn(
          "size-4 shrink-0",
          tone === "danger" && "text-np-danger",
          tone === "warning" && "text-np-warning",
          tone === "muted" && "text-np-text-muted",
          tone === "success" && "text-np-success",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "font-medium",
          tone === "danger" && "text-np-danger",
          tone === "warning" && "text-np-warning",
          tone === "muted" && "text-np-text-secondary",
        )}
      >
        {status}
      </span>
      <span className="truncate text-np-text-muted">{task.modelTitle}</span>
    </div>
  );
}

function DoneCard({
  task,
  output,
  aspect,
  prompt,
  onAction,
}: {
  task: TaskRecord;
  output: TaskOutput;
  aspect: string;
  prompt?: string;
  onAction: (a: CardAction, task: TaskRecord, output?: TaskOutput) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const src = fileUrl(output);
  const act = (a: CardAction) => () => onAction(a, task, output);

  return (
    <article
      data-task-id={task.id}
      className="group relative overflow-hidden rounded-np-lg bg-np-bg-2 transition-transform duration-200 ease-np-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
      onMouseEnter={() => {
        if (!reducedMotion()) void video.current?.play().catch(() => {});
      }}
      onMouseLeave={() => video.current?.pause()}
    >
      <button onClick={act("open")} className="block w-full" aria-label={`Open ${task.modelTitle} result`}>
        {!src ? (
          <div className="flex items-center justify-center p-6 text-xs text-np-warning" style={{ aspectRatio: aspect }}>
            Not saved locally. Use “Retry download”.
          </div>
        ) : output.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- local file of unknown size
          <img src={src} alt={prompt ?? task.modelTitle} className="block w-full" loading="lazy" />
        ) : output.kind === "video" ? (
          <video ref={video} src={src} muted loop playsInline preload="metadata" className="block w-full" aria-label={prompt ?? task.modelTitle} />
        ) : (
          <div className="grid gap-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <FileAudio className="size-4 text-np-text-secondary" aria-hidden />
              <span className="truncate">{prompt ?? task.modelTitle}</span>
            </div>
          </div>
        )}
      </button>
      {src && output.kind === "audio" && (
        <div className="px-4 pb-4">
          <audio src={src} controls className="w-full" />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1 bg-np-scrim p-2 opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100",
          output.kind === "audio" && "static bg-transparent opacity-100",
        )}
      >
        <span className="mr-auto min-w-0 truncate px-1 text-xs text-np-text-secondary">{task.modelTitle}</span>
        <IconAction label="Reuse prompt" onClick={act("reuse")} icon={Undo2} />
        {output.kind === "image" && src && <IconAction label="Use as reference" onClick={act("reference")} icon={ImagePlus} />}
        {output.kind === "image" && src && <IconAction label="Animate" onClick={act("animate")} icon={Clapperboard} />}
        <IconAction label="Open" onClick={act("open")} icon={Maximize2} />
        {src ? (
          <a
            href={fileUrl(output, true)!}
            className="flex size-8 items-center justify-center rounded-np-md text-np-text-primary hover:bg-np-bg-3"
            aria-label="Download"
            title="Download"
          >
            <Download className="size-4" />
          </a>
        ) : (
          <IconAction label="Retry download" onClick={act("redownload")} icon={RotateCcw} />
        )}
      </div>
    </article>
  );
}

function IconAction({ label, onClick, icon: Icon }: { label: string; onClick: () => void; icon: typeof Download }) {
  return (
    <button
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-np-md text-np-text-primary hover:bg-np-bg-3"
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </button>
  );
}
