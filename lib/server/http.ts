import "server-only";
import type { SerializedKieError } from "@/lib/kie/errors";
import { serializeError } from "@/lib/kie/errors";

const STATUS: Partial<Record<SerializedKieError["kind"], number>> = {
  missing_key: 401,
  invalid_key: 401,
  insufficient_credits: 402,
  validation: 422,
  not_found: 404,
  rate_limited: 429,
};

export function errorResponse(e: unknown, extra: Record<string, unknown> = {}) {
  const error = serializeError(e);
  return Response.json({ error, ...extra }, { status: STATUS[error.kind] ?? 502 });
}

export function noStore(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, { ...init, headers: { "Cache-Control": "no-store", ...init.headers } });
}
