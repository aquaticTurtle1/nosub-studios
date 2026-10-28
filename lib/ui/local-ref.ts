import type { RefKind } from "./fields";

/**
 * A reference is stored as a pointer to a local file, never as a Kie.ai upload URL
 * (those expire after 24 h) or a blob:/data: URL. The server swaps these for fresh
 * Kie.ai upload URLs at submit time.
 *
 *   local://upload/<id>        file in data/uploads (see lib/server/uploads.ts)
 *   local://output/<path>      generated file in data/outputs
 */
export const LOCAL_SCHEME = "local://";

export interface UploadRecord {
  id: string;
  name: string;
  mime: string;
  kind: RefKind;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: number;
}

export type LocalSource = { source: "upload"; id: string } | { source: "output"; path: string };

export const uploadUri = (id: string) => `${LOCAL_SCHEME}upload/${id}`;
export const outputUri = (rel: string) => `${LOCAL_SCHEME}output/${rel}`;
export const isLocalUri = (v: unknown): v is string => typeof v === "string" && v.startsWith(LOCAL_SCHEME);

export function parseLocalUri(uri: string): LocalSource | null {
  const m = uri.match(/^local:\/\/(upload|output)\/(.+)$/);
  if (!m) return null;
  if (m[1] === "upload") return /^[0-9a-f-]{36}$/.test(m[2]) ? { source: "upload", id: m[2] } : null;
  return m[2].split("/").some((p) => p === ".." || p === "") ? null : { source: "output", path: m[2] };
}

/** Where the browser can show the file. */
export function previewUrl(uri: string): string {
  const s = parseLocalUri(uri);
  if (!s) return uri;
  return s.source === "upload" ? `/api/uploads/${s.id}` : `/api/files/${s.path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Every local:// string inside a request input. */
export function collectLocalUris(v: unknown, out: string[] = []): string[] {
  if (isLocalUri(v)) out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => collectLocalUris(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => collectLocalUris(x, out));
  return out;
}

/** Deep-replaces local:// strings using `map`. */
export function replaceLocalUris(v: unknown, map: Map<string, string>): unknown {
  if (isLocalUri(v)) return map.get(v) ?? v;
  if (Array.isArray(v)) return v.map((x) => replaceLocalUris(x, map));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, replaceLocalUris(x, map)]));
  return v;
}
