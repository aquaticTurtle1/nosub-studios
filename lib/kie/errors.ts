export type KieErrorKind =
  | "missing_key"
  | "invalid_key"
  | "insufficient_credits"
  | "rate_limited"
  | "validation"
  | "not_found"
  | "maintenance"
  | "feature_disabled"
  | "generation_failed"
  | "server"
  | "timeout"
  | "network"
  | "bad_response";

/** Body `code` values documented on docs.kie.ai (errors come back with HTTP 200). */
export function kindForCode(code: number): KieErrorKind {
  switch (code) {
    case 401:
      return "invalid_key";
    case 402:
      return "insufficient_credits";
    case 404:
      return "not_found";
    case 408:
      return "timeout";
    case 422:
    case 400:
      return "validation";
    case 429:
      return "rate_limited";
    case 455:
      return "maintenance";
    case 501:
      return "generation_failed";
    case 505:
      return "feature_disabled";
    default:
      return "server";
  }
}

export const KIND_LABEL: Record<KieErrorKind, string> = {
  missing_key: "No API key connected",
  invalid_key: "API key rejected (401)",
  insufficient_credits: "Insufficient credits (402)",
  rate_limited: "Rate limited (429) — Kie.ai allows 20 new generation requests per 10 s",
  validation: "Request rejected by validation (422)",
  not_found: "Not found (404)",
  maintenance: "Kie.ai is under maintenance (455)",
  feature_disabled: "Feature disabled on Kie.ai (505)",
  generation_failed: "Generation failed (501)",
  server: "Kie.ai server error",
  timeout: "Timed out",
  network: "Network error",
  bad_response: "Unexpected response from Kie.ai",
};

export class KieError extends Error {
  readonly kind: KieErrorKind;
  readonly code?: number;
  /**
   * For POST requests: the request may have reached Kie.ai (timeout / connection
   * reset after send). Such a submit must NOT be retried automatically.
   */
  readonly ambiguous: boolean;

  constructor(kind: KieErrorKind, message: string, opts: { code?: number; ambiguous?: boolean } = {}) {
    super(message);
    this.name = "KieError";
    this.kind = kind;
    this.code = opts.code;
    this.ambiguous = opts.ambiguous ?? false;
  }

  toJSON() {
    return { kind: this.kind, code: this.code, message: this.message, label: KIND_LABEL[this.kind], ambiguous: this.ambiguous };
  }
}

export type SerializedKieError = ReturnType<KieError["toJSON"]>;

export function serializeError(e: unknown): SerializedKieError {
  if (e instanceof KieError) return e.toJSON();
  const message = e instanceof Error ? e.message : String(e);
  return { kind: "server", code: undefined, message, label: "Internal error", ambiguous: false };
}
