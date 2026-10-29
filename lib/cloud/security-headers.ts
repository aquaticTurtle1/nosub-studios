/**
 * Page security headers for cloud mode (production only). No Next imports, so they are unit-testable.
 * The Kie.ai key lives in the browser, so the page must not be framed, must not load foreign scripts and may
 * talk only to Studio and to Kie.ai hosts (connect-src is the barrier that keeps the key from being sent elsewhere).
 *
 * script-src uses 'unsafe-inline' rather than a per-request nonce on purpose: with cacheComponents the app shell
 * is prerendered, and Next cannot put a nonce on the inline scripts of a prerendered shell (Next docs, "Content
 * Security Policy": nonces need dynamic rendering and are incompatible with PPR). A nonce in the policy would make
 * browsers block those scripts and the app would never hydrate (verified with a production build). 'unsafe-eval'
 * stays off, and foreign script origins, objects, framing and base-uri changes stay blocked.
 */

/** Hosts Kie.ai serves results and uploads from (see the catalog docs and Explore examples). */
const RESULT_HOSTS = [
  "https://tempfile.aiquickdraw.com",
  "https://file.aiquickdraw.com",
  "https://static.aiquickdraw.com",
  "https://tempfile.redpandaai.co",
];
const API_HOSTS = ["https://api.kie.ai", "https://kieai.redpandaai.co", "https://tempfile.aiquickdraw.com"];

function origin(url: string | undefined): string[] {
  try {
    return url ? [new URL(url).origin] : [];
  } catch {
    return [];
  }
}

/** The CSP. A custom API base (staging, tests) is added to connect-src. */
export function contentSecurityPolicy(env: Record<string, string | undefined> = process.env): string {
  const connectExtra = [...origin(env.NEXT_PUBLIC_KIE_API_BASE_URL), ...origin(env.NEXT_PUBLIC_KIE_UPLOAD_BASE_URL)];
  const connect = [...new Set([...API_HOSTS, ...RESULT_HOSTS, ...connectExtra])];
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${connect.join(" ")}`,
    `img-src 'self' blob: data: ${RESULT_HOSTS.join(" ")}`,
    `media-src 'self' blob: ${RESULT_HOSTS.join(" ")}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/** All cloud-mode page headers. */
export const securityHeaders = (env: Record<string, string | undefined> = process.env): { key: string; value: string }[] => [
  { key: "Content-Security-Policy", value: contentSecurityPolicy(env) },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
