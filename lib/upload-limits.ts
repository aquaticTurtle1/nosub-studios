import type { RefKind } from "@/lib/ui/fields";

/**
 * Caps for reference files. The File Upload API documents no hard cap for stream upload;
 * per-model limits (often 10-50 MB images, up to 100 MB video) are checked in the panel.
 * Browser-safe: shared by the local server and the cloud backend.
 */
export const UPLOAD_LIMITS: Record<RefKind, number> = {
  image: 50 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  audio: 500 * 1024 * 1024,
};

export const uploadLimitMessage = (kind: RefKind) => `${kind} files are limited to ${Math.round(UPLOAD_LIMITS[kind] / 1048576)} MB here.`;
