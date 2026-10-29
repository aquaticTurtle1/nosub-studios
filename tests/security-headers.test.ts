import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "@/lib/cloud/security-headers";

describe("cloud security headers", () => {
  it("locks framing, objects and foreign scripts; no eval", () => {
    const csp = contentSecurityPolicy("N0nce", {});
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-N0nce' 'strict-dynamic';");
    expect(csp.split("; ").find((d) => d.startsWith("script-src "))).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("default-src 'self'");
  });

  it("lets the page talk only to Studio and Kie.ai hosts", () => {
    const connect = contentSecurityPolicy("N0nce", {}).split("; ").find((d) => d.startsWith("connect-src "))!;
    expect(connect).toBe(
      "connect-src 'self' https://api.kie.ai https://kieai.redpandaai.co https://tempfile.aiquickdraw.com https://file.aiquickdraw.com https://static.aiquickdraw.com https://tempfile.redpandaai.co",
    );
  });

  it("adds a custom Kie base (staging) to connect-src, ignores junk", () => {
    const csp = contentSecurityPolicy("N0nce", { NEXT_PUBLIC_KIE_API_BASE_URL: "http://127.0.0.1:3199/api", NEXT_PUBLIC_KIE_UPLOAD_BASE_URL: "not a url" });
    expect(csp).toContain("http://127.0.0.1:3199");
    expect(csp).not.toContain("not a url");
  });

  it("sends the transport and privacy headers", () => {
    const h = Object.fromEntries(securityHeaders().map((x) => [x.key, x.value]));
    expect(h["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
    expect(h["Content-Security-Policy"]).toBeUndefined();
  });
});
