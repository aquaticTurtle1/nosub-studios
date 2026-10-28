"use client";

import type { JsonSchema } from "@/lib/catalog/types";

/** A local file picked for a reference field; uploaded right before submit. */
export interface FileRef {
  __file: true;
  file: File;
  previewUrl: string;
}

export type FormValue = string | number | boolean | FileRef | FormValue[] | { [k: string]: FormValue } | undefined;
export type FormValues = Record<string, FormValue>;

export const isFileRef = (v: unknown): v is FileRef => !!v && typeof v === "object" && (v as FileRef).__file === true;

export function makeFileRef(file: File): FileRef {
  return { __file: true, file, previewUrl: URL.createObjectURL(file) };
}

/** Initial values: documented defaults only (nothing invented). */
export function defaultsFor(schema: JsonSchema): FormValues {
  const out: FormValues = {};
  for (const [k, p] of Object.entries(schema.properties ?? {})) {
    if (p.deprecated) continue;
    if (p.default !== undefined && (typeof p.default !== "object" || p.default === null)) {
      out[k] = p.default as FormValue;
    }
  }
  return out;
}

/** Deep map that replaces every FileRef via `fn` (used for upload + pre-validation). */
export async function mapFiles(v: FormValue, fn: (f: FileRef) => Promise<string>): Promise<unknown> {
  if (isFileRef(v)) return fn(v);
  if (Array.isArray(v)) return Promise.all(v.map((x) => mapFiles(x, fn)));
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = await mapFiles(x, fn);
    return out;
  }
  return v;
}

export function countFiles(v: FormValue): number {
  if (isFileRef(v)) return 1;
  if (Array.isArray(v)) return v.reduce<number>((n, x) => n + countFiles(x), 0);
  if (v && typeof v === "object") return Object.values(v).reduce<number>((n, x) => n + countFiles(x), 0);
  return 0;
}
