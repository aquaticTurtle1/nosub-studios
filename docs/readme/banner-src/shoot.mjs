import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";
const dir = path.resolve(import.meta.dirname);
const b = await chromium.launch({ channel: "chrome" });
for (const [name, h, qs] of [["banner",400,""],["og",640,"?og=1"]]) {
  const p = await b.newPage({ viewport: { width: 1280, height: h } });
  await p.goto(pathToFileURL(path.join(dir,"banner.html")).href + qs);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(dir,"..",name+".png") });
}
await b.close();
