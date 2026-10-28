"use client";

import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { type Family, familyKinds, familyNeedsRef } from "@/lib/catalog/families";
import { LIVE_TESTED } from "@/lib/catalog/live-tested";
import type { CatalogSummary } from "@/lib/catalog/types";
import type { TaskRecord } from "@/lib/task-types";
import { cn } from "@/lib/utils";
import { lastThumb, ModelThumb } from "./model-thumb";
import { humanOp } from "./mode-config";

const unitShort = (u: string | null) => (!u ? "" : u.replace(/^per /, "/").replace("second", "s").replace(/generation|request|video/, "run").replace("image", "img"));
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ""));

export function familyPrice(f: Family): string | null {
  const es = f.entries.filter((e) => e.meta.minCredits !== null);
  if (f.entries.every((e) => e.free)) return "Free";
  if (!es.length) return null;
  const lo = Math.min(...es.map((e) => e.meta.minCredits!));
  const hi = Math.max(...es.map((e) => e.meta.maxCredits!));
  const units = [...new Set(es.map((e) => e.meta.priceUnit))];
  return `${lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`}${units.length === 1 ? unitShort(units[0]) : ""}`;
}

export function familyTags(f: Family): string[] {
  const tags: string[] = [];
  const res = f.entries.map((e) => e.meta.maxResolution).filter(Boolean) as string[];
  const order = ["360p", "480p", "540p", "580p", "720p", "768p", "1080p", "2K", "1440p", "4K"];
  if (res.length) tags.push(res.sort((a, b) => order.indexOf(b) - order.indexOf(a))[0]);
  const lo = Math.min(...f.entries.map((e) => e.meta.minDuration ?? Infinity));
  const hi = Math.max(...f.entries.map((e) => e.meta.maxDuration ?? 0));
  if (hi > 0) tags.push(lo === hi || !Number.isFinite(lo) ? `${fmt(hi)}s` : `${fmt(lo)}s–${fmt(hi)}s`);
  return tags;
}

function Badge({ f }: { f: Family }) {
  if (f.entries.some((e) => e.issues.length)) {
    return <span className="rounded-np-sm bg-np-warning-soft px-1.5 text-[11px] leading-5 text-np-warning">Unverified</span>;
  }
  if (f.badge) return <span className="rounded-np-sm bg-np-accent-soft px-1.5 text-[11px] leading-5 text-np-accent-text">{f.badge}</span>;
  // Ran for real through this app at least once (lib/catalog/live-tested.ts).
  const tested = f.entries.find((e) => LIVE_TESTED[e.key]);
  if (tested) {
    return (
      <span className="rounded-np-sm bg-np-success-soft px-1.5 text-[11px] leading-5 text-np-success" title={`${tested.title.trim()}: ${LIVE_TESTED[tested.key].note}`}>
        Tested
      </span>
    );
  }
  return null;
}

export function FamilyPicker({
  families,
  family,
  pinnedKey,
  recentIds,
  tasks,
  onFamily,
  onPin,
  children,
}: {
  families: Family[];
  family: Family | null;
  /** The pinned catalog key, when "Show all variants" was used. */
  pinnedKey: string | null;
  recentIds: string[];
  tasks: TaskRecord[];
  onFamily: (id: string) => void;
  onPin: (key: string) => void;
  /** The Model field, used as the popover anchor. */
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState(false);
  const recent = recentIds.map((id) => families.find((f) => f.id === id)).filter(Boolean).slice(0, 4) as Family[];
  const featured = families.filter((f) => f.featured);
  const all = useMemo(() => [...families].sort((a, b) => a.name.localeCompare(b.name)), [families]);

  const thumbFor = (f: Family) => {
    for (const e of f.entries) {
      const t = lastThumb(tasks, e.key);
      if (t) return t;
    }
    return null;
  };

  const row = (f: Family, prefix: string) => {
    const tags = familyTags(f);
    const price = familyPrice(f);
    const selected = family?.id === f.id && !pinnedKey;
    return (
      <CommandItem
        key={prefix + f.id}
        value={prefix + f.id}
        keywords={[f.name, ...f.entries.map((e) => e.modelId)]}
        onSelect={() => {
          onFamily(f.id);
          setOpen(false);
        }}
        className="h-12 gap-2.5 rounded-np-md! px-2 data-selected:bg-np-bg-2 [&>svg:last-child]:hidden"
      >
        <ModelThumb model={f.entries[0]} thumb={thumbFor(f)} className="size-8" />
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium">{f.name}</span>
            <Badge f={f} />
          </span>
          <span className="flex gap-1">
            {tags.map((t) => (
              <span key={t} className="rounded-np-sm bg-np-bg-3 px-1 text-[11px] leading-4 text-np-text-secondary">
                {t}
              </span>
            ))}
            {familyNeedsRef(f) && familyKinds(f).length > 0 && (
              <span className="rounded-np-sm bg-np-bg-3 px-1 text-[11px] leading-4 text-np-text-secondary">Needs {familyKinds(f)[0]}</span>
            )}
          </span>
        </span>
        {price && <span className="shrink-0 text-xs text-np-text-muted tabular-nums">{price}</span>}
        <Check className={cn("size-4 shrink-0 text-np-accent-text", !selected && "invisible")} aria-hidden />
      </CommandItem>
    );
  };

  const entryRow = (e: CatalogSummary, f: Family) => (
    <CommandItem
      key={`entry:${e.key}`}
      value={`entry:${e.key}`}
      keywords={[f.name, e.title, e.modelId, humanOp(e.operation)]}
      onSelect={() => {
        onPin(e.key);
        setOpen(false);
      }}
      className="h-11 gap-2.5 rounded-np-md! px-2 data-selected:bg-np-bg-2 [&>svg:last-child]:hidden"
    >
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-sm">{e.title.trim()}</span>
        <span className="truncate text-[11px] text-np-text-muted">
          {humanOp(e.operation)} · {e.modelId}
        </span>
      </span>
      {e.issues.length > 0 && <span className="rounded-np-sm bg-np-warning-soft px-1.5 text-[11px] leading-5 text-np-warning">Unverified</span>}
      <Check className={cn("size-4 shrink-0 text-np-accent-text", pinnedKey !== e.key && "invisible")} aria-hidden />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children} />
      <PopoverContent
        align="start"
        side="right"
        sideOffset={8}
        className="w-[min(420px,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
      >
        <Command className="max-h-[min(70dvh,600px)] min-h-0 rounded-np-lg! bg-transparent p-1.5" loop>
          <CommandInput placeholder="Search models" autoFocus />
          <CommandList className="mt-1 max-h-none min-h-0 flex-1 overflow-y-auto">
            <CommandEmpty className="text-np-text-muted">No models match.</CommandEmpty>
            {!variants && recent.length > 0 && <CommandGroup heading="Recent">{recent.map((f) => row(f, "recent:"))}</CommandGroup>}
            {!variants && featured.length > 0 && <CommandGroup heading="Featured">{featured.map((f) => row(f, "featured:"))}</CommandGroup>}
            {!variants && <CommandGroup heading={`All models · ${all.length}`}>{all.map((f) => row(f, ""))}</CommandGroup>}
            {variants &&
              all.map((f) => (
                <CommandGroup key={f.id} heading={f.name}>
                  {f.entries.map((e) => entryRow(e, f))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
        <label className="flex items-center justify-between gap-3 border-t border-np-border-subtle px-3 py-2.5 text-[13px] text-np-text-secondary">
          <span>
            Show all variants
            <span className="block text-[11px] text-np-text-muted">
              {families.reduce((n, f) => n + f.entries.length, 0)} catalog entries; picking one turns off auto-routing
            </span>
          </span>
          <Switch checked={variants} onCheckedChange={setVariants} />
        </label>
      </PopoverContent>
    </Popover>
  );
}

export function ModelFieldButton({
  family,
  thumb,
  ...props
}: React.ComponentProps<"button"> & { family: Family | null; thumb: string | null }) {
  return (
    <button
      {...props}
      className="flex w-full items-center gap-3 rounded-np-md bg-np-bg-2 p-2.5 text-left transition-colors duration-150 hover:bg-np-bg-3 aria-expanded:bg-np-bg-3"
    >
      {family && <ModelThumb model={family.entries[0]} thumb={thumb} className="size-10" />}
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-sm font-medium">{family?.name ?? "Choose a model"}</span>
        {family && <span className="truncate text-xs text-np-text-muted">{familyTags(family).join(" · ")}</span>}
      </span>
      <ChevronDown className="size-4 shrink-0 text-np-text-muted" aria-hidden />
    </button>
  );
}
