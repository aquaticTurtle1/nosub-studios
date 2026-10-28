import type { Category } from "@/lib/catalog/types";
import type { NormalizedStatus, OutputRef, TaskState } from "./types";

const EXT_KIND: [RegExp, OutputRef["kind"]][] = [
  [/\.(png|jpe?g|webp|gif|bmp|avif)(\?|$)/i, "image"],
  [/\.(mp4|mov|webm|mkv|m4v)(\?|$)/i, "video"],
  [/\.(mp3|wav|m4a|aac|flac|ogg|opus)(\?|$)/i, "audio"],
];

export function kindOf(url: string, source: string, category: Category): OutputRef["kind"] {
  for (const [re, k] of EXT_KIND) if (re.test(url)) return k;
  const s = source.toLowerCase();
  if (/image|cover|thumb|mask|frame/.test(s)) return "image";
  if (/video/.test(s)) return "video";
  if (/audio|song|track|vocal|instrumental|wav/.test(s)) return "audio";
  if (category === "image") return "image";
  if (category === "video") return "video";
  if (category === "audio") return "audio";
  return "file";
}

/**
 * Walks a parsed result payload and collects every media URL, skipping streaming
 * previews (stream_audio_url) which are not files. Order is preserved, duplicates dropped.
 */
export function collectUrls(value: unknown, category: Category, source = "result", out: OutputRef[] = []): OutputRef[] {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value) && !/stream/i.test(source) && !out.some((o) => o.url === value)) {
      out.push({ url: value, kind: kindOf(value, source, category), source });
    }
  } else if (Array.isArray(value)) {
    for (const v of value) collectUrls(v, category, source, out);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (/callback/i.test(k) || k === "param") continue;
      collectUrls(v, category, k, out);
    }
  }
  return out;
}

function parseMaybeJson(v: unknown): unknown {
  if (typeof v !== "string" || !v.trim()) return v ?? undefined;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

/** Raw `data` object of GET /api/v1/jobs/recordInfo. */
export interface RecordInfoData {
  taskId?: string;
  model?: string;
  state?: string;
  resultJson?: string | null;
  response?: unknown;
  failCode?: string | number | null;
  failMsg?: string | null;
  creditsConsumed?: number | null;
  progress?: number | null;
}

const MARKET_STATE: Record<string, TaskState> = {
  waiting: "pending",
  queuing: "pending",
  generating: "running",
  success: "success",
  fail: "fail",
};

export function normalizeRecordInfo(data: RecordInfoData, category: Category): NormalizedStatus {
  const rawState = String(data.state ?? "unknown");
  const state = MARKET_STATE[rawState] ?? "running";
  const result = parseMaybeJson(data.resultJson);
  const outputs: OutputRef[] = [];
  if (state === "success") {
    collectUrls(result, category, "resultJson", outputs);
    // Suno puts tracks in data.response.data[]; other models mirror resultJson here.
    collectUrls(data.response, category, "response", outputs);
  }
  const resultObject =
    (result && typeof result === "object" && "resultObject" in result
      ? (result as { resultObject: unknown }).resultObject
      : undefined) ?? (state === "success" && !outputs.length ? (data.response ?? result) : undefined);
  return {
    state,
    rawState,
    outputs,
    resultObject: resultObject ?? undefined,
    error:
      state === "fail"
        ? { code: data.failCode ? String(data.failCode) : undefined, message: data.failMsg || "Generation failed (no failMsg)" }
        : undefined,
    creditsConsumed: typeof data.creditsConsumed === "number" ? data.creditsConsumed : undefined,
    progress: typeof data.progress === "number" ? data.progress : undefined,
  };
}

/**
 * Suno recovery polling has an undocumented response shape. Map the usual
 * status spellings and collect any URLs; unknown states keep polling.
 */
export function normalizeLooseStatus(data: unknown, category: Category): NormalizedStatus {
  const d = (data ?? {}) as Record<string, unknown>;
  const rawState = String(d.state ?? d.status ?? d.successFlag ?? "unknown");
  const s = rawState.toLowerCase();
  let state: TaskState = "running";
  if (/success|complete|done|finished/.test(s)) state = "success";
  else if (/fail|error/.test(s)) state = "fail";
  else if (/wait|queue|pending/.test(s)) state = "pending";
  const outputs = state === "success" ? collectUrls(d, category) : [];
  return {
    state,
    rawState,
    outputs,
    resultObject: state === "success" && !outputs.length ? d : undefined,
    error: state === "fail" ? { message: String(d.errorMessage ?? d.failMsg ?? d.msg ?? "Recovery failed") } : undefined,
  };
}
