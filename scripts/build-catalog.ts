/**
 * Generates lib/catalog/generated/catalog.json from the OpenAPI specs embedded
 * in docs-cache/*.md. Never hand-edit the output — change this script (or
 * refresh the docs with `pnpm catalog:fetch`) and re-run `pnpm catalog:build`.
 */
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { syntaxFor } from "../lib/catalog/prompt-syntax";
import type { Catalog, CatalogModel, Category, Family, JsonSchema, PriceRow } from "../lib/catalog/types";
import { layoutFields } from "../lib/ui/fields";

const DOCS_DIR = path.join(process.cwd(), "docs-cache");
const OUT_FILE = path.join(process.cwd(), "lib", "catalog", "generated", "catalog.json");

type AnyObj = Record<string, unknown>;

// ---------- schema resolution ----------

function resolveRef(root: AnyObj, ref: string): AnyObj | undefined {
  if (!ref.startsWith("#/")) return undefined;
  let cur: unknown = root;
  for (const part of ref.slice(2).split("/")) {
    const key = decodeURIComponent(part);
    if (cur && typeof cur === "object") cur = (cur as AnyObj)[key];
    else return undefined;
  }
  return cur as AnyObj | undefined;
}

/** Inlines $ref / x-apidog-refs and strips vendor keys. Records unresolved refs in `issues`. */
function clean(root: AnyObj, node: unknown, issues: Set<string>, depth = 0): JsonSchema {
  if (!node || typeof node !== "object" || depth > 12) return {};
  let src = node as AnyObj;
  if (typeof src.$ref === "string") {
    const target = resolveRef(root, src.$ref);
    if (!target) {
      issues.add(`Unresolved schema reference ${src.$ref}`);
      return {};
    }
    src = { ...target, ...Object.fromEntries(Object.entries(src).filter(([k]) => k !== "$ref")) };
  }
  if (Array.isArray(src.allOf)) {
    const merged: AnyObj = {};
    for (const part of src.allOf) {
      const c = clean(root, part, issues, depth + 1) as AnyObj;
      merged.properties = { ...(merged.properties as AnyObj), ...(c.properties as AnyObj) };
      merged.required = [...((merged.required as string[]) ?? []), ...((c.required as string[]) ?? [])];
      for (const [k, v] of Object.entries(c)) if (k !== "properties" && k !== "required") merged[k] = v;
    }
    src = { ...merged, ...Object.fromEntries(Object.entries(src).filter(([k]) => k !== "allOf")) };
  }
  const out: AnyObj = {};
  for (const [k, v] of Object.entries(src)) {
    if (k.startsWith("x-") || k === "$ref") continue;
    if (k === "properties" && v && typeof v === "object") {
      const props: AnyObj = {};
      for (const [pk, pv] of Object.entries(v as AnyObj)) props[pk] = clean(root, pv, issues, depth + 1);
      out.properties = props;
    } else if (k === "items") {
      out.items = clean(root, v, issues, depth + 1);
    } else if ((k === "oneOf" || k === "anyOf") && Array.isArray(v)) {
      out[k] = v.map((x) => clean(root, x, issues, depth + 1));
    } else {
      out[k] = v;
    }
  }
  // apidog keeps shared fragments in x-apidog-refs: each one is an object schema
  // whose properties belong to this object (they may or may not already be inlined).
  const refs = src["x-apidog-refs"] as Record<string, { $ref?: string }> | undefined;
  if (refs) {
    for (const r of Object.values(refs)) {
      if (!r?.$ref) continue;
      const target = resolveRef(root, r.$ref);
      if (!target) {
        issues.add(`Unresolved apidog reference ${r.$ref}`);
        continue;
      }
      const frag = clean(root, target, issues, depth + 1);
      const props = (out.properties ??= {}) as Record<string, JsonSchema>;
      for (const [k, v] of Object.entries(frag.properties ?? {})) {
        if (!props[k] || props[k].type === "object") props[k] = v;
      }
    }
  }
  return out as JsonSchema;
}

// ---------- classification ----------

const TOOL_OPS = new Set([
  "upscale",
  "remove-background",
  "audio-isolation",
  "stem-separation",
  "midi",
  "convert-to-wav",
  "layer-decomposition",
  "segmentation",
  "subject-detection",
  "human-identification",
  "voice-preset",
  "character",
  "get-1080p",
  "get-4k",
  "timestamped-lyrics",
  "recovery",
  "voice-clone",
  "persona",
  "style-boost",
]);

