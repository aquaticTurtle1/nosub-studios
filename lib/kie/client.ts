import "server-only";
import { KieError, kindForCode } from "./errors";

export const KIE_API_BASE_URL = (process.env.KIE_API_BASE_URL || "https://api.kie.ai").replace(/\/$/, "");
export const KIE_UPLOAD_BASE_URL = (process.env.KIE_UPLOAD_BASE_URL || "https://kieai.redpandaai.co").replace(/\/$/, "");

export interface KieEnvelope<T> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}

interface RequestOptions {
  key: string;
  method?: "GET" | "POST";
  base?: "api" | "upload";
  path: string;
  query?: Record<string, string>;
  json?: unknown;
  form?: FormData;
  timeoutMs?: number;
}

/**
 * One authenticated call to Kie.ai. Never retries: callers decide, and createTask
 * must never be retried after an ambiguous failure (it can double-charge).
 * Never logs the key, headers or full URLs.
 */
export async function kieRequest<T>(opts: RequestOptions): Promise<T> {
  if (!opts.key) throw new KieError("missing_key", "No Kie.ai API key is configured.");
  const base = opts.base === "upload" ? KIE_UPLOAD_BASE_URL : KIE_API_BASE_URL;
  const url = new URL(base + opts.path);
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, v);
  const method = opts.method ?? (opts.json || opts.form ? "POST" : "GET");

  const headers: Record<string, string> = { Authorization: `Bearer ${opts.key}`, Accept: "application/json" };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body, signal: AbortSignal.timeout(opts.timeoutMs ?? 60_000), cache: "no-store" });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    throw new KieError(
      timedOut ? "timeout" : "network",
      `${method} ${opts.path}: ${timedOut ? "no response before timeout" : e instanceof Error ? e.message : "request failed"}`,
      { ambiguous: method === "POST" },
    );
  }

  const text = await res.text();
  let parsed: KieEnvelope<T> | undefined;
  try {
    parsed = JSON.parse(text) as KieEnvelope<T>;
  } catch {
    // fall through
  }
  if (!parsed || typeof parsed.code !== "number") {
    if (!res.ok) throw new KieError(kindForCode(res.status), `HTTP ${res.status} from ${opts.path}`, { code: res.status });
    throw new KieError("bad_response", `Non-JSON response from ${opts.path} (HTTP ${res.status})`);
  }
  // Errors arrive with HTTP 200 and a non-200 body code — always check `code`.
  if (parsed.code !== 200) {
    throw new KieError(kindForCode(parsed.code), parsed.msg || parsed.message || `code ${parsed.code}`, { code: parsed.code });
  }
  return parsed.data;
}

export async function getCredits(key: string): Promise<number> {
  const data = await kieRequest<number>({ key, path: "/api/v1/chat/credit", timeoutMs: 20_000 });
  if (typeof data !== "number") throw new KieError("bad_response", "Credit balance is not a number");
  return data;
}

/** Temporary (20 min) download link for a Kie-generated file URL. */
export async function getDownloadUrl(key: string, fileUrl: string): Promise<string> {
  return kieRequest<string>({ key, path: "/api/v1/common/download-url", json: { url: fileUrl }, timeoutMs: 30_000 });
}

export interface UploadResult {
  fileName: string;
  filePath: string;
  downloadUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

/** File Stream Upload. Files are deleted by Kie.ai 24 h after upload. */
export async function uploadFile(key: string, file: Blob, fileName: string, uploadPath: string): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file, fileName);
  form.append("uploadPath", uploadPath);
  form.append("fileName", fileName);
  return kieRequest<UploadResult>({
    key,
    base: "upload",
    path: "/api/file-stream-upload",
    form,
    timeoutMs: 10 * 60_000,
  });
}
