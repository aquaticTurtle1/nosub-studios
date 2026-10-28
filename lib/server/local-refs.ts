import "server-only";
import fs from "node:fs";
import path from "node:path";
import { uploadFile } from "@/lib/kie/client";
import { KieError } from "@/lib/kie/errors";
import { collectLocalUris, parseLocalUri, replaceLocalUris } from "@/lib/ui/local-ref";
import { resolveOutputPath } from "./storage";
import { getUpload, typeForExt } from "./uploads";

/** Local file behind a local:// reference, or null when it is gone. */
export function localFile(uri: string): { path: string; name: string; mime: string } | null {
  const s = parseLocalUri(uri);
  if (!s) return null;
  if (s.source === "upload") {
    const u = getUpload(s.id);
    return u ? { path: u.path, name: u.name, mime: u.mime } : null;
  }
  const full = resolveOutputPath(s.path);
  return full ? { path: full, name: path.basename(full), mime: typeForExt(path.extname(full).toLowerCase()) } : null;
}

/**
 * Uploads every local file the input points at to the Kie.ai File Upload API and
 * puts the fresh URLs into the input. Runs right before createTask, so the 24 h
 * upload retention starts at submit.
 */
export async function resolveLocalRefs(input: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
  const uris = [...new Set(collectLocalUris(input))];
  if (!uris.length) return input;
  const urls = new Map<string, string>();
  for (const uri of uris) {
    const f = localFile(uri);
    if (!f) throw new KieError("validation", "A reference file is missing from the local library. Remove it and add it again.");
    const ext = path.extname(f.path).toLowerCase();
    const kind = f.mime.split("/")[0];
    const blob = new Blob([fs.readFileSync(f.path)], { type: f.mime });
    // Random name: same-name uploads overwrite each other on Kie.ai.
    const res = await uploadFile(key, blob, `${crypto.randomUUID()}${ext}`, `kie-studio/${kind}`);
    urls.set(uri, res.downloadUrl);
  }
  return replaceLocalUris(input, urls) as Record<string, unknown>;
}
