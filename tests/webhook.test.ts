import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { computeSignature, verifyWebhook, WEBHOOK_MAX_SKEW_SECONDS } from "@/lib/kie/webhook";

const KEY = "test-hmac-key";
const NOW = 1_800_000_000;

const sign = (taskId: string, ts: string) => createHmac("sha256", KEY).update(`${taskId}.${ts}`).digest("base64");

describe("webhook signature", () => {
  it("matches the documented algorithm base64(HMAC-SHA256(taskId.timestamp))", () => {
    expect(computeSignature("task_1", "1700000000", KEY)).toBe(sign("task_1", "1700000000"));
  });

  it("accepts a valid, fresh signature", () => {
    const ts = String(NOW);
    expect(verifyWebhook({ taskId: "task_1", timestamp: ts, signature: sign("task_1", ts), hmacKey: KEY, nowSeconds: NOW })).toEqual({ ok: true });
  });

  it("rejects a wrong signature", () => {
    const ts = String(NOW);
    const r = verifyWebhook({ taskId: "task_1", timestamp: ts, signature: sign("task_2", ts), hmacKey: KEY, nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "invalid signature" });
  });

  it("rejects a signature of different length without throwing", () => {
    const r = verifyWebhook({ taskId: "t", timestamp: String(NOW), signature: "short", hmacKey: KEY, nowSeconds: NOW });
    expect(r.ok).toBe(false);
  });

  it("rejects stale and future timestamps", () => {
    const old = String(NOW - WEBHOOK_MAX_SKEW_SECONDS - 1);
    const future = String(NOW + WEBHOOK_MAX_SKEW_SECONDS + 1);
    expect(verifyWebhook({ taskId: "t", timestamp: old, signature: sign("t", old), hmacKey: KEY, nowSeconds: NOW })).toEqual({ ok: false, reason: "stale timestamp" });
    expect(verifyWebhook({ taskId: "t", timestamp: future, signature: sign("t", future), hmacKey: KEY, nowSeconds: NOW }).ok).toBe(false);
  });

  it("rejects missing headers, missing key and non-numeric timestamps", () => {
    expect(verifyWebhook({ taskId: "t", timestamp: null, signature: "x", hmacKey: KEY }).ok).toBe(false);
    expect(verifyWebhook({ taskId: "t", timestamp: "1", signature: "x", hmacKey: "" }).ok).toBe(false);
    expect(verifyWebhook({ taskId: "t", timestamp: "abc", signature: "x", hmacKey: KEY }).ok).toBe(false);
    expect(verifyWebhook({ taskId: undefined, timestamp: "1", signature: "x", hmacKey: KEY }).ok).toBe(false);
  });
});
