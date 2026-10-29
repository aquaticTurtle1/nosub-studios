import { describe, expect, it } from "vitest";
import { daysLeft } from "@/lib/cloud/expiry";
import type { TaskRecord } from "@/lib/task-types";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const done = (completedAt: number) => ({ id: "t", createdAt: completedAt - 1000, completedAt }) as unknown as TaskRecord;

describe("daysLeft", () => {
  it("is 14 right after completion", () => {
    const t0 = 1_000_000_000_000;
    expect(daysLeft(done(t0), t0)).toBe(14);
  });

  it("is 1 an hour before expiry", () => {
    const t0 = 1_000_000_000_000;
    const expiry = t0 + 14 * DAY;
    expect(daysLeft(done(t0), expiry - HOUR)).toBe(1);
  });

  it("is <= 0 after expiry", () => {
    const t0 = 1_000_000_000_000;
    expect(daysLeft(done(t0), t0 + 14 * DAY)).toBeLessThanOrEqual(0);
    expect(daysLeft(done(t0), t0 + 14 * DAY + HOUR)).toBeLessThanOrEqual(0);
  });
});
