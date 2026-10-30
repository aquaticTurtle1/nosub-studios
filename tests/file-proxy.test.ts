import { createClient } from "@libsql/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { allowedResultUrl } from "@/lib/cloud/security-headers";

describe("allowedResultUrl", () => {
  it("accepts https on the Kie result hosts", () => {
    for (const h of ["tempfile.aiquickdraw.com", "file.aiquickdraw.com", "static.aiquickdraw.com", "tempfile.redpandaai.co"]) {
      expect(allowedResultUrl(`https://${h}/a/b.png?x=1`)?.hostname).toBe(h);
    }
  });

  it("rejects other hosts, look-alikes and subdomain tricks", () => {
    for (const u of [
      "https://evil.com/a.png",
      "https://tempfile.aiquickdraw.com.evil.com/a.png",
      "https://evil-tempfile.aiquickdraw.com/a.png",
      "https://sub.tempfile.aiquickdraw.com/a.png",
      "https://aiquickdraw.com/a.png",
      "https://api.kie.ai/x",
    ]) {
      expect(allowedResultUrl(u), u).toBeNull();
    }
  });

  it("rejects http, other schemes, ports, junk", () => {
    for (const u of [
      "http://tempfile.aiquickdraw.com/a.png",
      "ftp://tempfile.aiquickdraw.com/a.png",
      "file:///etc/passwd",
      "javascript:alert(1)",
      "https://tempfile.aiquickdraw.com:8443/a.png",
      "//tempfile.aiquickdraw.com/a.png",
      "not a url",
      "",
    ]) {
      expect(allowedResultUrl(u), u).toBeNull();
    }
  });

  it("rejects IP literals", () => {
    for (const u of ["https://127.0.0.1/a.png", "https://[::1]/a.png", "https://169.254.169.254/latest", "https://2130706433/a.png", "https://0x7f.1/a.png"]) {
      expect(allowedResultUrl(u), u).toBeNull();
    }
  });

  it("userinfo tricks parse to the real host and are rejected", () => {
    const tricky = "https://evil.com@tempfile.aiquickdraw.com/a.png";
    expect(new URL(tricky).hostname).toBe("tempfile.aiquickdraw.com"); // the real host is the allowed one...
    expect(allowedResultUrl(tricky)).toBeNull(); // ...but credentials are never accepted
    expect(allowedResultUrl("https://tempfile.aiquickdraw.com@evil.com/a.png")).toBeNull();
    expect(allowedResultUrl("https://tempfile.aiquickdraw.com:pw@tempfile.aiquickdraw.com/a.png")).toBeNull();
    expect(allowedResultUrl("https://tempfile.aiquickdraw.com\@evil.com/a.png")).toBeNull();
  });
});

const FP = "a".repeat(64);
const BASE = "http://studio.test";
const FILE = "https://tempfile.aiquickdraw.com/r/one.png";

async function load(mode: "cloud" | "local" = "cloud") {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_STUDIO_MODE", mode);
  vi.stubEnv("CLOUD_OWNER_SECRET", "s1");
  const db = await import("@/lib/cloud/server/db");
  db.setCloudDb(createClient({ url: ":memory:" }));
  return (await import("@/app/api/cloud/file/route")).GET;
}
const get = (GET: Awaited<ReturnType<typeof load>>, url: string, headers: Record<string, string> = { "x-studio-owner": FP }) =>
  GET(new Request(`${BASE}/api/cloud/file?url=${encodeURIComponent(url)}`, { headers }));

afterEach(async () => {
  (await import("@/lib/cloud/server/db")).setCloudDb(null);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/cloud/file", () => {
  it("404 in local mode; 400 without owner header", async () => {
    expect((await get(await load("local"), FILE)).status).toBe(404);
    expect((await get(await load(), FILE, {})).status).toBe(400);
  });

  it("refuses disallowed URLs without fetching", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    const GET = await load();
    for (const u of ["https://evil.com/a.png", "http://tempfile.aiquickdraw.com/a.png", "https://evil.com@tempfile.aiquickdraw.com/a.png", "https://127.0.0.1/a"]) {
      expect((await get(GET, u)).status, u).toBe(422);
    }
    expect((await GET(new Request(`${BASE}/api/cloud/file`, { headers: { "x-studio-owner": FP } }))).status).toBe(422);
    expect(f).not.toHaveBeenCalled();
  });

  it("streams an allowed file, key-less, as a download", async () => {
    const f = vi.fn(async (_u: URL | string, init?: RequestInit) => {
      expect(init?.redirect).toBe("manual");
      expect(new Headers(init?.headers).has("authorization")).toBe(false);
      return new Response("png-bytes", { headers: { "content-length": "9" } });
    });
    vi.stubGlobal("fetch", f);
    const res = await get(await load(), FILE);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("png-bytes");
    expect(res.headers.get("content-disposition")).toBe("attachment");
    expect(res.headers.get("content-type")).toBe("application/octet-stream");
    expect(res.headers.get("content-security-policy")).toBe("sandbox");
  });

  it("follows a redirect only to an allowed host", async () => {
    const f = vi.fn(async (u: URL | string) =>
      String(u).includes("tempfile.aiquickdraw.com")
        ? new Response(null, { status: 302, headers: { location: "https://file.aiquickdraw.com/x.png" } })
        : new Response("ok"),
    );
    vi.stubGlobal("fetch", f);
    const res = await get(await load(), FILE);
    expect(await res.text()).toBe("ok");
    vi.stubGlobal("fetch", async () => new Response(null, { status: 302, headers: { location: "https://evil.com/x.png" } }));
    expect((await get(await load(), FILE)).status).toBe(502);
    vi.stubGlobal("fetch", async () => new Response(null, { status: 302, headers: { location: "http://file.aiquickdraw.com/x.png" } }));
    expect((await get(await load(), FILE)).status).toBe(502);
  });

  it("refuses files over 500 MB (declared and streamed)", async () => {
    vi.stubGlobal("fetch", async () => new Response("x", { headers: { "content-length": String(501 * 1024 * 1024) } }));
    expect((await get(await load(), FILE)).status).toBe(413);

    const chunk = new Uint8Array(64 * 1024 * 1024);
    let n = 0;
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          new ReadableStream({
            pull(c) {
              if (n++ < 9) c.enqueue(chunk);
              else c.close();
            },
          }),
        ),
    );
    const res = await get(await load(), FILE);
    await expect(res.arrayBuffer()).rejects.toThrow();
  });

  it("upstream 404 -> 404", async () => {
    vi.stubGlobal("fetch", async () => new Response("gone", { status: 404 }));
    expect((await get(await load(), FILE)).status).toBe(404);
  });
});
