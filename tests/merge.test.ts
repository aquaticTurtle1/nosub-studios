import { describe, expect, it } from "vitest";
import { mergeTasks } from "@/lib/cloud/merge";
import type { TaskRecord } from "@/lib/task-types";

const t = (id: string, createdAt: number, extra: Partial<TaskRecord> = {}) =>
  ({ id, createdAt, state: "running", lastPolledAt: null, ...extra }) as unknown as TaskRecord;

describe("mergeTasks", () => {
  it("terminal copy wins over non-terminal", () => {
    const out = mergeTasks([t("a", 1, { state: "success" })], [t("a", 1, { state: "running", lastPolledAt: 99 })]);
    expect(out).toHaveLength(1);
    expect(out[0].state).toBe("success");
    const out2 = mergeTasks([t("a", 1, { lastPolledAt: 99 })], [t("a", 1, { state: "fail" })]);
    expect(out2[0].state).toBe("fail");
  });

  it("larger lastPolledAt wins, falling back to createdAt", () => {
    const out = mergeTasks([t("a", 1, { progress: 10, lastPolledAt: 5 } as never)], [t("a", 1, { progress: 50, lastPolledAt: 9 } as never)]);
    expect((out[0] as unknown as { progress: number }).progress).toBe(50);
    const out2 = mergeTasks([t("a", 7, { progress: 1 } as never)], [t("a", 3, { progress: 2 } as never)]);
    expect((out2[0] as unknown as { progress: number }).progress).toBe(1);
  });

  it("sorts by createdAt descending", () => {
    expect(mergeTasks([t("a", 1), t("c", 3)], [t("b", 2)]).map((x) => x.id)).toEqual(["c", "b", "a"]);
  });
});
