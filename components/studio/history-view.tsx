"use client";

import { useMemo, useState } from "react";
import type { TaskRecord } from "@/lib/task-types";
import { cn } from "@/lib/utils";
import { useStudio } from "./app-context";
import { CATEGORIES } from "./sidebar";
import { TaskCard } from "./task-card";
import { useTasks } from "./use-tasks";

const FILTERS: { id: string; label: string; match: (t: TaskRecord) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "active", label: "In progress", match: (t) => ["submitting", "pending", "running"].includes(t.state) },
  { id: "success", label: "Done", match: (t) => t.state === "success" },
  { id: "fail", label: "Failed", match: (t) => ["fail", "submit_failed", "submit_unknown"].includes(t.state) },
  { id: "stopped", label: "Stopped / timed out", match: (t) => t.tracking !== "active" },
];

export function HistoryView() {
  const { category } = useStudio();
  const [allCats, setAllCats] = useState(true);
  const [filter, setFilter] = useState("all");
  const { tasks, loaded, act } = useTasks({ limit: 1000, category: allCats ? undefined : category });
  const list = useMemo(() => tasks.filter(FILTERS.find((f) => f.id === filter)!.match), [tasks, filter]);

  const totals = useMemo(() => {
    const charged = tasks.reduce((n, t) => n + (t.creditsConsumed ?? 0), 0);
    return { charged: Math.round(charged * 100) / 100, count: tasks.length };
  }, [tasks]);

  return (
    <main className="mx-auto grid w-full max-w-4xl content-start gap-4 p-4">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">History</h1>
        <span className="text-xs text-muted-foreground">
          {totals.count} tasks · {totals.charged} credits charged (Kie-reported) · files in ./data/outputs
        </span>
      </header>
      <div className="flex flex-wrap gap-1 text-sm">
        <Chip active={allCats} onClick={() => setAllCats(true)}>
          All categories
        </Chip>
        <Chip active={!allCats} onClick={() => setAllCats(false)}>
          {CATEGORIES.find((c) => c.id === category)?.label} only
        </Chip>
        <span className="mx-2 border-l" />
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} ({tasks.filter(f.match).length})
          </Chip>
        ))}
      </div>
      {!loaded && <p className="text-sm text-muted-foreground">Loading…</p>}
      {loaded && list.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
      <div className="grid gap-3">
        {list.map((t) => (
          <TaskCard key={t.id} task={t} onAction={act} />
        ))}
      </div>
    </main>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-full border px-2.5 py-0.5 hover:bg-muted", active && "bg-muted font-medium")}>
      {children}
    </button>
  );
}
