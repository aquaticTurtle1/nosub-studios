import type { Category, PriceRow } from "./types";

export interface CostEstimate {
  /** Best-matching price row, or null when nothing is known. */
  row: PriceRow | null;
  /** Estimated credits, or null when the unit cannot be resolved from the input. */
  credits: number | null;
  /** Human-readable explanation of how the number was derived. */
  basis: string;
  /** Rows sorted by how well they match the current settings. */
  ranked: PriceRow[];
}

/** Settings at or above this estimate require an explicit confirmation before submit. */
export const CONFIRM_CREDITS = 100;

const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/(\d+)\.0s/g, "$1s")
    .split(/[^a-z0-9.]+/)
    .filter(Boolean);

function valueTokens(input: Record<string, unknown>): Set<string> {
  const out = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v === "string" && v.length < 40 && !/^https?:/.test(v)) for (const t of tokens(v)) out.add(t);
    if (typeof v === "number") {
      out.add(String(v));
      out.add(`${v}s`);
    }
  };
  for (const [k, v] of Object.entries(input)) {
    add(v);
    // Audio toggles: price rows say "with audio" / "no audio" / "without audio".
    if (typeof v === "boolean" && /audio|sound/i.test(k)) {
      for (const t of v ? ["with", "audio"] : ["no", "without"]) out.add(t);
    }
    if (/model|tier|mode|quality|resolution|speed/.test(k) && typeof v === "string") {
      // veo3_fast → fast, kling pro → pro
      for (const part of v.split(/[_/-]/)) out.add(part.toLowerCase());
    }
  }
  return out;
}

const DURATION_KEYS = ["duration", "seconds", "video_duration", "duration_seconds", "n_seconds", "length"];
const COUNT_KEYS = ["n", "num_images", "num_outputs", "batch_size", "image_count", "count", "number_of_images", "max_images"];

function numberFrom(input: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = input[k];
    const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseFloat(v) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Estimates credits for a run from the kie.ai/pricing snapshot. Always an
 * approximation: rows are matched by name and settings, not by an official API.
 */
export function estimateCost(pricing: PriceRow[], input: Record<string, unknown>, free = false): CostEstimate {
  if (free) return { row: null, credits: 0, basis: 'Docs: "This endpoint is free."', ranked: pricing };
  if (!pricing.length) return { row: null, credits: null, basis: "No price in the kie.ai/pricing snapshot", ranked: [] };
  const vt = valueTokens(input);
  const score = (r: PriceRow) => tokens(r.description).filter((t) => vt.has(t)).length;
  const ranked = [...pricing].sort((a, b) => score(b) - score(a) || b.credits - a.credits);
  const row = ranked[0];
  const unit = row.unit.toLowerCase();
  let mult: number | null = 1;
  let basis = `${row.credits} credits ${row.unit}`;
  if (unit.includes("second")) {
    const d = numberFrom(input, DURATION_KEYS);
    mult = d;
    basis = d ? `${row.credits} × ${d}s` : `${row.credits} credits per second × unknown duration`;
  } else if (/per (\d+ )?images?/.test(unit)) {
    const per = Number(unit.match(/per (\d+) images/)?.[1] ?? 1);
    const n = numberFrom(input, COUNT_KEYS) ?? 1;
    mult = Math.ceil(n / per);
    basis = `${row.credits} × ${mult} (${n} image${n > 1 ? "s" : ""})`;
  } else if (unit.includes("million") || unit.includes("character") || unit.includes("token")) {
    mult = null;
    basis = `${row.credits} credits ${row.unit} — depends on text length`;
  }
  const credits = mult === null ? null : Math.round(row.credits * mult * 100) / 100;
  return { row, credits, basis, ranked };
}

/** Whether a run must be explicitly confirmed (no server-side cancel exists). */
export function needsConfirmation(category: Category, est: CostEstimate): boolean {
  if (est.credits !== null) return est.credits >= CONFIRM_CREDITS;
  // Unknown cost: always confirm video; other categories only when nothing at all is known.
  return category === "video" || est.row === null;
}
