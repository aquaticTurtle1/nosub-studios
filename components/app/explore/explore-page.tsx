"use client";

import { Clapperboard, ImageUp, type LucideIcon, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { type Handoff, useStudio } from "@/components/studio/app-context";
import { useTasks } from "@/components/studio/use-tasks";
import type { TaskOutput, TaskRecord } from "@/lib/task-types";
import { Feed } from "../media/feed";
import { Lightbox, lightboxItems } from "../media/lightbox";
import { isCloud } from "@/lib/mode";
import { outputUsable } from "@/lib/ui/output-media";
import { fileUrl } from "../media/media-card";
import { useCardActions } from "../media/use-card-actions";
import { ExamplesDialog } from "./examples-dialog";

interface Start {
  title: string;
  text: string;
  cta: string;
  icon: LucideIcon;
  /** Which of your outputs previews the card. */
  preview: "video" | "image";
  /** Where it goes: a page with a family (and preset) preselected, or a plain link. */
  handoff?: Handoff;
  href: string;
}

const STARTS: Start[] = [
  {
    title: "Text to video",
    text: "Describe a scene and get a short clip.",
    cta: "Open Video",
    icon: Clapperboard,
    preview: "video",
    href: "/video",
    handoff: { mode: "video", items: [], family: "pixverse-v6" },
  },
  {
    title: "Animate a photo",
    text: "Pick a photo and give it motion.",
    cta: "Pick a photo",
    icon: Sparkles,
    preview: "image",
    href: "/video",
    handoff: { mode: "video", items: [], family: "pixverse-v6", openLibrary: true },
  },
  {
    title: "Product shot",
    text: "Studio light on a clean backdrop.",
    cta: "Open Image",
    icon: Wand2,
    preview: "image",
    href: "/image",
    handoff: { mode: "image", items: [], family: "nano-banana-pro", preset: "studio-product" },
  },
  { title: "Upscale", text: "A larger, sharper version of an image.", cta: "Open Upscale", icon: ImageUp, preview: "image", href: "/tools/upscale-image" },
];

const subscribeMotion = (cb: () => void) => {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);

/** Newest local output of a kind, for hero previews. */
function latest(tasks: TaskRecord[], kind: "image" | "video", skip = 0): string | null {
  const found: string[] = [];
  for (const t of tasks) {
    if (t.state !== "success") continue;
    for (const o of t.outputs as TaskOutput[]) if (o.kind === kind && outputUsable(t, o) && fileUrl(o)) found.push(fileUrl(o)!);
  }
  return found[skip] ?? found[0] ?? null;
}

/** Explore: where to start, and what you've made. Previews are your own generations only. */
export function ExplorePage() {
  const router = useRouter();
  const { setHandoff } = useStudio();
  const { tasks, loaded, act, upsert } = useTasks({ limit: 120 });
  const { onAction, lightbox, openLightbox, closeLightbox } = useCardActions({ act });
  const reduced = useReducedMotion();
  const [examples, setExamples] = useState(false);
  const done = useMemo(() => tasks.filter((t) => t.state === "success" && t.outputs.some((o) => outputUsable(t, o))).slice(0, 24), [tasks]);

  return (
    <main className="mx-auto grid w-full max-w-7xl content-start gap-10 p-4 sm:p-6">
      <header className="grid gap-2 pt-2">
        <h1 className="font-display text-[34px] leading-tight font-semibold sm:text-[48px] sm:leading-[56px]">What are we making?</h1>
        <p className="max-w-[60ch] text-sm text-np-text-secondary">
          {isCloud()
            ? "Pick a starting point. Everything runs on your Kie.ai key. Kie.ai keeps your results for 14 days, and your history follows the key."
            : "Pick a starting point. Everything runs on your Kie.ai key, and the files stay on this computer."}
        </p>
      </header>

      <section aria-label="Start here" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STARTS.map((s, i) => {
          const src = latest(tasks, s.preview, s.preview === "image" ? i : 0);
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              onClick={(e) => {
                if (!s.handoff) return;
                e.preventDefault();
                setHandoff(s.handoff);
                router.push(s.href);
              }}
              className="group grid overflow-hidden rounded-np-xl bg-np-bg-1 transition-transform duration-200 ease-np-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-np-focus-ring motion-reduce:hover:translate-y-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-np-bg-2">
                {src && s.preview === "video" ? (
                  <video
                    src={reduced ? `${src}#t=0.1` : src}
                    muted
                    loop
                    playsInline
                    autoPlay={!reduced}
                    preload="metadata"
                    className="size-full object-cover"
                    aria-hidden
                  />
                ) : src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local generation
                  <img src={src} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-np-accent-soft to-np-bg-3 text-np-text-secondary">
                    <Icon className="size-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="grid gap-1 p-3 sm:p-4">
                <span className="flex items-center gap-2 font-display text-base font-semibold sm:text-lg">
                  <Icon className="size-4 text-np-accent-text" aria-hidden />
                  {s.title}
                </span>
                <span className="text-sm text-np-text-secondary max-sm:hidden">{s.text}</span>
                <span className="pt-1 text-sm font-medium sm:pt-2 text-np-accent-text group-hover:underline">{s.cta}</span>
              </div>
            </Link>
          );
        })}
      </section>

      <section aria-labelledby="your-work" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <h2 id="your-work" className="font-display text-xl font-semibold">
              Your latest
            </h2>
            <p className="text-sm text-np-text-muted">
              {done.length ? "Newest first. Hover a video to play it." : "Nothing finished yet. Start above, or fill this with a few cheap examples."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setExamples(true)}>
              Generate examples
            </Button>
            {done.length > 0 && (
              <Button variant="ghost" render={<Link href="/library" />} nativeButton={false}>
                Open Library
              </Button>
            )}
          </div>
        </div>
        {loaded && <Feed tasks={done} fallbackAspect="1 / 1" onAction={onAction} />}
      </section>

      <Lightbox item={lightbox} items={lightboxItems(done)} onChange={openLightbox} onClose={closeLightbox} onAction={onAction} />
      <ExamplesDialog open={examples} onOpenChange={setExamples} onStarted={upsert} />
    </main>
  );
}
