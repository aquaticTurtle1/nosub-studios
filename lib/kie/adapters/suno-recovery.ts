import { kieRequest } from "../client";
import { marketAdapter } from "./market";
import { normalizeLooseStatus } from "./normalize";
import type { ProviderAdapter } from "./types";

/**
 * Suno audio recovery. UNVERIFIED: the page's OpenAPI block submits via
 * /api/v1/jobs/createTask while its text says POST /api/v1/suno/recovery. We follow
 * the OpenAPI block for submit and the documented dedicated endpoint for polling.
 */
export const sunoRecoveryAdapter: ProviderAdapter = {
  submit: marketAdapter.submit,
  async getStatus(taskId, { key, model }) {
    const data = await kieRequest<unknown>({
      key,
      path: "/api/v1/suno/recovery/record-info",
      query: { task_id: taskId },
      timeoutMs: 30_000,
    });
    return normalizeLooseStatus(data, model.category);
  },
};
