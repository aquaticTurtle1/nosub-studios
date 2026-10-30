import { gate } from "@/lib/cloud/server/api";
import { allowedResultUrl } from "@/lib/cloud/security-headers";

/** Largest file the proxy will relay. */
export const MAX_FILE_BYTES = 500 * 1024 * 1024;
const MAX_HOPS = 3;

const refuse = (status: number, error: string) =>
  Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Fallback for the cloud ZIP when a browser cannot fetch a result file itself (CORS/network).
 * Takes ONLY a URL: no Kie.ai key ever reaches this server. Streams from the Kie result hosts, https only;
 * a redirect is followed only if it stays on an allowed host. Same gate as the other cloud routes.
 */
export async function GET(req: Request) {
  const g = await gate(req); // cloudOnly + rate limit + owner header
  if (g instanceof Response) return g;

  let target = allowedResultUrl(new URL(req.url).searchParams.get("url") ?? "");
  if (!target) return refuse(422, "URL not allowed");

  let upstream: Response | null = null;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    try {
      upstream = await fetch(target, { redirect: "manual", cache: "no-store", signal: req.signal });
    } catch {
      return refuse(502, "Could not reach the file host");
    }
    if (upstream.status < 300 || upstream.status >= 400) break;
    const next = allowedResultUrl(new URL(upstream.headers.get("location") ?? "", target).href);
    await upstream.body?.cancel();
    if (!next) return refuse(502, "Redirect not allowed");
    target = next;
    upstream = null;
  }
  if (!upstream) return refuse(502, "Too many redirects");
  if (!upstream.ok || !upstream.body) {
    await upstream.body?.cancel();
    return refuse(upstream.status === 404 ? 404 : 502, "File not available");
  }
  const len = Number(upstream.headers.get("content-length"));
  if (Number.isFinite(len) && len > MAX_FILE_BYTES) {
    await upstream.body.cancel();
    return refuse(413, "File too large");
  }

  let sent = 0;
  const capped = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        sent += chunk.byteLength;
        if (sent > MAX_FILE_BYTES) controller.error(new Error("File too large"));
        else controller.enqueue(chunk);
      },
    }),
  );
  return new Response(capped, {
    headers: {
      // Never let proxied bytes render as a page on Studio's origin.
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
      "Cache-Control": "no-store",
      ...(Number.isFinite(len) && len > 0 ? { "Content-Length": String(len) } : {}),
    },
  });
}
