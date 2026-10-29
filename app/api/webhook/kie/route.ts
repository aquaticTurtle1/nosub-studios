import { localOnly } from "@/lib/server/mode-guard";
import { verifyWebhook } from "@/lib/kie/webhook";
import { findByKieTaskId, markWebhook, pollTask } from "@/lib/server/tasks";

/**
 * Optional callback receiver, active only with KIE_WEBHOOK_ENABLED=1 and a public
 * tunnel URL (KIE_PUBLIC_URL). The signature covers taskId + timestamp, not the
 * body, so the body is never trusted: we just poll recordInfo right away.
 */
export async function POST(req: Request) {
  const off = localOnly();
  if (off) return off;
  if (process.env.KIE_WEBHOOK_ENABLED !== "1") return new Response("webhooks disabled", { status: 404 });
  const body = (await req.json().catch(() => null)) as { data?: { taskId?: string; task_id?: string } } | null;
  const taskId = body?.data?.taskId ?? body?.data?.task_id;
  const check = verifyWebhook({
    taskId,
    timestamp: req.headers.get("x-webhook-timestamp"),
    signature: req.headers.get("x-webhook-signature"),
    hmacKey: process.env.KIE_WEBHOOK_HMAC_KEY ?? "",
  });
  if (!check.ok) return Response.json({ error: check.reason }, { status: 401 });

  const task = findByKieTaskId(taskId!);
  if (!task) return Response.json({ ok: true, known: false });
  markWebhook(task);
  // With a cookie-only key the server cannot poll by itself; the UI's next poll picks it up.
  const envKey = process.env.KIE_API_KEY?.trim() || null;
  if (envKey) await pollTask(task.id, envKey, { force: true });
  return Response.json({ ok: true });
}
