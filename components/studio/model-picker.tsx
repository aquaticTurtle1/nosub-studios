"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LIVE_TESTED } from "@/lib/catalog/live-tested";
import type { CatalogSummary, Category } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export const humanOp = (op: string) => op.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function groupByOperation(list: CatalogSummary[]) {
  const map = new Map<string, CatalogSummary[]>();
  for (const m of list) {
    if (!map.has(m.operation)) map.set(m.operation, []);
    map.get(m.operation)!.push(m);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

/** The model shown first in the picker for a category. */
export function firstModelKey(models: CatalogSummary[], category: Category): string | null {
  return groupByOperation(models.filter((m) => m.category === category))[0]?.[1][0]?.key ?? null;
}

export function ModelPicker({
  models,
  category,
  selected,
  onSelect,
}: {
  models: CatalogSummary[];
  category: Category;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = models.filter(
      (m) =>
        m.category === category &&
        (!needle || `${m.title} ${m.modelId} ${m.provider} ${m.operation}`.toLowerCase().includes(needle)),
    );
    return groupByOperation(list);
  }, [models, category, q]);
  const total = groups.reduce((n, [, l]) => n + l.length, 0);

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
        <Input className="pl-8" placeholder={`Search ${total} models…`} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1">
        {groups.map(([op, list]) => (
          <section key={op} className="mb-3">
            <h3 className="sticky top-0 z-10 bg-background/95 px-1 py-1 text-xs font-medium text-muted-foreground uppercase backdrop-blur">
              {humanOp(op)} <span className="font-normal">· {list.length}</span>
            </h3>
            <ul className="grid gap-0.5">
              {list.map((m) => (
                <li key={m.key}>
                  <button
                    onClick={() => onSelect(m.key)}
                    className={cn(
                      "grid w-full min-w-0 gap-0.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                      selected === m.key && "bg-muted ring-1 ring-border",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium">{m.title}</span>
                      {m.issues.length > 0 && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300" title={m.issues.join("\n")}>
                          unverified
                        </Badge>
                      )}
                      {m.free && <Badge variant="secondary">free</Badge>}
                      {LIVE_TESTED[m.key] && <Badge variant="secondary">tested</Badge>}
                    </span>
                    <code className="truncate text-[11px] text-muted-foreground">{m.modelId}</code>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {total === 0 && <p className="p-2 text-sm text-muted-foreground">No models match.</p>}
      </div>
    </div>
  );
}
