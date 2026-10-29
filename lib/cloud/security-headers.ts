/**
 * Page security headers for cloud mode (production only). No Next imports, so they are unit-testable.
 * The Kie.ai key lives in the browser, so the page must not be framed, must not load foreign scripts and may
 * talk only to Studio and to Kie.ai hosts (connect-src is the barrier that keeps the key from being sent elsewhere).
 *
 * script-src is strict: 'self' + a per-request nonce + 'strict-dynamic', no 'unsafe-inline', no eval. The nonce is
 * made in proxy.ts for every page request; Next puts it on its own scripts while rendering. That needs dynamic
 * rendering, so the cloud build runs with cacheComponents off (next.config.ts) and the root layout awaits connection().
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

/** The CSP for one request (fresh nonce). A custom API base (staging, tests) is added to connect-src. */
export function contentSecurityPolicy(nonce: string, env: Record<string, string | undefined> = process.env): string {
  const connectExtra = [...origin(env.NEXT_PUBLIC_KIE_API_BASE_URL), ...origin(env.NEXT_PUBLIC_KIE_UPLOAD_BASE_URL)];
  const connect = [...new Set([...API_HOSTS, ...RESULT_HOSTS, ...connectExtra])];
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
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

/** Cloud-mode page headers that do not depend on the request. The CSP is set per request in proxy.ts. */
export const securityHeaders = (): { key: string; value: string }[] => [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
