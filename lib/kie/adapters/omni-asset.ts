import "server-only";
import { randomUUID } from "node:crypto";
import { kieRequest } from "../client";
import type { ProviderAdapter } from "./types";

/**
 * Gemini Omni helper endpoints (/api/v1/omni/audio/create, /api/v1/omni/character/create).
 * Synchronous and free: they return an ID (audioId / character) to pass to the
 * Gemini Omni video models. There is no task to poll.
 */
export const omniAssetAdapter: ProviderAdapter = {
  async submit(model, input, { key }) {
    const data = await kieRequest<Record<string, unknown>>({ key, path: model.createPath, json: input, timeoutMs: 60_000 });
    return {
      taskId: `local-${randomUUID()}`,
      immediate: { state: "success", rawState: "sync", outputs: [], resultObject: data },
    };
  },
  async getStatus() {
    return null;
  },
};
