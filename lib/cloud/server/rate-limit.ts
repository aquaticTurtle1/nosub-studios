import "server-only";
import { readyDb } from "./db";

/** Fixed-window counter. Returns false when the limit is exceeded. */
export async function hit(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  const c = await readyDb();
  const now = Date.now();
  const r = await c.execute({
    sql: `INSERT INTO rate (bucket, count, window_start) VALUES (?, 1, ?)
          ON CONFLICT(bucket) DO UPDATE SET
            count = CASE WHEN ? - window_start >= ? THEN 1 ELSE count + 1 END,
            window_start = CASE WHEN ? - window_start >= ? THEN ? ELSE window_start END
          RETURNING count`,
    args: [bucket, now, now, windowMs, now, windowMs, now],
  });
  return Number(r.rows[0].count) <= limit;
}

/** Drop rate rows whose window started more than a day ago. */
export async function pruneRate(now: number): Promise<void> {
  const c = await readyDb();
  await c.execute({ sql: "DELETE FROM rate WHERE window_start < ?", args: [now - 24 * 60 * 60 * 1000] });
}
