"use client";

import type { SerializedKieError } from "@/lib/kie/errors";

export class ApiError extends Error {
  constructor(
    readonly error: SerializedKieError,
    readonly status: number,
    readonly body: Record<string, unknown>,
  ) {
    super(error.message);
  }
}

/** fetch + JSON with the app's `{ error }` envelope turned into ApiError. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch (e) {
    throw new ApiError(
      { kind: "network", label: "Network error", message: e instanceof Error ? e.message : "Request failed", ambiguous: false, code: undefined },
      0,
      {},
    );
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || body.error) {
    const error = (body.error as SerializedKieError) ?? {
      kind: "server",
      label: `HTTP ${res.status}`,
      message: res.statusText,
      ambiguous: false,
      code: undefined,
    };
    throw new ApiError(error, res.status, body);
  }
  return body as T;
}

export const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
