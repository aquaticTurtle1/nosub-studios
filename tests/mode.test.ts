import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("studio mode", () => {
  it("MODE defaults to local", async () => {
    vi.stubEnv("NEXT_PUBLIC_STUDIO_MODE", "");
    vi.resetModules();
    const m = await import("@/lib/mode");
    expect(m.MODE).toBe("local");
    expect(m.isCloud()).toBe(false);
  });

  it("MODE is cloud only for \"cloud\"", async () => {
    vi.stubEnv("NEXT_PUBLIC_STUDIO_MODE", "cloud");
    vi.resetModules();
    const cloud = await import("@/lib/mode");
    expect(cloud.MODE).toBe("cloud");
    expect(cloud.isCloud()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_STUDIO_MODE", "Cloud!");
    vi.resetModules();
    expect((await import("@/lib/mode")).MODE).toBe("local");
  });
});
