"use client";

import { Diamond, KeyRound, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TaskRecord } from "@/lib/task-types";
import { cn } from "@/lib/utils";
import { api } from "@/components/studio/api";
import { useStudio } from "@/components/studio/app-context";
import { ErrorText } from "@/components/studio/error-text";
import { KeyDialog } from "@/components/studio/key-dialog";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 }).replace(/,/g, " ");

/** Credit balance pill; opens API key status and recent spend. */
export function AccountPill() {
  const { keySource, credits, refreshCredits } = useStudio();
  const [open, setOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [recent, setRecent] = useState<TaskRecord[]>([]);

  useEffect(() => {
    if (!open) return;
    void api<{ tasks: TaskRecord[] }>("/api/tasks?limit=12").then((r) => setRecent(r.tasks));
  }, [open, credits.balance]);

  const low = credits.balance !== null && credits.balance < 50;
  const spent = recent.reduce((n, t) => n + (t.creditsConsumed ?? 0), 0);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-np-full bg-np-bg-2 px-3 text-sm font-medium tabular-nums transition-colors duration-150 hover:bg-np-bg-3",
                open && "bg-np-bg-3",
              )}
              aria-label="Credits and API key"
            />
          }
        >
          <Diamond className="size-3.5 text-np-accent-text" aria-hidden />
          {credits.balance !== null ? (
            <span>
              {fmt(credits.balance)}
              <span className="hidden text-np-text-muted sm:inline"> credits</span>
            </span>
          ) : (
            <span className="text-np-text-muted">{credits.error ? "Key error" : "…"}</span>
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-4 p-4">
          <div className="grid gap-1">
            <div className="text-xs font-medium text-np-text-muted">Balance</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[28px] leading-8 font-semibold tabular-nums">
                {credits.balance !== null ? fmt(credits.balance) : "—"}
              </span>
              {credits.balance !== null && <span className="text-np-text-muted">≈ ${(credits.balance * 0.005).toFixed(2)}</span>}
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                onClick={() => void refreshCredits()}
                aria-label="Refresh balance"
              >
                <RefreshCw className={cn(credits.loading && "animate-spin")} />
              </Button>
            </div>
            {low && (
              <span className="w-fit rounded-np-sm bg-np-warning-soft px-2 py-0.5 text-xs text-np-warning">Low credits</span>
            )}
            {credits.error && <ErrorText error={credits.error} />}
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-medium text-np-text-muted">API key</div>
            <div className="text-[13px] text-np-text-secondary">
              {keySource === "env" ? "From .env.local (takes priority)" : keySource === "cookie" ? "Saved on this computer" : "Not connected"}
            </div>
            <Button variant="secondary" onClick={() => setKeyOpen(true)}>
              <KeyRound /> Manage API key
            </Button>
          </div>

          <div className="grid gap-1.5">
            <div className="flex text-xs font-medium text-np-text-muted">
              <span>Recent spend</span>
              <span className="ml-auto tabular-nums">{fmt(spent)} credits</span>
            </div>
            {recent.length === 0 && <div className="text-[13px] text-np-text-muted">No generations yet.</div>}
            <ul className="grid max-h-48 gap-1 overflow-y-auto">
              {recent.map((t) => (
                <li key={t.id} className="flex gap-2 text-[13px]">
                  <span className="min-w-0 flex-1 truncate text-np-text-secondary">{t.modelTitle}</span>
                  <span className="tabular-nums">{t.creditsConsumed !== null ? fmt(t.creditsConsumed) : "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </PopoverContent>
      </Popover>
      <KeyDialog open={keyOpen} onOpenChange={setKeyOpen} />
    </>
  );
}
