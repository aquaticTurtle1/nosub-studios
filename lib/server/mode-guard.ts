import { isCloud } from "@/lib/mode";

const notFound = () => new Response("Not found", { status: 404 });

/** Local-only routes answer 404 in cloud mode. Call first in every handler. */
export function localOnly(): Response | null {
  return isCloud() ? notFound() : null;
}

/** Cloud-only routes answer 404 in local mode. */
export function cloudOnly(): Response | null {
  return isCloud() ? null : notFound();
}
