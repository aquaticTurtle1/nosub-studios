import "server-only";
import { z } from "zod";
import { cloudOnly } from "@/lib/server/mode-guard";
import { MAX_FUTURE_MS, MAX_RECORD_BYTES, ownerHasTasks, ownerOf } from "./history";
import { hit } from "./rate-limit";

export const MAX_BODY = 256 * 1024;
const FP = /^[0-9a-f]{64}$/;

export const TaskRecordSchema = z.object({ id: z.string().min(1).max(100), createdAt: z.number() }).passthrough();

export const ModeParam = z.string().regex(/^[a-z0-9-]{1,32}$/);

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return xff || req.headers.get("x-real-ip")?.trim() || "unknown";
}

const fail = (status: number, msg: string) =>
  Response.json({ error: msg }, { status, headers: { "Cache-Control": "no-store" } });

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

/** Common gate for /api/cloud/* (except cron). Returns an error Response, or the owner hash. */
export async function gate(req: Request): Promise<Response | { owner: string }> {
  const off = cloudOnly();
  if (off) return off;
  if (!(await hit("ip:" + clientIp(req), 120, 60_000))) return fail(429, "Too many requests");
  if ((req.method === "POST" || req.method === "PUT") && !sameOrigin(req)) return fail(403, "Bad origin");
  const fp = req.headers.get("x-studio-owner") ?? "";
  if (!FP.test(fp)) return fail(400, "Missing or invalid X-Studio-Owner");
  return { owner: ownerOf(fp) };
}

/** Read a JSON body capped at 256 KB. */
export async function readJson(req: Request): Promise<{ value: unknown } | Response> {
  const len = Number(req.headers.get("content-length"));
  if (Number.isFinite(len) && len > MAX_BODY) return fail(413, "Payload too large");
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY) return fail(413, "Payload too large");
  try {
    return { value: JSON.parse(text) };
  } catch {
    return fail(400, "Invalid JSON");
  }
}

export const bad = (msg: string) => fail(422, msg);

/** New owners one IP may create per day. */
export const NEW_OWNERS_PER_IP_PER_DAY = 20;

/**
 * Checks a task batch before it is stored: each record's JSON at most 32 KB (413), createdAt not more than a day
 * ahead (422). Returns an error Response, or null.
 */
export function checkRecords(tasks: { createdAt: number }[], now = Date.now()): Response | null {
  for (const t of tasks) {
    if (new TextEncoder().encode(JSON.stringify(t)).length > MAX_RECORD_BYTES) return fail(413, "Task record too large");
    if (t.createdAt > now + MAX_FUTURE_MS) return bad("createdAt is in the future");
  }
  return null;
}

/**
 * Per-IP daily cap on distinct NEW owners (owners are free to make, so they are the quota attack). Counted only
 * when the owner has no rows yet, so a normal user's repeated syncs never use it up. Returns an error Response, or null.
 */
export async function checkNewOwner(req: Request, owner: string): Promise<Response | null> {
  if (await ownerHasTasks(owner)) return null;
  const day = new Date().toISOString().slice(0, 10);
  const ok = await hit(`owners:${clientIp(req)}:${day}`, NEW_OWNERS_PER_IP_PER_DAY, 24 * 60 * 60 * 1000);
  return ok ? null : fail(429, "Too many new histories from this address today");
}