function inferOperation(slug: string, summary: string, category: Category, refs: "none" | "optional" | "required"): string {
  const s = `${slug} ${summary}`.toLowerCase();
  const rules: [RegExp, string][] = [
    [/remove-background|background removal/, "remove-background"],
    [/upscale/, "upscale"],
    [/1080-?p/, "get-1080p"],
    [/4k-video|get 4k/, "get-4k"],
    [/layer-decomposition/, "layer-decomposition"],
    [/segment-map/, "segmentation"],
    [/subject-detection/, "subject-detection"],
    [/human-identification/, "human-identification"],
    [/audio-isolation/, "audio-isolation"],
    [/separate-vocals/, "stem-separation"],
    [/midi/, "midi"],
    [/convert-to-wav/, "convert-to-wav"],
    [/timestamped-lyrics/, "timestamped-lyrics"],
    [/recovery/, "recovery"],
    [/suno-voice/, "voice-clone"],
    [/persona/, "persona"],
    [/boost-music-style/, "style-boost"],
    [/omni-audio/, "voice-preset"],
    [/omni-character/, "character"],
    [/lip-sync/, "lip-sync"],
    [/text-to-dialogue/, "text-to-dialogue"],
    [/tts|text-to-speech/, "text-to-speech"],
    [/generate-lyrics/, "lyrics"],
    [/music-video/, "music-video"],
    [/generate-sounds/, "sound-effects"],
    [/add-instrumental/, "add-instrumental"],
    [/add-vocals/, "add-vocals"],
    [/replace-section/, "replace-section"],
    [/mashup/, "mashup"],
    [/cover/, "cover"],
    [/upload-and-extend|extend/, "extend"],
    [/generate-music/, "text-to-music"],
    [/avatar|omnihuman|infinitalk|from-audio|speech-to-video/, "talking-avatar"],
    [/motion-control|animate-move|animate-replace/, "motion-transfer"],
    [/transition|keyframe/, "keyframes"],
    [/reference-to-video|r2v/, "reference-to-video"],
    [/video-to-video|videoedit|video-edit|aleph|transformation/, "video-to-video"],
    [/image-to-video/, "image-to-video"],
    [/text-to-video/, "text-to-video"],
    [/edit|remix|character/, "edit"],
    [/image-to-image/, "image-to-image"],
    [/text-to-image/, "text-to-image"],
  ];
  for (const [re, op] of rules) if (re.test(s)) return op;
  if (category === "image")
    return { none: "text-to-image", optional: "text-or-image-to-image", required: "image-to-image" }[refs];
  if (category === "video")
    return { none: "text-to-video", optional: "text-or-image-to-video", required: "image-to-video" }[refs];
  return "generate";
}

/** Splits an input schema into variants (oneOf/anyOf), each merged with the shared base fields. */
function variantsOf(schema: JsonSchema): { title: string; schema: JsonSchema }[] {
  const alts = schema.oneOf ?? schema.anyOf;
  const base: JsonSchema = { ...schema, oneOf: undefined, anyOf: undefined };
  if (!alts?.length) return [{ title: "Default", schema: base }];
  const all = alts.map((alt, i) => ({
    title: (alt as { title?: string }).title ?? `Variant ${i + 1}`,
    schema: {
      type: "object",
      description: base.description,
      properties: { ...base.properties, ...alt.properties },
      required: [...new Set([...(base.required ?? []), ...(alt.required ?? [])])],
    } as JsonSchema,
  }));
  // Some pages carry a meaningless `anyOf: [{type: string}, {type: string}]` (MiniMax H3):
  // variants that end up identical are one input shape, not a choice for the user.
  const unique = all.filter((v, i) => all.findIndex((w) => JSON.stringify(w.schema) === JSON.stringify(v.schema)) === i);
  if (unique.length === 1) return [{ title: "Default", schema: unique[0].schema }];
  // Untitled but different: name each by the fields only it has ("With Video urls").
  return unique.map((v) => {
    if (!/^Variant \d+$/.test(v.title)) return v;
    const own = Object.keys(v.schema.properties ?? {}).filter((k) => unique.some((w) => w !== v && !w.schema.properties?.[k]));
    return own.length ? { ...v, title: `With ${own.map((k) => k.replace(/_/g, " ")).join(", ")}` } : v;
  });
}

