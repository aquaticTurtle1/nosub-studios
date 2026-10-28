import "server-only";
import { cookies } from "next/headers";

export const KEY_COOKIE = "kie_api_key";

export type KeySource = "env" | "cookie" | null;

/** KIE_API_KEY from .env.local wins over the cookie. */
export async function resolveApiKey(): Promise<{ key: string | null; source: KeySource }> {
  const env = process.env.KIE_API_KEY?.trim();
  if (env) return { key: env, source: "env" };
  const jar = await cookies();
  const c = jar.get(KEY_COOKIE)?.value?.trim();
  return c ? { key: c, source: "cookie" } : { key: null, source: null };
}

export async function setKeyCookie(key: string) {
  const jar = await cookies();
  jar.set(KEY_COOKIE, key, {
    httpOnly: true,
    sameSite: "strict",
    // Local single-user app served over http://localhost.
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearKeyCookie() {
  const jar = await cookies();
  jar.delete(KEY_COOKIE);
}
