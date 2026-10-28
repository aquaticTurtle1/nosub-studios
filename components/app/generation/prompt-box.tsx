"use client";

import { AudioLines } from "lucide-react";
import { Fragment, useMemo, useRef, useState } from "react";
import { CHIP_RE } from "@/lib/catalog/prompt-refs";
import { applyPreset, PRESETS } from "@/lib/presets";
import type { RefKind } from "@/lib/ui/fields";
import { cn } from "@/lib/utils";

export interface ChipRef {
  label: string;
  kind: RefKind;
  name: string;
  preview: string;
}

/** Every chip in the text with its [start, end) range. */
function chipsIn(text: string) {
  return [...text.matchAll(CHIP_RE)].map((m) => ({ label: m[0].slice(1), start: m.index!, end: m.index! + m[0].length }));
}

/**
 * Edits the text through the browser's editing commands, so Ctrl+Z / Ctrl+Y undo it like typing.
 * Falls back to a plain value change where execCommand isn't available.
 */
function edit(el: HTMLTextAreaElement, start: number, end: number, text: string, fallback: (v: string) => void) {
  el.focus();
  el.setSelectionRange(start, end);
  const ok = typeof document.execCommand === "function" && document.execCommand(text ? "insertText" : "delete", false, text);
  if (!ok) {
    fallback(el.value.slice(0, start) + text + el.value.slice(end));
    requestAnimationFrame(() => el.setSelectionRange(start + text.length, start + text.length));
  }
}

/**
 * Prompt with reference chips. A chip is the text `@image_1` drawn as a pill (thumbnail +
 * label) by an overlay behind a transparent textarea — so paste stays plain text, undo/redo
 * and Ctrl+Enter work as usual, and the draft is a normal string. Chips act as one unit:
 * Backspace/Delete remove the whole chip and the caret can't stop inside one.
 */