function categoryFromTag(tag: string): Category {
  if (/Image\s+Models/.test(tag)) return "image";
  if (/Video Models/.test(tag)) return "video";
  if (/Music Models/.test(tag)) return "audio";
  return "image";
}

const REF_NAME = /(^|_)(urls?|image|images|video|audio|mask|image_input|input_image|first_frame|last_frame|tail_image)(_|$)|Urls?$/i;

function referenceFields(schema: JsonSchema): string[] {
  const out: string[] = [];
  for (const [name, p] of Object.entries(schema.properties ?? {})) {
    const isStr = p.type === "string" || p.items?.type === "string";
    const uri = p.format === "uri" || p.items?.format === "uri";
    const desc = (p.description ?? "").toLowerCase();
    const mentionsUrl = /\burls?\b/.test(desc) && !/callback/.test(desc);
    if (isStr && (uri || (REF_NAME.test(name) && mentionsUrl))) out.push(name);
  }
  return out;
}

// ---------- pricing match ----------

interface RawPrice {
  modelDescription: string;
  interfaceType: string;
  creditPrice: string;
  creditUnit: string;
  usdPrice: string;
  anchor?: string;
}

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Hand-maintained links from a model-ID prefix to a pricing-page model name, for
 * names that cannot be matched mechanically. Longest prefix wins. Only add an
 * entry when the pricing name unambiguously refers to the same model.
 */
const PRICE_ALIASES: [string, string][] = [
  ["4o-image-api", "OpenAI 4o image"],
  ["flux1-kontext", "Black Forest Labs flux1-kontext"],
  ["flux-2/flex", "Black Forest Labs Flux 2 Flex"],
  ["flux-2/pro", "Black Forest Labs flux-2 pro"],
  ["flux-3/klein", "Black Forest Labs Flux 3 Klein"],
  ["bytedance/v1-lite", "bytedance/seedance-v1-lite"],
  ["bytedance/v1-pro-fast", "bytedance/seedance-v1-pro-fast"],
  ["bytedance/v1-pro", "bytedance/seedance-v1-pro"],
  ["bytedance/seedream-v4", "seedream v4"],
  ["bytedance/seedream", "seedream 3.0"],
  ["seedream/5-lite", "seedream 5.0 Lite"],
  ["elevenlabs/text-to-dialogue-v3", "Elevenlabs V3"],
  ["google/gemini-2-5-pro-tts", "Gemini 2.5 Pro TTS"],
  ["google/gemini-3-1-flash-tts", "Gemini 3.1 Flash TTS"],
  ["google/gemini-3-8-flash-lite-tts", "Gemini 3.8 Flash-Lite TTS"],
  ["google/gemini-3-8-flash-tts", "Gemini 3.8 Flash TTS"],
  ["nano-banana-pro", "Google nano banana pro"],
  ["happyhorse/", "HappyHorse-1.0"],
  ["infinitalk/", "MeiGen-AI InfiniteTalk"],
  ["kling/v2-1", "Kling 2.1"],
  ["kling/v2-5-turbo", "kling 2.5 turbo"],
  ["kling/v3-turbo", "kling 3.0 turbo"],
  ["qwen2-1/", "Qwen-Image-2.1"],
  ["qwen2/", "Qwen Image 2"],
  ["qwen3/pro", "Qwen image 3.0 Pro"],
  ["qwen3/", "Qwen image 3.0"],
  ["qwen/text-to-image", "Qwen Image"],
  ["topaz/image-upscale", "Topaz Image Upscaler"],
  ["topaz/video-upscale", "Topaz Video Upscaler"],
  ["wan/2-2-a14b-image-to-video", "Wan 2.2 A14B Turbo API image to Video"],
  ["wan/2-2-a14b-speech-to-video", "Wan 2.2 A14B Turbo API Speech to Video"],
  ["wan/2-2-a14b-text-to-video", "Wan 2.2 A14B Turbo API text to Video"],
  ["wan/2-7-r2v", "wan 2.7 video"],
  ["wan/2-7-text-to-video", "wan 2.7 video"],
  ["z-image", "Qwen z-image"],
  ["ai-music-api/", "Suno"],
  ["veo", "Google veo 3.1"],
];

