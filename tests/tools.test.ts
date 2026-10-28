import { describe, expect, it } from "vitest";
import data from "@/lib/catalog/generated/catalog.json";
import { TOOLS } from "@/lib/catalog/tools";
import type { Catalog } from "@/lib/catalog/types";

const catalog = data as unknown as Catalog;

describe("tools", () => {
  it("every tools catalog entry is on exactly one card, and every member is a tools entry", () => {
    const toolKeys = catalog.models.filter((m) => m.category === "tools").map((m) => m.key);
    const members = TOOLS.flatMap((t) => t.members);
    expect(new Set(members).size).toBe(members.length);
    expect([...members].sort()).toEqual([...toolKeys].sort());
  });

  it("ids are unique and URL-safe; engine names cover every member of multi-engine tools", () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      expect(t.id).toMatch(/^[a-z0-9-]+$/);
      if (t.members.length > 1) expect(Object.keys(t.engines ?? {}).sort()).toEqual([...t.members].sort());
    }
  });
});
