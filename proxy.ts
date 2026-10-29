import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/cloud/security-headers";

/**
 * Cloud mode, production only: a fresh CSP nonce per page request (Next reads it from the request's CSP header and
 * puts it on its scripts). Local mode and dev get no CSP and pass straight through.
 */
const CLOUD_PROD = process.env.NEXT_PUBLIC_STUDIO_MODE === "cloud" && process.env.NODE_ENV === "production";

export function proxy(request: NextRequest) {
  if (!CLOUD_PROD) return NextResponse.next();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