function buildPriceMatcher(rows: RawPrice[]) {
  const byName = new Map<string, RawPrice[]>();
  for (const r of rows) {
    const name = compact(r.modelDescription.split(",")[0] ?? "");
    if (!name) continue;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name)!.push(r);
  }
  const names = [...byName.keys()].sort((a, b) => b.length - a.length);
  // Narrow a name's rows to the ones mentioning this operation, when any do.
  const opPattern: Record<string, RegExp> = {
    "text-to-image": /text[\s-]*to[\s-]*image/i,
    "image-to-image": /image[\s-]*to[\s-]*image|edit/i,
    edit: /edit|image[\s-]*to[\s-]*image/i,
    "text-to-video": /text[\s-]*(\/[\s\w]*)?to[\s-]*video|text/i,
    "image-to-video": /image[\s-]*to[\s-]*video|image/i,
    "reference-to-video": /reference/i,
    "video-to-video": /video[\s-]*to[\s-]*video|edit/i,
    upscale: /upscale/i,
    extend: /extend/i,
    "get-4k": /get 4k/i,
    "get-1080p": /get 1080p/i,
    "layer-decomposition": /layer/i,
    segmentation: /segment/i,
    keyframes: /keyframe|transition/i,
    "motion-transfer": /motion|animate/i,
  };
  const aliases = [...PRICE_ALIASES].sort((a, b) => b[0].length - a[0].length);
  return (candidates: string[], operation: string): PriceRow[] => {
    const alias = aliases.find(([prefix]) => candidates[0].startsWith(prefix));
    const tries = alias ? [alias[1]] : candidates;
    for (const cand of tries.map(compact)) {
      // Longest pricing name that this model ID starts with (most specific match).
      const hit = names.find((n) => cand === n || cand.startsWith(n));
      if (hit && hit.length >= 4) {
        let rows = byName.get(hit)!;
        const re = opPattern[operation];
        if (re) {
          const narrowed = rows.filter((r) => re.test(r.modelDescription));
          if (narrowed.length) rows = narrowed;
        }
        // Families priced per endpoint (Suno, Veo): keep rows naming this endpoint.
        const words = (candidates[1] ?? "").split("/").pop()!.split("-").filter((w) => w.length > 2);
        if (rows.length > 1 && words.length) {
          const narrowed = rows.filter((r) => words.every((w) => compact(r.modelDescription).includes(compact(w))));
          if (narrowed.length) rows = narrowed;
        }
        return rows.map((r) => ({
          description: r.modelDescription,
          credits: Number(r.creditPrice),
          unit: r.creditUnit,
          usd: r.usdPrice,
        }));
      }
    }
    return [];
  };
}

// ---------- main ----------

