"use client";

import { EditorContent, type Editor } from "@tiptap/react";
import { AudioLines, Maximize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PRESETS } from "@/lib/presets";
import { fmtCount } from "@/lib/ui/prompt-doc";
import { cn } from "@/lib/utils";
import { type ChipRef, type Suggest, usePromptEditor } from "./prompt-editor";

export type { ChipRef } from "./prompt-editor";

const HEIGHT_KEY = "studio.promptHeight";
const MIN_HEIGHT = 96;

function readHeight(): number | null {
  try {
    const n = Number(localStorage.getItem(HEIGHT_KEY));
    return n >= MIN_HEIGHT ? n : null;
  } catch {
    return null;
  }
}

function saveHeight(h: number | null) {
  try {
    if (h === null) localStorage.removeItem(HEIGHT_KEY);
    else localStorage.setItem(HEIGHT_KEY, String(Math.round(h)));
  } catch {}
}

/**
 * Prompt with reference chips, in a rich-text editor where a chip is a real inline node:
 * what you see is what you edit. Chips are atomic (Backspace removes the whole chip, the
 * caret steps over it), paste is plain text, undo/redo work as usual and Ctrl+Enter
 * generates. The value is still the plain prompt string with `@image_1` for each chip.
 */
export function PromptBox({
  value,
  onChange,
  placeholder,
  length,
  limit,
  refs,
  presetMode,
  invalid,
  compact,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /** Characters as sent (chips already replaced), and the model's documented limit. */
  length: number;
  limit: number | null;
  /** Attached references the prompt can point at. */
  refs: ChipRef[];
  presetMode: "image" | "video" | null;
  invalid?: boolean;
  compact?: boolean;
  /** How chips are sent to this model, when not by name. */
  hint?: string | null;
}) {
  const { editor, suggest, insertAtCaret } = usePromptEditor({ value, onChange, refs, placeholder });
  const [focusOpen, setFocusOpen] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const presets = useMemo(() => (presetMode ? PRESETS.filter((p) => p.modes.includes(presetMode)) : []), [presetMode]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- stored per browser, read after hydration
  useEffect(() => setHeight(readHeight()), []);

  const counter = (
    <span
      data-testid="prompt-counter"
      className={cn(
        "shrink-0 text-xs tabular-nums",
        limit && length > limit ? "text-np-danger" : limit && length >= limit * 0.9 ? "text-np-warning" : "text-np-text-muted",
      )}
    >
      {fmtCount(length)}
      {limit ? ` / ${fmtCount(limit)}` : length === 1 ? " character" : " characters"}
    </span>
  );

  return (
    <section className="grid gap-2">
      <span id="prompt-label" className="text-xs font-medium text-np-text-secondary">
        Prompt
      </span>
      <div className={cn("relative rounded-np-md bg-np-bg-2", invalid && "outline-1 outline-np-danger")}>
        {focusOpen ? (
          <p className="flex min-h-24 items-center justify-center px-3 text-sm text-np-text-muted">Editing in the focus view</p>
        ) : (
          <EditorFrame
            editor={editor}
            suggest={suggest}
            refs={refs}
            style={height ? ({ "--prompt-h": `${height}px` } as React.CSSProperties) : undefined}
            className={cn(
              "min-h-[var(--prompt-h,260px)] max-h-[max(var(--prompt-h,260px),50dvh)] pr-8 text-sm leading-5",
              compact && "max-lg:h-[72px] max-lg:min-h-0",
            )}
          />
        )}
        <button
          type="button"
          onClick={() => setFocusOpen(true)}
          aria-label="Expand prompt"
          title="Expand prompt"
          className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-np-sm text-np-text-muted transition-colors duration-150 hover:bg-np-bg-3 hover:text-np-text-primary"
        >
          <Maximize2 className="size-3.5" aria-hidden />
        </button>
        {!focusOpen && <ResizeHandle height={height} onHeight={setHeight} className={cn(compact && "max-lg:hidden")} />}
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {hint ? (
            <p id="prompt-hint" className="text-xs text-np-text-muted" data-testid="prompt-hint">
              {hint}
            </p>
          ) : (
            refs.length > 0 && !compact && <p className="text-xs text-np-text-muted">Type @ to point at a reference.</p>
          )}
        </div>
        {counter}
      </div>
      {presets.length > 0 && (
        <div className={cn("grid gap-1.5", compact && "max-lg:hidden")}>
          <span className="text-xs text-np-text-muted">Prompt helpers add a phrase where your cursor is</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => !value.includes(p.phrase) && insertAtCaret(p.phrase, true)}
                title={p.phrase}
                className="h-8 shrink-0 rounded-np-md bg-np-bg-2 px-3 text-[13px] text-np-text-secondary transition-colors duration-150 hover:bg-np-bg-3 hover:text-np-text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <Dialog open={focusOpen} onOpenChange={setFocusOpen}>
        <DialogContent
          showCloseButton={false}
          initialFocus={() => {
            editor?.commands.focus();
            return editor?.view.dom ?? true;
          }}
          className={cn(
            "flex h-[85dvh] max-h-none w-[90vw] max-w-none flex-col gap-0 overflow-hidden bg-np-bg-1 p-0 sm:max-w-none",
            "max-sm:h-dvh max-sm:w-screen max-sm:rounded-none",
          )}
        >
          <div className="flex items-center gap-3 border-b border-np-border-subtle px-5 py-3">
            <DialogTitle className="font-display text-base font-semibold">Prompt</DialogTitle>
            <span className="ml-auto">{counter}</span>
          </div>
          <div className="flex min-h-0 flex-1 max-md:flex-col">
            {/* The same editor, moved here: one document, one undo history. */}
            {focusOpen && (
              <EditorFrame
                editor={editor}
                suggest={suggest}
                refs={refs}
                className="h-full text-[15px] leading-6 [&_.ProseMirror]:px-6 [&_.ProseMirror]:py-5"
                frameClassName="min-h-0 flex-1"
              />
            )}
            {refs.length > 0 && (
              <aside aria-label="References" className="np-scroll grid shrink-0 content-start gap-1 overflow-y-auto border-np-border-subtle p-3 md:w-60 md:border-l max-md:max-h-32 max-md:border-t">
                <span className="px-1 pb-1 text-xs text-np-text-muted">Click to add to the prompt</span>
                {refs.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertAtCaret(`@${r.label}`)}
                    aria-label={`Insert ${r.label}`}
                    className="flex items-center gap-2 rounded-np-sm p-1.5 text-left text-sm hover:bg-np-bg-2"
                  >
                    <ChipThumb r={r} className="size-10 shrink-0 rounded-np-sm" />
                    <span className="grid min-w-0">
                      <span className="font-medium text-np-accent-text">{r.label}</span>
                      <span className="truncate text-xs text-np-text-muted">{r.name}</span>
                    </span>
                  </button>
                ))}
              </aside>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-np-border-subtle px-5 py-3">
            <span className="mr-auto text-xs text-np-text-muted">Esc closes · Ctrl+Enter generates</span>
            <Button onClick={() => setFocusOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** The editor surface with its @ picker and chip previews. */
function EditorFrame({
  editor,
  suggest,
  refs,
  className,
  frameClassName,
  style,
}: {
  editor: Editor | null;
  suggest: Suggest | null;
  refs: ChipRef[];
  className?: string;
  frameClassName?: string;
  style?: React.CSSProperties;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null);
  const at = (r: DOMRect) => {
    const f = frame!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(r.left - f.left, f.width - 208)), top: r.top - f.top, bottom: r.bottom - f.top };
  };
  const pos = suggest?.rect && frame ? at(suggest.rect) : null;
  const hovered = hover ? refs.find((r) => r.label === hover.label) : undefined;

  return (
    <div
      ref={setFrame}
      className={cn("relative", frameClassName)}
      onMouseOver={(e) => {
        const chip = (e.target as HTMLElement).closest<HTMLElement>("[data-chip]");
        if (!chip) return hover && setHover(null);
        if (hover?.label === chip.dataset.chip) return;
        const p = at(chip.getBoundingClientRect());
        setHover({ label: chip.dataset.chip!, x: p.x, y: p.bottom });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <EditorContent
        editor={editor}
        style={style}
        data-testid="prompt-editor"
        className={cn(
          "np-scroll grid cursor-text overflow-y-auto rounded-np-md text-np-text-primary focus-within:outline-2 focus-within:outline-np-focus-ring",
          className,
        )}
      />
      {suggest && pos && (
        <ul
          role="listbox"
          aria-label="Attached references"
          className="absolute z-20 grid w-52 gap-0.5 rounded-np-md bg-np-bg-3 p-1 shadow-np-popover"
          style={{ left: pos.x, bottom: `calc(100% - ${pos.top - 4}px)` }}
        >
          {suggest.items.map((r, i) => (
            <li key={r.label}>
              <button
                type="button"
                role="option"
                aria-selected={i === suggest.active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  suggest.pick(r);
                }}
                className={cn("flex w-full items-center gap-2 rounded-np-sm px-1.5 py-1 text-left text-sm", i === suggest.active && "bg-np-bg-2")}
              >
                <ChipThumb r={r} className="size-7 shrink-0 rounded-np-sm" />
                <span className={cn("font-medium", i === suggest.active && "text-np-accent-text")}>{r.label}</span>
                <span className="min-w-0 truncate text-xs text-np-text-muted">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {hover && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-30 mt-1.5 overflow-hidden rounded-np-md bg-np-bg-3 p-1 shadow-np-popover"
          style={{ left: hover.x, top: hover.y }}
        >
          {hovered ? (
            <>
              <ChipThumb r={hovered} className="size-32 rounded-np-sm" />
              <span className="block max-w-32 truncate px-0.5 pt-1 text-[11px] text-np-text-secondary">{hovered.name}</span>
            </>
          ) : (
            <span className="block px-1.5 py-1 text-xs whitespace-nowrap text-np-warning">{hover.label} is no longer attached</span>
          )}
        </div>
      )}
    </div>
  );
}

/** Drag (or arrow keys) to set the box height; double-click goes back to the default. */
function ResizeHandle({ height, onHeight, className }: { height: number | null; onHeight: (h: number | null) => void; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const box = () => el.current?.parentElement?.querySelector<HTMLElement>("[data-testid=prompt-editor]");
  const clamp = (h: number) => Math.round(Math.min(Math.max(h, MIN_HEIGHT), window.innerHeight * 0.85));
  const set = (h: number | null) => {
    onHeight(h);
    saveHeight(h);
  };
  return (
    <div
      ref={el}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize prompt"
      aria-valuenow={height ?? undefined}
      tabIndex={0}
      title="Drag to resize"
      onPointerDown={(e) => {
        const start = box()?.getBoundingClientRect().height ?? 260;
        const y0 = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
        let h = start;
        const move = (ev: PointerEvent) => {
          h = clamp(start + ev.clientY - y0);
          onHeight(h);
        };
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          saveHeight(h);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        e.preventDefault();
      }}
      onDoubleClick={() => set(null)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        set(clamp((height ?? box()?.offsetHeight ?? 260) + (e.key === "ArrowDown" ? 24 : -24)));
      }}
      className={cn(
        "group absolute inset-x-0 -bottom-1 flex h-3 cursor-ns-resize touch-none items-center justify-center rounded-np-sm outline-none focus-visible:outline-2 focus-visible:outline-np-focus-ring",
        className,
      )}
    >
      <span className="h-1 w-10 rounded-np-full bg-np-border-strong opacity-60 transition-opacity duration-150 group-hover:opacity-100" />
    </div>
  );
}

function ChipThumb({ r, className }: { r: ChipRef; className?: string }) {
  if (r.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element -- local file
    return <img src={r.preview} alt="" className={cn("object-cover", className)} />;
  }
  if (r.kind === "video") return <video src={`${r.preview}#t=0.1`} muted preload="metadata" className={cn("object-cover", className)} />;
  return (
    <span className={cn("flex items-center justify-center bg-np-bg-2 text-np-text-secondary", className)}>
      <AudioLines className="size-[70%]" aria-hidden />
    </span>
  );
}
