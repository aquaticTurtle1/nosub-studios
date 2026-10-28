import "server-only";
import { kieRequest } from "../client";
import { KieError } from "../errors";
import { normalizeRecordInfo, type RecordInfoData } from "./normalize";
import type { ProviderAdapter } from "./types";

/** POST /api/v1/jobs/createTask + GET /api/v1/jobs/recordInfo. */
export const marketAdapter: ProviderAdapter = {
  async submit(model, input, { key, callBackUrl }) {
    const body: Record<string, unknown> = { model: model.modelId, input };
    if (callBackUrl) body.callBackUrl = callBackUrl;
    const data = await kieRequest<{ taskId?: string }>({ key, path: model.createPath, json: body, timeoutMs: 90_000 });
    if (!data?.taskId) throw new KieError("bad_response", "createTask returned no taskId", { ambiguous: true });
    return { taskId: data.taskId };
  },

  async getStatus(taskId, { key, model }) {
    const data = await kieRequest<RecordInfoData>({
      key,
      path: "/api/v1/jobs/recordInfo",
      query: { taskId },
      timeoutMs: 30_000,
    });
    return normalizeRecordInfo(data ?? {}, model.category);
  },
};
