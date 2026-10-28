import { kindCapacity, layoutFields } from "@/lib/ui/fields";
import type { CatalogModel, JsonSchema } from "./types";

export type RefKind = "image" | "video" | "audio";

/** Read-only facts about a model, derived from its catalog entry, for picker rows. */
export interface ModelMeta {
  minCredits: number | null;
  maxCredits: number | null;
  /** Unit of the price rows ("per image", "per second", …), when they agree. */
  priceUnit: string | null;
  /** Shortest / longest documented duration in seconds, for video/audio models. */
  minDuration: number | null;
  maxDuration: number | null;
  /** Highest documented output resolution ("4K", "1080p", …). */
  maxResolution: string | null;
  /** Has a documented switch or option for generated sound. */
  hasAudio: boolean;
  /** Media kinds the model accepts as references. */
  refKinds: RefKind[];
  /** Most references of each kind any variant accepts. */
  refCapacity: Record<RefKind, number>;
  /** Every variant requires at least one reference. */
  refsRequired: boolean;
}

const DURATION = /^(duration|seconds|video_duration|duration_seconds|n_seconds|length)$/i;
const RESOLUTION = /^(resolution|quality|output_quality|size|mode)$/i;
const RES_RANK = ["360p", "480p", "540p", "580p", "720p", "768p", "1080p", "2k", "1440p", "4k"];

function nums(s: JsonSchema): number[] {
  if (s.enum?.length) return s.enum.map((v) => Number.parseFloat(String(v))).filter(Number.isFinite);
  return [s.minimum, s.maximum].filter((v): v is number => typeof v === "number");
}

function resolutionOf(s: JsonSchema): string | null {
  let best = -1;
  for (const v of s.enum ?? []) {
    const m = String(v).toLowerCase().match(/(\d{3,4}p|[24]k)/);
    if (m) best = Math.max(best, RES_RANK.indexOf(m[1]));
  }
  if (best < 0) return null;
  return RES_RANK[best].endsWith("k") ? RES_RANK[best].toUpperCase() : RES_RANK[best];
}

export function modelMeta(model: CatalogModel): ModelMeta {
  const credits = model.pricing.map((p) => p.credits).filter((c) => Number.isFinite(c));
  const units = [...new Set(model.pricing.map((p) => p.unit))];
  let minDuration: number | null = null;
  let maxDuration: number | null = null;
  let maxResolution: string | null = null;
  let hasAudio = false;
  const capacity: Record<RefKind, number> = { image: 0, video: 0, audio: 0 };
  for (const v of model.variants) {
    for (const [name, p] of Object.entries(v.schema.properties ?? {})) {
      if (DURATION.test(name)) {
        const n = nums(p).filter((x) => x > 0);
        if (n.length) {
          minDuration = Math.min(minDuration ?? Infinity, ...n);
          maxDuration = Math.max(maxDuration ?? 0, ...n);
        }
      }
      if (RESOLUTION.test(name)) {
        const r = resolutionOf(p);
        if (r && (!maxResolution || RES_RANK.indexOf(r.toLowerCase()) > RES_RANK.indexOf(maxResolution.toLowerCase()))) maxResolution = r;
      }
      if (/audio|sound/i.test(name) && (p.type === "boolean" || p.enum)) hasAudio = true;
    }
    // Same reference detection and limits as the panel (URL fields and arrays of {url} objects).
    const per = kindCapacity(layoutFields(v.schema).refFields);
    for (const k of Object.keys(per) as RefKind[]) capacity[k] = Math.max(capacity[k], per[k]);
  }
  return {
    minCredits: model.free ? 0 : credits.length ? Math.min(...credits) : null,
    maxCredits: model.free ? 0 : credits.length ? Math.max(...credits) : null,
    priceUnit: model.free ? null : units.length === 1 ? units[0] : null,
    minDuration,
    maxDuration,
    maxResolution,
    hasAudio,
    refKinds: (Object.keys(capacity) as RefKind[]).filter((k) => capacity[k] > 0),
    refCapacity: capacity,
    refsRequired: model.variants.every((v) => layoutFields(v.schema).refFields.some((f) => f.required)),
  };
}
