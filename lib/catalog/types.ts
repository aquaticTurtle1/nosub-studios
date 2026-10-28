export type Category = "image" | "video" | "audio" | "tools";

/**
 * Provider family = which adapter talks to Kie.ai for this model.
 * - market: POST /api/v1/jobs/createTask + GET /api/v1/jobs/recordInfo (current docs
 *   put Veo, Runway, Suno, 4o Image and Flux Kontext here too)
 * - omni-asset: synchronous Gemini Omni helper endpoints that return an ID, no task
 * - suno-recovery: createTask submit, but polled via /api/v1/suno/recovery/record-info
 */
export type Family = "market" | "omni-asset" | "suno-recovery";

/** Minimal JSON-schema subset that the Kie.ai OpenAPI pages use. */
export interface JsonSchema {
  type?: string | string[];
  description?: string;
  enum?: (string | number | boolean)[];
  default?: unknown;
  examples?: unknown[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  format?: string;
  deprecated?: boolean;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
}

export interface PriceRow {
  description: string;
  credits: number;
  unit: string;
  usd: string;
}

export interface ModelVariant {
  title: string;
  schema: JsonSchema;
  referenceFields: string[];
}

export interface CatalogModel {
  /** Unique key: derived from the docs page path. */
  key: string;
  /** Value of the top-level `model` field sent to Kie.ai. */
  modelId: string;
  title: string;
  provider: string;
  family: Family;
  category: Category;
  operation: string;
  /** Path of the create endpoint, relative to KIE_API_BASE_URL. */
  createPath: string;
  /** `nested` = { model, input: {...} }; `flat` = fields at the body root. */
  bodyMode: "nested" | "flat";
  /** Input variants (docs oneOf/anyOf); a single "Default" variant when there is none. */
  variants: ModelVariant[];
  /** Top-level field names, across variants, that hold a reference file URL (or URL list). */
  referenceFields: string[];
  docUrl: string;
  /** Flags; empty = parsed from the current English OpenAPI spec without problems. */
  issues: string[];
  /** Matched rows from the kie.ai/pricing snapshot (matched by name, may be imperfect). */
  pricing: PriceRow[];
  /** Short note from the docs page description (first paragraph). */
  summary: string;
  /** Docs state "This endpoint is free." */
  free: boolean;
}

/** Lightweight entry for pickers (the full schema is fetched per model). */
export type CatalogSummary = Pick<
  CatalogModel,
  "key" | "modelId" | "title" | "provider" | "family" | "category" | "operation" | "issues" | "free"
>;

export interface Catalog {
  generatedAt: string;
  pricingFetchedAt: string | null;
  models: CatalogModel[];
}
