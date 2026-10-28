import { createHmac, timingSafeEqual } from "node:crypto";

/** Max accepted age of X-Webhook-Timestamp (replay protection). */
export const WEBHOOK_MAX_SKEW_SECONDS = 300;

export function computeSignature(taskId: string, timestamp: string, hmacKey: string): string {
  return createHmac("sha256", hmacKey).update(`${taskId}.${timestamp}`).digest("base64");
}

export type WebhookCheck = { ok: true } | { ok: false; reason: string };

/**
 * Verifies a Kie.ai callback: base64(HMAC-SHA256(taskId + "." + timestamp, key)),
 * constant-time compare, and a freshness window on the timestamp (seconds).
 */
export function verifyWebhook(params: {
  taskId: string | undefined;
  timestamp: string | null;
  signature: string | null;
  hmacKey: string;
  nowSeconds?: number;
}): WebhookCheck {
  const { taskId, timestamp, signature, hmacKey } = params;
  if (!hmacKey) return { ok: false, reason: "webhook HMAC key not configured" };
  if (!timestamp || !signature) return { ok: false, reason: "missing signature headers" };
  if (!taskId) return { ok: false, reason: "missing taskId" };
  if (!/^\d+$/.test(timestamp)) return { ok: false, reason: "invalid timestamp" };
  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > WEBHOOK_MAX_SKEW_SECONDS) return { ok: false, reason: "stale timestamp" };
  const expected = Buffer.from(computeSignature(taskId, timestamp, hmacKey));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "invalid signature" };
  }
  return { ok: true };
}
