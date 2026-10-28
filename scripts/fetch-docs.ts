/**
 * Refreshes docs-cache/ from docs.kie.ai (llms.txt index) and snapshots the
 * public pricing list. Run: pnpm catalog:fetch, then pnpm catalog:build.
 *
 * Only media-generation pages are kept. LLM/chat/agent pages are excluded on
 * purpose (see the scope rules in README).
 */
import fs from "node:fs";
import path from "node:path";

const DOCS = "https://docs.kie.ai";
const OUT = path.join(process.cwd(), "docs-cache");

// Text/LLM models and agent docs — never part of this app.
const EXCLUDE = [
  /\/cn(\/|\.md)/,
  /callbacks?\.md$/i,
  /callback\.md$/i,
  /\/ai-agent\//,
  /\/market\/chat\//,
  /\/market\/claude\//,
  /\/market\/codex\//,
  /\/market\/gemini\/gemini-/, // Gemini text models (TTS + Omni media live elsewhere)
  /\/market\/grok\/grok-\d/, // Grok text models
  /\/market\/kimi\//,
  /\/market\/deepseek/,
  /\/old-model\//,
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const index = await (await fetch(`${DOCS}/llms.txt`)).text();
  fs.writeFileSync(path.join(OUT, "llms.txt"), index);
  const urls = [...new Set(index.match(/https:\/\/docs\.kie\.ai\/[^)\s]+\.md/g) ?? [])].filter(
    (u) => !EXCLUDE.some((re) => re.test(u)),
  );
  console.log(`Fetching ${urls.length} pages…`);
  let done = 0;
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 12 }, async () => {
      while (queue.length) {
        const u = queue.shift()!;
        const name = u.replace(`${DOCS}/`, "").replace(/\//g, "__");
        const res = await fetch(u);
        if (!res.ok) {
          console.warn(`  ! ${res.status} ${u}`);
          continue;
        }
        fs.writeFileSync(path.join(OUT, name), await res.text());
        done++;
      }
    }),
  );
  console.log(`Saved ${done} pages to docs-cache/`);

  // Public pricing list used by kie.ai/pricing (unauthenticated, undocumented —
  // a snapshot for display only, never used to decide billing).
  const rows: unknown[] = [];
  for (let page = 1; page < 50; page++) {
    const res = await fetch("https://api.kie.ai/client/v1/model-pricing/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageNum: page, pageSize: 100, modelDescription: "", interfaceType: "" }),
    });
    const body = (await res.json()) as { code: number; data?: { records: unknown[]; pages: number } };
    if (body.code !== 200 || !body.data) {
      console.warn("Pricing fetch failed:", body);
      break;
    }
    rows.push(...body.data.records);
    if (page >= body.data.pages) break;
  }
  const media = rows.filter((r) => (r as { interfaceType?: string }).interfaceType !== "chat");
  fs.writeFileSync(
    path.join(OUT, "pricing.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), rows: media }, null, 1),
  );
  console.log(`Saved ${media.length} media pricing rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