function firstParagraph(desc: unknown): string {
  if (typeof desc !== "string") return "";
  return (
    desc
      .split(/\n\s*\n/)
      .map((p) => p.replace(/[:#*`|>]+/g, " ").replace(/\s+/g, " ").trim())
      .find((p) => p.length > 20 && !/^(warning|tip|info)/i.test(p) && !p.startsWith("<")) ?? ""
  ).slice(0, 280);
}

function main() {
  const pricingPath = path.join(DOCS_DIR, "pricing.json");
  const pricing = fs.existsSync(pricingPath)
    ? (JSON.parse(fs.readFileSync(pricingPath, "utf8")) as { fetchedAt: string; rows: RawPrice[] })
    : { fetchedAt: null, rows: [] };
  const matchPrice = buildPriceMatcher(pricing.rows);

  const models: CatalogModel[] = [];
  const skipped: string[] = [];
  for (const file of fs.readdirSync(DOCS_DIR).sort()) {
    if (!file.endsWith(".md")) continue;
    if (/^(common-api|file-upload-api|getting-started|market__quickstart|market__common)/.test(file)) continue;
    const text = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
    const m = text.match(/```yaml\n([\s\S]*?)\n```/);
    if (!m) {
      skipped.push(`${file}: no OpenAPI block`);
      continue;
    }
    const doc = yaml.load(m[1]) as AnyObj;
    const slug = file.replace(/\.md$/, "");
    const docUrl = `https://docs.kie.ai/${slug.replace(/__/g, "/")}`;
    for (const [p, ops] of Object.entries((doc.paths ?? {}) as AnyObj)) {
      const op = (ops as AnyObj).post as AnyObj | undefined;
      if (!op) continue;
      const issues = new Set<string>();
      const rawBody = ((op.requestBody as AnyObj)?.content as AnyObj)?.["application/json"] as AnyObj | undefined;
      const body = clean(doc, rawBody?.schema, issues);
      const tag = ((op.tags as string[]) ?? [""])[0];
      let category = categoryFromTag(tag);
      const provider = tag.split("/").pop()!.replace(/\s+API$/, "").trim();
      const summary = firstParagraph(op.description);
      const title = String(op.summary ?? slug);

      let family: Family = "market";
      let bodyMode: "nested" | "flat" = "nested";
      let modelId = "";
      let inputSchema: JsonSchema;

      if (p === "/api/v1/jobs/createTask") {
        const mp = body.properties?.model;
        const ids = (mp?.enum as string[] | undefined) ?? [];
        modelId = ids[0] ?? (mp?.default as string) ?? (mp?.examples?.[0] as string) ?? "";
        if (!modelId) issues.add("No model ID found in the docs request schema");
        if (ids.length > 1) issues.add(`Docs list several model IDs (${ids.join(", ")}); using the first`);
        inputSchema = body.properties?.input ?? {};
        if (!body.properties?.input) issues.add("Request schema has no `input` object");
        if (/recovery/.test(slug)) {
          family = "suno-recovery";
          issues.add(
            "Docs conflict: OpenAPI path is /api/v1/jobs/createTask, but the page text says POST /api/v1/suno/recovery; polling is /api/v1/suno/recovery/record-info (response shape undocumented)",
          );
        }
      } else if (p.startsWith("/api/v1/omni/")) {
        family = "omni-asset";
        bodyMode = "flat";
        modelId = p.replace("/api/v1/", "");
        inputSchema = body;
      } else {
        skipped.push(`${file}: unknown endpoint ${p}`);
        continue;
      }

      const variants = variantsOf(inputSchema).map((v) => ({ ...v, referenceFields: referenceFields(v.schema) }));
      if (variants.every((v) => !v.schema.properties || Object.keys(v.schema.properties).length === 0))
        issues.add("Input schema has no documented fields");
      const refs = [...new Set(variants.flatMap((v) => v.referenceFields))];
      const refsRequired = variants.every((v) => v.referenceFields.some((f) => v.schema.required?.includes(f)));
      const operation = inferOperation(
        slug,
        `${title}`,
        category,
        refs.length === 0 ? "none" : refsRequired ? "required" : "optional",
      );
      if (TOOL_OPS.has(operation)) category = "tools";
      if (operation === "talking-avatar" || operation === "lip-sync") category = "video";

      models.push({
        key: slug.replace(/^market__/, "").replace(/__/g, "/"),
        modelId,
        title,
        provider,
        family,
        category,
        operation,
        createPath: p,
        bodyMode,
        variants,
        referenceFields: refs,
        docUrl,
        issues: [...issues],
        pricing:
          family === "omni-asset" ? [] : matchPrice([modelId, slug.split("__").slice(1).join("-")], operation),
        summary,
        free: /This endpoint is free/i.test(String(op.description ?? "")),
        promptReferenceSyntax: syntaxFor(
          slug.replace(/^market__/, "").replace(/__/g, "/"),
          docUrl,
          variants.some((v) => layoutFields(v.schema).refFields.length > 0),
        ),
      });
    }
  }

  const catalog: Catalog = {
    generatedAt: new Date().toISOString(),
    pricingFetchedAt: pricing.fetchedAt,
    models,
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 1));

  const count = (c: Category) => models.filter((x) => x.category === c).length;
  console.log(
    `Catalog: ${models.length} models — image ${count("image")}, video ${count("video")}, audio ${count("audio")}, tools ${count("tools")}`,
  );
  console.log(`With issues: ${models.filter((x) => x.issues.length).length}; without price match: ${models.filter((x) => !x.pricing.length).length}`);
  for (const s of skipped) console.log(`  skipped ${s}`);
  const dup = models.map((x) => x.key).filter((k, i, a) => a.indexOf(k) !== i);
  if (dup.length) throw new Error(`Duplicate catalog keys: ${dup.join(", ")}`);
}

main();
