"use client";

import { Download, ExternalLink, Pause, Play, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isTerminal, type TaskOutput, type TaskRecord } from "@/lib/task-types";
import { cn } from "@/lib/utils";
import { ErrorText } from "./error-text";

const STATE_LABEL: Record<TaskRecord["state"], string> = {
  submitting: "Submitting",
  pending: "Queued",
  running: "Generating",
  success: "Done",
  fail: "Failed",
  submit_unknown: "Submit unknown",
  submit_failed: "Not submitted",
};

const STATE_TONE: Record<TaskRecord["state"], string> = {
  submitting: "bg-muted text-foreground",
  pending: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  running: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  fail: "bg-destructive/15 text-destructive",
  submit_unknown: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  submit_failed: "bg-destructive/15 text-destructive",
};

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function formatDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const fileUrl = (o: TaskOutput, download = false) =>
  o.localPath ? `/api/files/${o.localPath.split("/").map(encodeURIComponent).join("/")}${download ? "?download" : ""}` : null;

export function TaskCard({
  task,
  onAction,
  compact = false,
}: {
  task: TaskRecord;
  onAction: (id: string, action: "stop" | "resume" | "redownload" | "poll") => Promise<void>;
  compact?: boolean;
}) {
  const live = task.tracking === "active" && !isTerminal(task.state);
  const now = useNow(live);
  const start = task.submittedAt ?? task.createdAt;
  const elapsed = (task.completedAt ?? now) - start;
  const [busy, setBusy] = useState(false);
  const delta = task.creditsBefore !== null && task.creditsAfter !== null ? task.creditsBefore - task.creditsAfter : null;
  const missing = task.outputs.filter((o) => !o.localPath).length;

  const run = async (a: "stop" | "resume" | "redownload" | "poll") => {
    setBusy(true);
    try {
      await onAction(task.id, a);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="grid gap-3 rounded-lg border bg-card p-3 text-sm">
      <header className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", STATE_TONE[task.state])}>
          {STATE_LABEL[task.state]}
          {task.rawState && !isTerminal(task.state) ? ` · ${task.rawState}` : ""}
          {task.progress !== null && !isTerminal(task.state) ? ` · ${task.progress}%` : ""}
        </span>
        {task.tracking === "stopped" && !isTerminal(task.state) && <Badge variant="outline">Tracking stopped</Badge>}
        {task.tracking === "timed_out" && !isTerminal(task.state) && <Badge variant="outline">Tracking timed out</Badge>}
        <span className="font-medium">{task.modelTitle}</span>
        <code className="text-xs text-muted-foreground">{task.modelId}</code>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{formatDuration(elapsed)}</span>
      </header>

      {typeof task.input.prompt === "string" && !compact && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{task.input.prompt}</p>
      )}

      {task.error && <ErrorText error={task.error} />}
      {task.pollError && !isTerminal(task.state) && (
        <ErrorText error={{ ...task.pollError, label: `Polling error (will retry) — ${task.pollError.label}` }} />
      )}

      {task.outputs.length > 0 && <Outputs outputs={task.outputs} />}
      {task.result !== null && task.result !== undefined && (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">{JSON.stringify(task.result, null, 2)}</pre>
      )}

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {task.kieTaskId && !task.kieTaskId.startsWith("local-") && (
          <span>
            taskId <code className="select-all">{task.kieTaskId}</code>
          </span>
        )}
        <span>
          est. {task.estimate?.credits ?? "?"} cr
        </span>
        {task.creditsConsumed !== null && <span className="text-foreground">charged {task.creditsConsumed} cr (Kie)</span>}
        {task.creditsBefore !== null && (
          <span title="Account balance before submit / after completion. Concurrent tasks affect the difference.">
            balance {task.creditsBefore} → {task.creditsAfter ?? "…"}
            {delta !== null && ` (Δ ${Math.round(delta * 100) / 100})`}
          </span>
        )}
        <span>{new Date(task.createdAt).toLocaleString()}</span>

        <div className="ml-auto flex gap-1">
          {live && (
            <Tooltip>
              <TooltipTrigger render={<Button size="xs" variant="outline" disabled={busy} onClick={() => run("stop")} />}>
                <Pause /> Stop tracking
              </TooltipTrigger>
              <TooltipContent>Generation continues on Kie.ai and will still be charged.</TooltipContent>
            </Tooltip>
          )}
          {!live && !isTerminal(task.state) && task.kieTaskId && (
            <Button size="xs" variant="outline" disabled={busy} onClick={() => run("resume")}>
              <Play /> Resume tracking
            </Button>
          )}
          {live && (
            <Button size="xs" variant="ghost" disabled={busy} onClick={() => run("poll")} title="Check status now">
              <RefreshCw />
            </Button>
          )}
          {missing > 0 && (
            <Button size="xs" variant="outline" disabled={busy} onClick={() => run("redownload")}>
              <Download /> Retry download ({missing})
            </Button>
          )}
        </div>
      </footer>
    </article>
  );
}

function Outputs({ outputs }: { outputs: TaskOutput[] }) {
  const images = outputs.filter((o) => o.kind === "image");
  const others = outputs.filter((o) => o.kind !== "image");
  return (
    <div className="grid gap-2">
      {images.length > 0 && (
        <div className={cn("grid gap-2", images.length > 1 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {images.map((o, i) => (
            <MediaFrame key={i} output={o}>
              {fileUrl(o) ? (
                // eslint-disable-next-line @next/next/no-img-element -- local file of unknown size
                <img src={fileUrl(o)!} alt="" className="max-h-[480px] w-full rounded-md object-contain bg-muted" />
              ) : null}
            </MediaFrame>
          ))}
        </div>
      )}
      {others.map((o, i) => (
        <MediaFrame key={i} output={o}>
          {fileUrl(o) && o.kind === "video" && <video src={fileUrl(o)!} controls className="max-h-[480px] w-full rounded-md bg-black" />}
          {fileUrl(o) && o.kind === "audio" && <audio src={fileUrl(o)!} controls className="w-full" />}
          {fileUrl(o) && o.kind === "file" && <div className="rounded-md bg-muted p-2 text-xs">{o.localPath}</div>}
        </MediaFrame>
      ))}
    </div>
  );
}

function MediaFrame({ output, children }: { output: TaskOutput; children: React.ReactNode }) {
  const dl = fileUrl(output, true);
  return (
    <figure className="grid gap-1">
      {children}
      {!output.localPath && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300">
          Not saved locally: {output.downloadError}
        </div>
      )}
      <figcaption className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{output.source}</span>
        {output.bytes !== undefined && <span>{(output.bytes / 1048576).toFixed(2)} MB</span>}
        {dl && (
          <a className="ml-auto inline-flex items-center gap-1 hover:text-foreground" href={dl}>
            <Download className="size-3.5" /> Download
          </a>
        )}
        <a
          className={cn("inline-flex items-center gap-1 hover:text-foreground", !dl && "ml-auto")}
          href={output.url}
          target="_blank"
          rel="noreferrer"
          title="Original Kie.ai URL (deleted after 14 days)"
        >
          <ExternalLink className="size-3.5" /> Original
        </a>
      </figcaption>
    </figure>
  );
}
