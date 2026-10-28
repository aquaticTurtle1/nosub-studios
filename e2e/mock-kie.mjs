// Stand-in for the Kie.ai API during e2e tests: nothing leaves the machine, no credits.
// Records uploads and createTask bodies; GET /__calls returns them, POST /__reset clears.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const port = Number(process.env.MOCK_KIE_PORT || 3199);
let calls = [];
// Tasks that finish → their result file. Z-Image always finishes (image by aspect ratio);
// a video task finishes when its prompt contains "#finish". Everything else stays "generating".
const finishes = new Map();
const FIXTURES = path.join(import.meta.dirname, "fixtures");
const IMAGE_BY_ASPECT = { "16:9": "img-1600x900.png", "9:16": "img-900x1600.png" };
const VIDEO_BY_ASPECT = { "16:9": "clip-16x9.mp4", "9:16": "clip-9x16.mp4" };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const send = (o) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(o));
      };
      if (url.pathname === "/__calls") return send(calls);
      if (url.pathname === "/__reset") {
        calls = [];
        return send({ ok: true });
      }
      if (url.pathname === "/api/v1/chat/credit") return send({ code: 200, msg: "success", data: 1000 });
      if (url.pathname === "/api/file-stream-upload") {
        const n = calls.filter((c) => c.type === "upload").length + 1;
        calls.push({ type: "upload", bytes: body.length });
        // Slow enough for the "Uploading references…" card to be seen.
        return setTimeout(() => send({
          code: 200,
          msg: "success",
          data: { fileName: `f${n}`, filePath: `p/f${n}`, downloadUrl: `https://mock-kie.test/upload/${n}`, fileSize: body.length, mimeType: "x", uploadedAt: new Date().toISOString() },
        }), 1200);
      }
      if (url.pathname === "/api/v1/jobs/createTask") {
        const parsed = JSON.parse(body.toString() || "{}");
        calls.push({ type: "createTask", body: parsed });
        const taskId = `mock_${calls.length}`;
        const input = parsed.input ?? {};
        if (String(parsed.model).startsWith("z-image")) finishes.set(taskId, IMAGE_BY_ASPECT[input.aspect_ratio] ?? "img-1200x1200.png");
        else if (String(input.prompt ?? "").includes("#finish")) {
          const video = /video/.test(String(parsed.model));
          finishes.set(taskId, video ? (VIDEO_BY_ASPECT[input.aspect_ratio] ?? "clip-16x9.mp4") : (IMAGE_BY_ASPECT[input.aspect_ratio] ?? "img-1200x1200.png"));
        }
        return send({ code: 200, msg: "success", data: { taskId } });
      }
      if (url.pathname === "/api/v1/jobs/recordInfo") {
        const taskId = url.searchParams.get("taskId");
        if (finishes.has(taskId)) {
          const resultJson = JSON.stringify({ resultUrls: [`http://127.0.0.1:${port}/files/${finishes.get(taskId)}`] });
          return send({ code: 200, msg: "success", data: { taskId, state: "success", resultJson, creditsConsumed: 0.8 } });
        }
        return send({ code: 200, msg: "success", data: { taskId, state: "generating", resultJson: "", creditsConsumed: null } });
      }
      if (url.pathname === "/files/out.png") {
        res.setHeader("Content-Type", "image/png");
        return res.end(PNG);
      }
      const fixture = url.pathname.match(/^\/files\/([\w.-]+\.(png|mp4))$/);
      if (fixture && fs.existsSync(path.join(FIXTURES, fixture[1]))) {
        res.setHeader("Content-Type", fixture[2] === "png" ? "image/png" : "video/mp4");
        return res.end(fs.readFileSync(path.join(FIXTURES, fixture[1])));
      }
      res.statusCode = 404;
      send({ code: 404, msg: "not mocked" });
    });
  })
  .listen(port, "127.0.0.1", () => console.log(`mock kie on ${port}`));
