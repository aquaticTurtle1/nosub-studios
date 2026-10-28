import { acceptFor, isUrlField } from "@/lib/catalog/schema";
import type { JsonSchema } from "@/lib/catalog/types";

export type RefKind = "image" | "video" | "audio";

export interface FileLimits {
  /** Smallest per-file size limit mentioned in the docs, in bytes. */
  maxBytes?: number;
  /** File extensions the docs list, lower case (jpg covers jpeg). */
  formats?: string[];
}

export interface RefField {
  name: string;
  kinds: RefKind[];
  /** How many references this field holds (1 for a single URL). */
  capacity: number;
  isArray: boolean;
  required: boolean;
  /** For arrays of objects ({image_url}), the property that holds the URL. */
  itemKey?: string;
  limits: FileLimits;
  /** The docs say this field can't be combined with the others ("mutually exclusive"). */
  exclusive: boolean;
}

export interface SettingField {
  name: string;
  schema: JsonSchema;
  required: boolean;
}

export interface FieldLayout {
  promptField: string | null;
  refFields: RefField[];
  /** Core settings (duration, aspect, quality, audio, count, tier) — always visible. */
  core: SettingField[];
  /** Other required fields — always visible. */
  required: string[];
  /** Rare optional fields, under Advanced. */
  advanced: string[];
  /** Legacy alias used by pages still on chips. */
  chips: SettingField[];
}

const PROMPT_NAMES = ["prompt", "text", "lyrics", "descriptions", "description", "script", "dialogue", "style"];

const typeOf = (s: JsonSchema) => (Array.isArray(s.type) ? s.type.find((t) => t !== "null") : s.type);
const isChoice = (s: JsonSchema) => Boolean(s.enum?.length) || typeOf(s) === "boolean";
const isNumber = (s: JsonSchema) => typeOf(s) === "integer" || typeOf(s) === "number";

/** Core settings, in display order. Only shown when the model's schema has them. */
const CORE: { re: RegExp; ok: (s: JsonSchema) => boolean }[] = [
  { re: /^(duration|seconds|video_duration|duration_seconds|n_seconds|length|extend_times)$/i, ok: (s) => isChoice(s) || isNumber(s) },
  { re: /^(aspect_ratio|ratio|size|image_size)$/i, ok: isChoice },
  { re: /^(resolution|quality|output_quality)$/i, ok: isChoice },
  { re: /audio|sound/i, ok: isChoice },
  { re: /^(n|num_images|num_outputs|image_count|number_of_images|max_images|batch_size)$/i, ok: (s) => isChoice(s) || isNumber(s) },
  { re: /^(model|mode|tier|speed)$/i, ok: (s) => Boolean(s.enum?.length) },
];

const EXT = /\b(jpe?g|png|webp|bmp|gif|tiff?|heic|avif|mp4|mov|webm|mkv|avi|m4v|mp3|wav|m4a|aac|flac|ogg|opus)\b/gi;

/** Size and format limits as written in the field's docs description. */
export function fileLimits(s: JsonSchema): FileLimits {
  const text = `${s.description ?? ""} ${s.items?.description ?? ""}`;
  const mb = [...text.matchAll(/(\d+(?:\.\d+)?)\s*MB\b/gi)].map((m) => Number(m[1])).filter((n) => n > 0);
  const formats = [...new Set([...text.matchAll(EXT)].map((m) => m[1].toLowerCase().replace("jpeg", "jpg").replace("tif", "tiff").replace("tifff", "tiff")))];
  return {
    maxBytes: mb.length ? Math.min(...mb) * 1024 * 1024 : undefined,
    formats: formats.length ? formats : undefined,
  };
}

/** Why a file can't go into a field, or null when it fits. */
export function fileProblem(file: { name: string; type: string; size: number }, f: RefField): string | null {
  if (f.limits.maxBytes && file.size > f.limits.maxBytes) {
    return `${file.name} is ${(file.size / 1048576).toFixed(1)} MB; this model takes up to ${Math.round(f.limits.maxBytes / 1048576)} MB.`;
  }
  const kindFormats = f.limits.formats?.filter((x) => formatKind(x) === file.type.split("/")[0]);
  if (kindFormats?.length) {
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? file.type.split("/")[1] ?? "").toLowerCase().replace("jpeg", "jpg");
    if (!kindFormats.includes(ext)) return `${file.name}: this model takes ${kindFormats.join(", ").toUpperCase()}.`;
  }
  return null;
}

const EXCLUSIVE = /mutually exclusive|cannot be (used|provided) (simultaneously|together)|can't be used together|not be used together/i;
const isExclusive = (s: JsonSchema) => EXCLUSIVE.test(`${s.description ?? ""} ${s.items?.description ?? ""}`);

/**
 * How many references of each kind one request can carry. Fields add up, except when
 * the docs mark a field as mutually exclusive with the others (Seedance 2.5: first/last
 * frame OR up to 30 reference images) — then the larger of the two groups counts.
 */
