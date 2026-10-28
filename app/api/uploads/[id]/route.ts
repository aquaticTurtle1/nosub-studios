import fs from "node:fs";
import { Readable } from "node:stream";
import { getUpload } from "@/lib/server/uploads";

/** Serves a saved reference file (with Range support so video/audio can seek). */
export async function GET(req: Request, ctx: RouteContext<"/api/uploads/[id]">) {
  const { id } = await ctx.params;
  const u = getUpload(id);
  if (!u) return new Response("Not found", { status: 404 });
  const size = fs.statSync(u.path).size;
  const headers: Record<string, string> = {
    "Content-Type": u.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=31536000, immutable",
  };
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = Readable.toWeb(fs.createReadStream(u.path, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  const stream = Readable.toWeb(fs.createReadStream(u.path)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
