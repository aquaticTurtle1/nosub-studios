import type { Category } from "@/lib/catalog/types";

/** Overall tracking window per category (video tasks can exceed 10 minutes). */
export const TIMEOUT_MS: Record<Category, number> = {
  image: 15 * 60_000,
  audio: 20 * 60_000,
  tools: 20 * 60_000,
  video: 90 * 60_000,
};

export const POLL_START_MS = 4_000;
const POLL_CAP_MS = 30_000;

export function backoffMs(attempt: number): number {
  return Math.min(POLL_CAP_MS, Math.round(POLL_START_MS * 1.5 ** attempt));
}