export function kindCapacity(fields: RefField[]): Record<RefKind, number> {
  const out: Record<RefKind, number> = { image: 0, video: 0, audio: 0 };
  for (const k of Object.keys(out) as RefKind[]) {
    const mine = fields.filter((f) => f.kinds.includes(k));
    const sum = mine.reduce((n, f) => n + f.capacity, 0);
    if (!mine.some((f) => f.exclusive)) {
      out[k] = sum;
      continue;
    }
    const singles = mine.filter((f) => !f.isArray).reduce((n, f) => n + f.capacity, 0);
    out[k] = Math.max(singles, ...mine.filter((f) => f.isArray).map((f) => f.capacity));
  }
  return out;
}

function formatKind(ext: string): RefKind {
  if (/mp4|mov|webm|mkv|avi|m4v/.test(ext)) return "video";
  if (/mp3|wav|m4a|aac|flac|ogg|opus/.test(ext)) return "audio";
  return "image";
}

function objectRef(name: string, p: JsonSchema, required: boolean): RefField | null {
  if (typeOf(p) !== "array" || !p.items || typeOf(p.items) !== "object") return null;
  const props = p.items.properties ?? {};
  const urlKeys = Object.keys(props).filter((k) => isUrlField(k, props[k]) && typeOf(props[k]) === "string");
  if (urlKeys.length !== 1) return null;
  // Only when the URL is the sole required property, so attaching a file is enough.
  if ((p.items.required ?? []).some((r) => r !== urlKeys[0])) return null;
  const key = urlKeys[0];
  return {
    name,
    itemKey: key,
    kinds: acceptFor(key, props[key]).split(",").map((a) => a.replace("/*", "") as RefKind),
    capacity: p.maxItems ?? 10,
    isArray: true,
    required,
    limits: fileLimits(props[key]),
    exclusive: isExclusive(p) || isExclusive(props[key]),
  };
}

/** Splits a model's input schema into the panel's sections. */
export function layoutFields(schema: JsonSchema): FieldLayout {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const names = Object.keys(props).filter((n) => !props[n].deprecated);

  const promptField =
    PROMPT_NAMES.find((n) => names.includes(n) && typeOf(props[n]) === "string" && !props[n].enum) ?? null;

  const refFields: RefField[] = [];
  for (const n of names) {
    const p = props[n];
    if (isUrlField(n, p)) {
      const isArray = typeOf(p) === "array";
      refFields.push({
        name: n,
        kinds: acceptFor(n, p).split(",").map((a) => a.replace("/*", "") as RefKind),
        capacity: isArray ? (p.maxItems ?? 10) : 1,
        isArray,
        required: required.has(n),
        limits: fileLimits(p),
        exclusive: isExclusive(p),
      });
    } else {
      const o = objectRef(n, p, required.has(n));
      if (o) refFields.push(o);
    }
  }

  const taken = new Set<string | null>([promptField, ...refFields.map((r) => r.name)]);
  const core: SettingField[] = [];
  for (const { re, ok } of CORE) {
    for (const n of names) {
      if (taken.has(n) || !re.test(n) || !ok(props[n])) continue;
      core.push({ name: n, schema: props[n], required: required.has(n) });
      taken.add(n);
    }
  }
  const rest = names.filter((n) => !taken.has(n));
  return {
    promptField,
    refFields,
    core,
    required: rest.filter((n) => required.has(n)),
    advanced: rest.filter((n) => !required.has(n)),
    chips: core,
  };
}

/**
 * Value a setting starts with: the documented default, otherwise — only for required
 * settings — the first documented option (or a sensible in-range number), so the
 * request is valid without the user hunting for it.
 */
export function initialChipValue(c: SettingField): string | number | boolean | undefined {
  const s = c.schema;
  if (s.default !== undefined && (typeof s.default !== "object" || s.default === null)) return s.default as string | number | boolean;
  if (!c.required) return undefined;
  const t = typeOf(s);
  if (s.enum?.length) {
    const v = s.enum.includes("16:9") ? "16:9" : s.enum.includes(5) ? 5 : s.enum.includes("5") ? "5" : s.enum[0];
    return t === "integer" || t === "number" ? Number(v) : v;
  }
  if (t === "boolean") return false;
  if ((t === "integer" || t === "number") && s.minimum !== undefined && s.maximum !== undefined) {
    return s.minimum <= 5 && s.maximum >= 5 ? 5 : s.minimum;
  }
  return undefined;
}

export const humanize = (k: string) =>
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\burls?\b/gi, "")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

const CHIP_LABEL: [RegExp, string][] = [
  [/duration|seconds|length|extend_times/i, "Duration"],
  [/aspect|ratio/i, "Aspect ratio"],
  [/^size$|image_size/i, "Size"],
  [/resolution|quality/i, "Quality"],
  [/audio|sound/i, "Audio"],
  [/^(n|num_images|num_outputs|image_count|number_of_images|max_images|batch_size)$/i, "Outputs"],
  [/^(model|tier)$/i, "Tier"],
  [/^mode$/i, "Mode"],
  [/^speed$/i, "Speed"],
  [/format/i, "Format"],
];

export function chipLabel(name: string): string {
  return CHIP_LABEL.find(([re]) => re.test(name))?.[1] ?? humanize(name);
}

export function chipValueText(name: string, value: unknown): string {
  if (value === undefined || value === "") return "Auto";
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (/duration|seconds|length|extend_times/i.test(name) && /^\d+(\.\d+)?$/.test(String(value))) return `${value}s`;
  return String(value);
}

export type ChipField = SettingField;
