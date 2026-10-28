import { randomUUID } from "node:crypto";
import { uploadFile } from "@/lib/kie/client";
import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { resolveApiKey } from "@/lib/server/key";

/**
 * Upload caps enforced here. The File Upload API documents no hard cap for
 * stream upload (URL upload ≤100 MB, Base64 ≤10 MB recommended); per-model
 * limits (often 10–50 MB images, ≤100 MB video) are enforced by Kie.ai at submit.
 */
const LIMITS: Record<string, number> = {
  image: 50 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  audio: 500 * 1024 * 1024,
};

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/flac",
  "audio/ogg",
]);

export async function POST(req: Request) {
  const { key } = await resolveApiKey();
  if (!key) return errorResponse(new KieError("missing_key", "Connect an API key first."));

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return errorResponse(new KieError("validation", "No file in upload"));
  if (!ALLOWED.has(file.type)) return errorResponse(new KieError("validation", `File type ${file.type || "unknown"} is not supported`));
  const kind = file.type.split("/")[0];
  const limit = LIMITS[kind];
  if (file.size === 0) return errorResponse(new KieError("validation", "File is empty"));
  if (file.size > limit) {
    return errorResponse(new KieError("validation", `${kind} files are limited to ${Math.round(limit / 1048576)} MB here`));
  }

  const ext = file.name.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0]?.toLowerCase() ?? "";
  try {
    // Random name: same-name uploads overwrite each other on Kie.ai.
    const res = await uploadFile(key, file, `${randomUUID()}${ext}`, `kie-studio/${kind}`);
    return noStore({ url: res.downloadUrl, size: res.fileSize, mimeType: res.mimeType, uploadedAt: res.uploadedAt });
  } catch (e) {
    return errorResponse(e);
  }
}
