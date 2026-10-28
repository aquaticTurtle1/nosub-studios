import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { zip } from "@/lib/server/zip";

describe("zip", () => {
  it("writes an archive that standard tools can read back", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zip-test-"));
    const file = path.join(dir, "a.zip");
    fs.writeFileSync(file, zip([{ name: "task-1/01.png", data: Buffer.from("hello") }, { name: "task-2/clip.mp4", data: Buffer.alloc(1000, 7) }]));
    // bsdtar reads ZIP archives (Windows' own tar.exe; macOS tar). GNU tar (Git Bash) does not.
    const tar = process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:\Windows", "System32", "tar.exe") : "bsdtar";
    const listing = execFileSync(tar, ["-tf", file], { encoding: "utf8" });
    expect(listing.split(/\r?\n/).filter(Boolean)).toEqual(["task-1/01.png", "task-2/clip.mp4"]);
    execFileSync(tar, ["-xf", file, "-C", dir]);
    expect(fs.readFileSync(path.join(dir, "task-1/01.png"), "utf8")).toBe("hello");
    expect(fs.readFileSync(path.join(dir, "task-2/clip.mp4"))).toEqual(Buffer.alloc(1000, 7));
  });
});
