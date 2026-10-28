import { chipLabels } from "@/lib/catalog/prompt-refs";
import type { RefField, RefKind } from "./fields";

/** A reference the user attached in the panel; `value` is a local file handle or a URL. */
export interface AttachedRef<V> {
  id: string;
  kind: RefKind;
  name: string;
  value: V;
  /** Schema field it is sent as; null = assign automatically. */
  target: string | null;
}

/**
 * Gives every reference a target field: keeps a valid manual choice, otherwise the
 * first field (required ones first) that accepts its kind and still has room.
 * References that fit nowhere get target null and are not sent.
 */
export function assignTargets<R extends AttachedRef<unknown>>(refs: R[], fields: RefField[]): R[] {
  const used = new Map<string, number>();
  const fits = (f: RefField, kind: RefKind) => f.kinds.includes(kind) && (used.get(f.name) ?? 0) < f.capacity;
  const ordered = [...fields].sort((a, b) => Number(b.required) - Number(a.required));
  // Manual choices first, so automatic ones fill around them.
  const result = refs.map((r) => ({ ...r }));
  for (const r of result) {
    const f = fields.find((x) => x.name === r.target);
    if (f && fits(f, r.kind)) used.set(f.name, (used.get(f.name) ?? 0) + 1);
    else r.target = null;
  }
  for (const r of result) {
    if (r.target) continue;
    const f = ordered.find((x) => fits(x, r.kind));
    if (f) {
      r.target = f.name;
      used.set(f.name, (used.get(f.name) ?? 0) + 1);
    }
  }
  return result;
}

/** Puts assigned references into the input object (arrays keep attach order). */
export function mergeRefs<V, T extends Record<string, unknown>>(values: T, refs: AttachedRef<V>[], fields: RefField[]): T {
  const out: Record<string, unknown> = { ...values };
  for (const f of fields) {
    const mine = refs.filter((r) => r.target === f.name).map((r) => r.value);
    if (!mine.length) continue;
    out[f.name] = f.itemKey ? mine.map((v) => ({ [f.itemKey!]: v })) : f.isArray ? mine : mine[0];
  }
  return out as T;
}

/**
 * Label for a newly attached reference: image_1, video_1, … Labels never change while a
 * reference is attached, and a number still used in the prompt is not handed out again,
 * so a chip can't silently start pointing at a different file.
 */
export function nextLabel(existing: { kind: RefKind; label: string }[], kind: RefKind, prompt = ""): string {
  const used = [...existing.map((r) => r.label), ...chipLabels(prompt)];
  const n = Math.max(0, ...used.filter((l) => l.startsWith(`${kind}_`)).map((l) => Number(l.slice(kind.length + 1)) || 0));
  return `${kind}_${n + 1}`;
}