export function PromptBox({
  value,
  onChange,
  placeholder,
  maxLength,
  refs,
  presetMode,
  invalid,
  compact,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
  /** Attached references the prompt can point at. */
  refs: ChipRef[];
  presetMode: "image" | "video" | null;
  invalid?: boolean;
  compact?: boolean;
  /** How chips are sent to this model, when not by name. */
  hint?: string | null;
}) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const lastCaret = useRef(0);
  const [query, setQuery] = useState<{ text: string; start: number } | null>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null);
  const presets = useMemo(() => (presetMode ? PRESETS.filter((p) => p.modes.includes(presetMode)) : []), [presetMode]);
  const byLabel = useMemo(() => new Map(refs.map((r) => [r.label, r])), [refs]);
  const matches = query === null ? [] : refs.filter((r) => r.label.startsWith(query.text));

  function syncQuery(el: HTMLTextAreaElement) {
    const pos = el.selectionStart;
    const m = el.value.slice(0, pos).match(/(^|\s)@(\w*)$/);
    setQuery(m && refs.length ? { text: m[2], start: pos - m[2].length - 1 } : null);
    setActive(0);
  }

  function insert(label: string) {
    const el = ta.current!;
    if (!query) return;
    edit(el, query.start, el.selectionStart, `@${label} `, onChange);
    setQuery(null);
  }

  /** Keeps the caret out of chips: it jumps to the side it was moving toward. */
  function snapCaret(el: HTMLTextAreaElement) {
    if (el.selectionStart !== el.selectionEnd) return;
    const pos = el.selectionStart;
    const c = chipsIn(el.value).find((x) => pos > x.start && pos < x.end);
    const to = c ? (lastCaret.current >= c.end ? c.start : c.end) : pos;
    if (to !== pos) el.setSelectionRange(to, to);
    lastCaret.current = to;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (matches.length && !e.ctrlKey && !e.metaKey) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a + (e.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insert(matches[active].label);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setQuery(null);
        return;
      }
    }
    // A chip is one unit: Backspace right after it (or Delete right before it) removes all of it.
    if ((e.key === "Backspace" || e.key === "Delete") && el.selectionStart === el.selectionEnd) {
      const pos = el.selectionStart;
      const c = chipsIn(el.value).find((x) => (e.key === "Backspace" ? pos > x.start && pos <= x.end : pos >= x.start && pos < x.end));
      if (c) {
        e.preventDefault();
        edit(el, c.start, c.end, "", onChange);
      }
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    const spans = overlay.current?.querySelectorAll<HTMLElement>("[data-chip]") ?? [];
    for (const s of spans) {
      for (const r of s.getClientRects()) {
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          if (hover?.label !== s.dataset.chip) setHover({ label: s.dataset.chip!, x: r.left, y: r.bottom });
          return;
        }
      }
    }
    if (hover) setHover(null);
  }

  const parts = useMemo(() => {
    const out: { text: string; chip?: string }[] = [];
    let at = 0;
    for (const c of chipsIn(value)) {
      if (c.start > at) out.push({ text: value.slice(at, c.start) });
      out.push({ text: value.slice(c.start, c.end), chip: c.label });
      at = c.end;
    }
    out.push({ text: value.slice(at) + "\n" });
    return out;
  }, [value]);

  const box = "px-3 py-2.5 text-sm leading-5 whitespace-pre-wrap break-words";
  const hovered = hover ? byLabel.get(hover.label) : undefined;

  return (
    <section className="grid gap-2">
      <label htmlFor="prompt" className="text-xs font-medium text-np-text-secondary">
        Prompt
      </label>
      <div className={cn("relative rounded-np-md bg-np-bg-2", invalid && "outline-1 outline-np-danger", compact && "max-lg:h-[72px]")}>
        {/* What you see: the text with chips. The textarea on top only takes input. */}
        <div ref={overlay} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden text-np-text-primary", box)} data-testid="prompt-overlay">
          {parts.map((p, i) => {
            if (!p.chip) return <Fragment key={i}>{p.text}</Fragment>;
            const ref = byLabel.get(p.chip);
            return (
              <span
                key={i}
                data-chip={p.chip}
                data-missing={!ref || undefined}
                className={cn(
                  "rounded-np-sm",
                  ref
                    ? "bg-np-accent-soft text-np-accent-text shadow-[0_0_0_2px_var(--np-accent-soft)]"
                    : "bg-np-warning-soft text-np-warning line-through shadow-[0_0_0_2px_var(--np-warning-soft)]",
                )}
              >
                {ref ? (
                  <span className="relative">
                    <span className="invisible">@</span>
                    <ChipThumb r={ref} className="absolute top-1/2 left-0 size-3.5 -translate-y-1/2 rounded-[3px]" />
                  </span>
                ) : (
                  "@"
                )}
                {p.chip}
              </span>
            );
          })}
        </div>
        <textarea
          id="prompt"
          ref={ta}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={6}
          spellCheck={false}
          onChange={(e) => {
            onChange(e.target.value);
            syncQuery(e.target);
          }}
          onKeyDown={onKeyDown}
          onSelect={(e) => snapCaret(e.currentTarget)}
          onScroll={(e) => {
            if (overlay.current) overlay.current.scrollTop = e.currentTarget.scrollTop;
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHover(null)}
          onBlur={() => setTimeout(() => setQuery(null), 120)}
          className={cn(
            "relative block w-full resize-none rounded-np-md bg-transparent text-transparent caret-np-text-primary selection:bg-np-accent-soft selection:text-transparent placeholder:text-np-text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-np-focus-ring",
            box,
            compact && "max-lg:h-[72px]",
          )}
          aria-autocomplete={refs.length ? "list" : undefined}
          aria-describedby={hint ? "prompt-hint" : undefined}
        />
        {matches.length > 0 && (
          <ul
            role="listbox"
            aria-label="Attached references"
            className="absolute bottom-full left-2 z-20 mb-1 grid min-w-48 gap-0.5 rounded-np-md bg-np-bg-3 p-1 shadow-np-popover"
          >
            {matches.map((r, i) => (
              <li key={r.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insert(r.label);
                  }}
                  className={cn("flex w-full items-center gap-2 rounded-np-sm px-1.5 py-1 text-left text-sm", i === active && "bg-np-bg-2")}
                >
                  <ChipThumb r={r} className="size-7 shrink-0 rounded-np-sm" />
                  <span className={cn("font-medium", i === active && "text-np-accent-text")}>{r.label}</span>
                  <span className="min-w-0 truncate text-xs text-np-text-muted">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {hover && (
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 mt-1.5 overflow-hidden rounded-np-md bg-np-bg-3 p-1 shadow-np-popover"
            style={{ left: hover.x, top: hover.y }}
          >
            {hovered ? (
              <>
                <ChipThumb r={hovered} className="size-32 rounded-np-sm" />
                <span className="block max-w-32 truncate px-0.5 pt-1 text-[11px] text-np-text-secondary">{hovered.name}</span>
              </>
            ) : (
              <span className="block px-1.5 py-1 text-xs text-np-warning">{hover.label} is no longer attached</span>
            )}
          </div>
        )}
        {maxLength && value.length > maxLength * 0.8 && (
          <span className="absolute right-2 bottom-2 text-[11px] text-np-text-muted">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {hint && (
        <p id="prompt-hint" className="text-xs text-np-text-muted" data-testid="prompt-hint">
          {hint}
        </p>
      )}
      {refs.length > 0 && !hint && !compact && <p className="text-xs text-np-text-muted">Type @ to point at a reference.</p>}
      {presets.length > 0 && (
        <div className={cn("grid gap-1.5", compact && "max-lg:hidden")}>
          <span className="text-xs text-np-text-muted">Prompt helpers add a phrase to your prompt</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  // Through the editing commands, so the helper can be undone.
                  const el = ta.current;
                  if (el) edit(el, 0, el.value.length, applyPreset(value, p), onChange);
                  else onChange(applyPreset(value, p));
                }}
                title={p.phrase}
                className="h-8 shrink-0 rounded-np-md bg-np-bg-2 px-3 text-[13px] text-np-text-secondary transition-colors duration-150 hover:bg-np-bg-3 hover:text-np-text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
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
