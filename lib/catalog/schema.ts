import { z } from "zod";
import type { JsonSchema } from "./types";

type Primitive = string | number | boolean;

function typeOf(s: JsonSchema): string | undefined {
  return Array.isArray(s.type) ? s.type.find((t) => t !== "null") : s.type;
}

function literalUnion(values: Primitive[]): z.ZodType {
  const lits = values.map((v) => z.literal(v));
  return lits.length === 1 ? lits[0] : z.union(lits as unknown as [z.ZodLiteral, z.ZodLiteral, ...z.ZodLiteral[]]);
}

/**
 * Builds a Zod validator from a docs JSON schema. Unknown fields are rejected so
 * we never send parameters a model does not document.
 */
export function toZod(schema: JsonSchema): z.ZodType {
  if (schema.oneOf?.length || schema.anyOf?.length) {
    const alts = (schema.oneOf ?? schema.anyOf)!.map(toZod);
    return alts.length === 1 ? alts[0] : z.union(alts as [z.ZodType, z.ZodType, ...z.ZodType[]]);
  }
  const t = typeOf(schema) ?? (schema.properties ? "object" : undefined);
  if (schema.enum?.length) {
    // Docs sometimes give numeric enums as strings and vice versa; accept both spellings.
    const values = schema.enum.flatMap((v) => {
      if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) && (t === "integer" || t === "number")) return [Number(v)];
      if (typeof v === "number" && t === "string") return [String(v)];
      return [v];
    });
    return literalUnion(values);
  }
  switch (t) {
    case "string": {
      let s = z.string();
      if (schema.minLength !== undefined) s = s.min(schema.minLength);
      if (schema.maxLength !== undefined) s = s.max(schema.maxLength);
      return s;
    }
    case "integer":
    case "number": {
      let n = t === "integer" ? z.number().int() : z.number();
      if (schema.minimum !== undefined) n = n.min(schema.minimum);
      if (schema.maximum !== undefined) n = n.max(schema.maximum);
      if (schema.exclusiveMinimum !== undefined) n = n.gt(schema.exclusiveMinimum);
      if (schema.exclusiveMaximum !== undefined) n = n.lt(schema.exclusiveMaximum);
      return n;
    }
    case "boolean":
      return z.boolean();
    case "array": {
      let a = z.array(schema.items ? toZod(schema.items) : z.unknown());
      if (schema.minItems !== undefined) a = a.min(schema.minItems);
      if (schema.maxItems !== undefined) a = a.max(schema.maxItems);
      return a;
    }
    case "object": {
      if (!schema.properties) return z.record(z.string(), z.unknown());
      const required = new Set(schema.required ?? []);
      const shape: Record<string, z.ZodType> = {};
      for (const [k, v] of Object.entries(schema.properties)) {
        const inner = toZod(v);
        shape[k] = required.has(k) ? inner : inner.optional();
      }
      return z.strictObject(shape);
    }
    default:
      return z.unknown();
  }
}

/** Removes "", null, undefined, empty arrays and empty objects (unset form fields). */
export function pruneEmpty(value: unknown): unknown {
  if (Array.isArray(value)) {
    const arr = value.map(pruneEmpty).filter((v) => v !== undefined);
    return arr.length ? arr : undefined;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const p = pruneEmpty(v);
      if (p !== undefined) out[k] = p;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export function validateInput(
  schema: JsonSchema,
  input: unknown,
): { ok: true; value: Record<string, unknown> } | { ok: false; issues: ValidationIssue[] } {
  const pruned = (pruneEmpty(input) ?? {}) as Record<string, unknown>;
  const res = toZod({ ...schema, type: "object" }).safeParse(pruned);
  if (res.success) return { ok: true, value: res.data as Record<string, unknown> };
  return {
    ok: false,
    issues: res.error.issues.map((i) => ({ path: i.path.join(".") || "(input)", message: i.message })),
  };
}

/** True when a field (or array of fields) carries a reference file URL. */
export function isUrlField(name: string, s: JsonSchema): boolean {
  const str = typeOf(s) === "string" || (typeOf(s) === "array" && s.items && typeOf(s.items) === "string");
  if (!str) return false;
  // Web-page links and document uploads (Wan 3.0) are not media references.
  if (/link|file_urls$/i.test(name)) return false;
  if (s.format === "uri" || s.items?.format === "uri") return true;
  const desc = (s.description ?? "").toLowerCase();
  // A field named *_url / *_urls is a URL input even when its description never says "URL".
  if (/(^|_)urls?$|Urls?$/.test(name)) return true;
  return /(^|_)(image|images|video|audio|mask)(_|$)/i.test(name) && /\burls?\b/.test(desc);
}

/** Guesses which media a URL field expects, for the upload dropzone `accept`. */
export function acceptFor(name: string, s: JsonSchema): string {
  const kindsIn = (text: string) => {
    const kinds: string[] = [];
    if (/image|frame|photo|picture|mask|portrait|loop|png|jpe?g|webp/.test(text)) kinds.push("image/*");
    if (/video|clip|mp4|mov/.test(text)) kinds.push("video/*");
    if (/audio|voice|speech|music|song|mp3|wav|sound|verify|upload_url/.test(text)) kinds.push("audio/*");
    return kinds;
  };
  // The field name is the most reliable signal; the description often mentions other media in passing.
  const byName = kindsIn(name.toLowerCase());
  const kinds = byName.length ? byName : kindsIn((s.description ?? "").toLowerCase());
  return kinds.length ? kinds.join(",") : "image/*,video/*,audio/*";
}
