"use client";

import {
  AudioLines,
  Eraser,
  FileAudio,
  Film,
  ImageUp,
  Layers,
  LifeBuoy,
  type LucideIcon,
  MicOff,
  Music,
  Scan,
  Sparkles,
  Text,
  User,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { familiesFor } from "@/lib/catalog/families";
import { SECTIONS, TOOLS, type ToolDef } from "@/lib/catalog/tools";
import { familyPrice } from "../generation/family-picker";
import { useCatalog } from "../use-catalog";

const ICONS: Record<ToolDef["icon"], LucideIcon> = {
  "image-up": ImageUp,
  eraser: Eraser,
  layers: Layers,
  scan: Scan,
  video: Video,
  film: Film,
  "mic-off": MicOff,
  "audio-lines": AudioLines,
  "file-audio": FileAudio,
  music: Music,
  text: Text,
  sparkles: Sparkles,
  "life-buoy": LifeBuoy,
  user: User,
  volume: Volume2,
  users: Users,
};

/** Tools: one card per job, grouped by what it works on. Each card opens its own panel. */
export function ToolsPage() {
  const summaries = useCatalog();
  const families = useMemo(() => new Map(familiesFor("tools", summaries).map((f) => [f.id, f])), [summaries]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 p-4 sm:p-6">
      <header className="grid gap-1">
        <h1 className="font-display text-2xl font-semibold">Tools</h1>
        <p className="text-sm text-np-text-secondary">Upscale, clean up, convert and prepare media. Each tool has its own short panel.</p>
      </header>
      {SECTIONS.map((section) => (
        <section key={section} className="grid gap-3" aria-labelledby={`tools-${section}`}>
          <h2 id={`tools-${section}`} className="text-sm font-medium text-np-text-secondary">
            {section}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TOOLS.filter((t) => t.section === section).map((t) => {
              const f = families.get(t.id);
              const Icon = ICONS[t.icon];
              const price = f ? familyPrice(f) : null;
              const unverified = f?.entries.some((e) => e.issues.length);
              return (
                <li key={t.id}>
                  <Link
                    href={`/tools/${t.id}`}
                    className="flex h-full gap-3 rounded-np-lg bg-np-bg-1 p-4 transition-colors duration-150 hover:bg-np-bg-2 focus-visible:outline-2 focus-visible:outline-np-focus-ring"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-np-md bg-np-bg-3 text-np-accent-text">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="grid min-w-0 content-start gap-1">
                      <span className="text-sm font-medium text-np-text-primary">{t.name}</span>
                      <span className="text-xs text-np-text-secondary">{t.blurb}</span>
                      <span className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-np-text-muted">
                        {price && <span className="tabular-nums" title="Credits, as on the kie.ai pricing page">{price}</span>}
                        {t.members.length > 1 && <span>{t.members.length} engines</span>}
                        {unverified && <span className="rounded-np-sm bg-np-warning-soft px-1.5 leading-5 text-np-warning">Unverified</span>}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
