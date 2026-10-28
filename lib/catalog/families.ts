/**
 * Model families: how the picker groups catalog entries ("PixVerse V6" instead of
 * five separate PixVerse endpoints). Edit freely — this file is only UI grouping:
 *
 * - `members`: catalog keys (see lib/catalog/generated/catalog.json). A key missing
 *   from every family still appears as its own row, so the catalog stays complete.
 * - `featured`: shown in the picker's "Featured" section (your pick list).
 * - `badge`: optional "New" or "Top" label. "Unverified" is added automatically.
 *
 * Routing picks the concrete model from what is attached (see `resolveMember`).
 */
import { TOOLS } from "./tools";
import type { CatalogSummary, Category } from "./types";
import type { RefKind } from "./meta";

export interface FamilyDef {
  id: string;
  name: string;
  category: Category;
  members: string[];
  featured?: boolean;
  badge?: "New" | "Top";
}

export const FAMILIES: FamilyDef[] = [
  // Video
  { id: "pixverse-v6", name: "PixVerse V6", category: "video", featured: true, members: ["pixverse/text-to-video", "pixverse/image-to-video", "pixverse/reference-to-video", "pixverse/transition", "pixverse/extend"] },
  { id: "pixverse-v6-max", name: "PixVerse V6 Max", category: "video", members: ["pixverse/v6-max-text-to-video", "pixverse/v6-max-image-to-video"] },
  { id: "seedance-2-5", name: "Seedance 2.5", category: "video", featured: true, members: ["bytedance/seedance-2-5"] },
  { id: "seedance-2-5-draft", name: "Seedance 2.5 Draft", category: "video", members: ["bytedance/seedance-2-5-draft"] },
  { id: "seedance-2", name: "Seedance 2.0", category: "video", featured: true, members: ["bytedance/seedance-2"] },
  { id: "seedance-2-fast", name: "Seedance 2.0 Fast", category: "video", members: ["bytedance/seedance-2-fast"] },
  { id: "seedance-2-mini", name: "Seedance 2.0 Mini", category: "video", members: ["bytedance/seedance-2-mini"] },
  { id: "seedance-1-pro", name: "Seedance 1.0 Pro", category: "video", members: ["bytedance/v1-pro-text-to-video", "bytedance/v1-pro-image-to-video"] },
  { id: "seedance-1-pro-fast", name: "Seedance 1.0 Pro Fast", category: "video", members: ["bytedance/v1-pro-fast-image-to-video"] },
  { id: "seedance-1-lite", name: "Seedance 1.0 Lite", category: "video", members: ["bytedance/v1-lite-text-to-video", "bytedance/v1-lite-image-to-video"] },
  { id: "veo-3-1", name: "Veo 3.1", category: "video", featured: true, members: ["veo3-api/generate-veo-3-video", "veo3-api/extend-video"] },
  { id: "kling-3-0", name: "Kling 3.0", category: "video", featured: true, members: ["kling/kling-3-0"] },
  { id: "kling-3-0-omni", name: "Kling 3.0 Omni", category: "video", members: ["kling/v3-omni-text-to-video", "kling/v3-omni-image-to-video", "kling/v3-omni-reference-to-video", "kling/v3-omni-transformation"] },
  { id: "kling-3-0-turbo", name: "Kling 3.0 Turbo", category: "video", members: ["kling/v3-turbo-text-to-video", "kling/v3-turbo-image-to-video"] },
  { id: "kling-3-0-motion", name: "Kling 3.0 Motion Control", category: "video", members: ["kling/motion-control-v3"] },
  { id: "kling-4-0-reference", name: "Kling 4.0 Reference", category: "video", members: ["kling/v4-reference-to-video"] },
  { id: "kling-4-0-keyframes", name: "Kling 4.0 Keyframes", category: "video", members: ["kling/v4-keyframe-to-video"] },
  { id: "kling-2-6", name: "Kling 2.6", category: "video", members: ["kling/text-to-video", "kling/image-to-video"] },
  { id: "kling-2-6-motion", name: "Kling 2.6 Motion Control", category: "video", members: ["kling/motion-control"] },
  { id: "kling-2-5-turbo", name: "Kling 2.5 Turbo", category: "video", members: ["kling/v25-turbo-text-to-video-pro", "kling/v25-turbo-image-to-video-pro"] },
  { id: "kling-2-1-master", name: "Kling 2.1 Master", category: "video", members: ["kling/v2-1-master-text-to-video", "kling/v2-1-master-image-to-video"] },
  { id: "kling-2-1-pro", name: "Kling 2.1 Pro", category: "video", members: ["kling/v2-1-pro"] },
  { id: "kling-2-1-standard", name: "Kling 2.1 Standard", category: "video", members: ["kling/v2-1-standard"] },
  { id: "kling-avatar-pro", name: "Kling Avatar Pro", category: "video", members: ["kling/ai-avatar-pro"] },
  { id: "kling-avatar-standard", name: "Kling Avatar Standard", category: "video", members: ["kling/ai-avatar-standard"] },
  { id: "hailuo-2-3-pro", name: "Hailuo 2.3 Pro", category: "video", featured: true, members: ["hailuo/2-3-image-to-video-pro"] },
  { id: "hailuo-2-3-standard", name: "Hailuo 2.3 Standard", category: "video", members: ["hailuo/2-3-image-to-video-standard"] },
  { id: "hailuo-02-pro", name: "Hailuo 02 Pro", category: "video", members: ["hailuo/02-text-to-video-pro", "hailuo/02-image-to-video-pro"] },
  { id: "hailuo-02-standard", name: "Hailuo 02 Standard", category: "video", members: ["hailuo/02-text-to-video-standard", "hailuo/02-image-to-video-standard"] },
  { id: "minimax-h3", name: "MiniMax H3", category: "video", members: ["minimax-h3/text-to-video", "minimax-h3/image-to-video", "minimax-h3/reference-to-video"] },
  { id: "wan-3-0", name: "Wan 3.0", category: "video", members: ["wan/3-0-video"] },
  { id: "wan-3-0-prime", name: "Wan 3.0 Prime", category: "video", members: ["wan/3-0-video-prime"] },
  { id: "wan-2-7", name: "Wan 2.7", category: "video", featured: true, members: ["wan/2-7-text-to-video", "wan/2-7-image-to-video", "wan/2-7-r2v", "wan/2-7-videoedit"] },
  { id: "wan-2-6", name: "Wan 2.6", category: "video", members: ["wan/2-6-text-to-video", "wan/2-6-image-to-video", "wan/2-6-video-to-video"] },
  { id: "wan-2-6-flash", name: "Wan 2.6 Flash", category: "video", members: ["wan/2-6-flash-image-to-video", "wan/2-6-flash-video-to-video"] },
  { id: "wan-2-5", name: "Wan 2.5", category: "video", members: ["wan/2-5-text-to-video", "wan/2-5-image-to-video"] },
  { id: "wan-2-2-turbo", name: "Wan 2.2 Turbo", category: "video", members: ["wan/2-2-a14b-text-to-video-turbo", "wan/2-2-a14b-image-to-video-turbo"] },
  { id: "wan-2-2-speech", name: "Wan 2.2 Speech to Video", category: "video", members: ["wan/2-2-a14b-speech-to-video-turbo"] },
  { id: "wan-animate-move", name: "Wan Animate Move", category: "video", members: ["wan/2-2-animate-move"] },
  { id: "wan-animate-replace", name: "Wan Animate Replace", category: "video", members: ["wan/2-2-animate-replace"] },
  { id: "grok-imagine", name: "Grok Imagine", category: "video", members: ["grok-imagine/text-to-video", "grok-imagine/image-to-video", "grok-imagine/extend"] },
  { id: "grok-imagine-1-5", name: "Grok Imagine 1.5 Preview", category: "video", members: ["grok-imagine/1-5-preview"] },
  { id: "runway", name: "Runway", category: "video", members: ["runway-api/generate-ai-video", "runway-api/generate-aleph-video", "runway-api/extend-ai-video"] },
  { id: "happyhorse-1-1", name: "HappyHorse 1.1", category: "video", members: ["happyhorse-1-1/text-to-video", "happyhorse-1-1/image-to-video", "happyhorse-1-1/reference-to-video"] },
  { id: "happyhorse", name: "HappyHorse 1.0", category: "video", members: ["happyhorse/text-to-video", "happyhorse/image-to-video", "happyhorse/reference-to-video", "happyhorse/video-edit"] },
  { id: "vidu-q4", name: "Vidu Q4", category: "video", members: ["vidu-q4/image-to-video", "vidu-q4/reference-to-video"] },
  { id: "gemini-omni-video", name: "Gemini Omni Video", category: "video", members: ["gemini-omni-video"] },
  { id: "gemini-omni-flash", name: "Gemini Omni 1.1 Flash", category: "video", members: ["google/gemini-omni-flash-1-1"] },
  { id: "omnihuman-2-0", name: "OmniHuman 2.0", category: "video", members: ["omnihuman-2-0"] },
  { id: "omnihuman-1-5", name: "OmniHuman 1.5", category: "video", members: ["omnihuman-1-5"] },
  { id: "infinitalk", name: "InfiniteTalk", category: "video", members: ["infinitalk/from-audio"] },
  { id: "volcengine-lipsync", name: "Volcengine Lip Sync", category: "video", members: ["volcengine/video-to-video-lip-sync"] },

  // Image: text-to-image + edit pairs; attaching an image routes to the edit entry.
  { id: "nano-banana-2", name: "Nano Banana 2", category: "image", featured: true, members: ["google/nanobanana2"] },
  { id: "nano-banana-pro", name: "Nano Banana Pro", category: "image", featured: true, members: ["google/pro-image-to-image"] },
  { id: "nano-banana-2-1", name: "Nano Banana 2.1", category: "image", members: ["google/nanobanana-2-1"] },
  { id: "nano-banana-2-lite", name: "Nano Banana 2 Lite", category: "image", members: ["google/nano-banana-2-lite"] },
  { id: "nano-banana", name: "Nano Banana", category: "image", members: ["google/nano-banana", "google/nano-banana-edit"] },
  { id: "gpt-image-2", name: "GPT Image 2", category: "image", featured: true, members: ["gpt/gpt-image-2-text-to-image", "gpt/gpt-image-2-image-to-image"] },
  { id: "gpt-image-2-5-flare", name: "GPT Image 2.5 Flare", category: "image", members: ["gpt/gpt-image-2-5-flare-text-to-image", "gpt/gpt-image-2-5-flare-image-to-image"] },
  { id: "gpt-image-2-5-sunburst", name: "GPT Image 2.5 Sunburst", category: "image", members: ["gpt/gpt-image-2-5-sunburst-text-to-image", "gpt/gpt-image-2-5-sunburst-image-to-image"] },
  { id: "gpt-image-1-5", name: "GPT Image 1.5", category: "image", members: ["gpt-image/1-5-text-to-image", "gpt-image/1-5-image-to-image"] },
  { id: "seedream-5-pro", name: "Seedream 5.0 Pro", category: "image", featured: true, members: ["seedream/5-pro-text-to-image", "seedream/5-pro-image-to-image"] },
  { id: "seedream-5-flash", name: "Seedream 5.0 Flash", category: "image", members: ["seedream/5-flash-text-to-image", "seedream/5-flash-image-to-image"] },
  { id: "seedream-5-lite", name: "Seedream 5.0 Lite", category: "image", members: ["seedream/5-lite-text-to-image", "seedream-5-lite-image-to-image"] },
  { id: "seedream-4-5", name: "Seedream 4.5", category: "image", members: ["seedream/4-5-text-to-image", "seedream/4-5-edit"] },
  { id: "seedream-4", name: "Seedream 4.0", category: "image", members: ["seedream/seedream-v4-text-to-image", "seedream/seedream-v4-edit"] },
  { id: "seedream-3", name: "Seedream 3.0", category: "image", members: ["seedream/seedream"] },
  { id: "flux-3-klein", name: "FLUX 3 Klein", category: "image", featured: true, members: ["flux3/klein-text-to-image", "flux3/klein-edit-image"] },
  { id: "flux-2-pro", name: "Flux 2 Pro", category: "image", members: ["flux2/pro-text-to-image", "flux2/pro-image-to-image"] },
  { id: "flux-2-flex", name: "Flux 2 Flex", category: "image", members: ["flux2/flex-text-to-image", "flux2/flex-image-to-image"] },
  { id: "flux-kontext", name: "Flux Kontext", category: "image", members: ["flux-kontext-api/generate-or-edit-image"] },
  { id: "grok-imagine-image-2", name: "Grok Imagine Image 2.0", category: "image", members: ["grok-imagine-image-2-0/text-to-image", "grok-imagine-image-2-0/image-to-image"] },
  { id: "grok-imagine-image", name: "Grok Imagine Image", category: "image", members: ["grok-imagine/text-to-image", "grok-imagine/image-to-image"] },
  { id: "qwen3-pro", name: "Qwen3 Pro", category: "image", members: ["qwen3-pro/text-to-image", "qwen3-pro/image-to-image"] },
  { id: "qwen3", name: "Qwen3", category: "image", members: ["qwen3/text-to-image", "qwen3/image-to-image"] },
  { id: "qwen2-1", name: "Qwen 2.1", category: "image", members: ["qwen2-1/text-to-image", "qwen2-1/image-to-image"] },
  { id: "qwen2", name: "Qwen2", category: "image", members: ["qwen2/text-to-image", "qwen2/image-edit"] },
  { id: "qwen", name: "Qwen", category: "image", members: ["qwen/text-to-image", "qwen/image-to-image", "qwen/image-edit"] },
  // V3 Edit (needs a mask) and the Character models stay separate entries.
  { id: "ideogram-v3", name: "Ideogram V3", category: "image", featured: true, members: ["ideogram/v3-text-to-image", "ideogram/v3-remix"] },
  { id: "imagen-4", name: "Imagen 4", category: "image", members: ["google/imagen4"] },
  { id: "imagen-4-fast", name: "Imagen 4 Fast", category: "image", members: ["google/imagen4-fast"] },
  { id: "imagen-4-ultra", name: "Imagen 4 Ultra", category: "image", members: ["google/imagen4-ultra"] },
  { id: "z-image", name: "Z-Image", category: "image", featured: true, members: ["z-image/z-image"] },
  { id: "wan-2-7-image", name: "Wan 2.7 Image", category: "image", members: ["wan/2-7-image"] },
  { id: "wan-2-7-image-pro", name: "Wan 2.7 Image Pro", category: "image", members: ["wan/2-7-image-pro"] },
  { id: "4o-image", name: "4o Image", category: "image", members: ["4o-image-api/generate-4-o-image"] },

  // Audio: each Suno operation is its own task (not chosen by what is attached), so one entry each.
  { id: "suno-music", name: "Suno Music", category: "audio", featured: true, members: ["suno-api/generate-music"] },
  { id: "suno-sounds", name: "Suno Sound Effects", category: "audio", featured: true, members: ["suno-api/generate-sounds"] },
  { id: "suno-upload-cover", name: "Suno Cover (upload)", category: "audio", members: ["suno-api/upload-and-cover-audio"] },
  { id: "suno-upload-extend", name: "Suno Extend (upload)", category: "audio", members: ["suno-api/upload-and-extend-audio"] },
  { id: "suno-add-vocals", name: "Suno Add Vocals", category: "audio", members: ["suno-api/add-vocals"] },
  { id: "suno-add-instrumental", name: "Suno Add Instrumental", category: "audio", members: ["suno-api/add-instrumental"] },
  { id: "suno-mashup", name: "Suno Mashup", category: "audio", members: ["suno-api/generate-mashup"] },
  { id: "suno-replace-section", name: "Suno Replace Section", category: "audio", members: ["suno-api/replace-section"] },
  { id: "suno-cover", name: "Suno Cover (earlier song)", category: "audio", members: ["suno-api/cover-suno"] },
  { id: "suno-extend", name: "Suno Extend (earlier song)", category: "audio", members: ["suno-api/extend-music"] },
  { id: "suno-music-video", name: "Suno Music Video", category: "audio", members: ["suno-api/create-music-video"] },
  { id: "suno-lyrics", name: "Suno Lyrics", category: "audio", members: ["suno-api/generate-lyrics"] },
  { id: "elevenlabs-multilingual-v2", name: "ElevenLabs Multilingual v2", category: "audio", featured: true, members: ["elevenlabs/text-to-speech-multilingual-v2"] },
  { id: "elevenlabs-turbo-2-5", name: "ElevenLabs Turbo 2.5", category: "audio", members: ["elevenlabs/text-to-speech-turbo-2-5"] },
  { id: "elevenlabs-dialogue-v3", name: "ElevenLabs Dialogue v3", category: "audio", members: ["elevenlabs/text-to-dialogue-v3"] },
  { id: "gemini-3-1-flash-tts", name: "Gemini 3.1 Flash TTS", category: "audio", featured: true, members: ["google/gemini-3-1-flash-tts"] },
  { id: "gemini-3-8-flash-tts", name: "Gemini 3.8 Flash TTS", category: "audio", members: ["google/gemini-3-8-flash-tts"] },
  { id: "gemini-3-8-flash-lite-tts", name: "Gemini 3.8 Flash Lite TTS", category: "audio", members: ["google/gemini-3-8-flash-lite-tts"] },
  { id: "gemini-2-5-pro-tts", name: "Gemini 2.5 Pro TTS", category: "audio", members: ["google/gemini-2-5-pro-tts"] },

  // Tools: each card on the Tools page is a family (see lib/catalog/tools.ts).
  ...TOOLS.map((t): FamilyDef => ({ id: t.id, name: t.name, category: "tools", members: t.members })),
];

export interface Family extends FamilyDef {
  /** Member summaries in `members` order (missing keys dropped). */
  entries: CatalogSummary[];
}

/** Families for a category; catalog entries not in any family become one-entry families. */
export function familiesFor(category: Category, summaries: CatalogSummary[]): Family[] {
  const inCat = summaries.filter((s) => s.category === category);
  const byKey = new Map(inCat.map((s) => [s.key, s]));
  const used = new Set<string>();
  const out: Family[] = [];
  for (const f of FAMILIES.filter((x) => x.category === category)) {
    const entries = f.members.map((k) => byKey.get(k)).filter((s): s is CatalogSummary => !!s);
    if (!entries.length) continue;
    entries.forEach((e) => used.add(e.key));
    out.push({ ...f, entries });
  }
  for (const s of inCat) {
    if (!used.has(s.key)) out.push({ id: `entry:${s.key}`, name: s.title.trim(), category, members: [s.key], entries: [s] });
  }
  return out;
}

export type AttachedCounts = Record<RefKind, number>;

const TEXT_OPS = ["text-to-video", "text-or-image-to-video", "text-to-image", "text-or-image-to-image"];
const IMAGE_OPS = ["image-to-video", "text-or-image-to-video", "reference-to-video", "keyframes", "image-to-image", "text-or-image-to-image", "edit", "talking-avatar", "motion-transfer"];
const VIDEO_OPS = ["video-to-video", "motion-transfer", "reference-to-video", "text-or-image-to-video", "extend", "lip-sync"];

const rank = (ops: string[], op: string) => {
  const i = ops.indexOf(op);
  return i === -1 ? ops.length : i;
};

/**
 * Picks the concrete catalog entry of a family for what is attached:
 * extend tab → the extend entry; a video → video-to-video / extend; images →
 * image-to-video (or reference-to-video when there are more images than it takes);
 * nothing → text-to-video. Returns null when no entry can take the attachment.
 */
/**
 * An extend entry sits behind the "Extend video" tab only when its family has other
 * entries; on its own (Suno Upload And Extend) it is an ordinary model.
 */
const behindTab = (f: Family, e: CatalogSummary) => e.operation === "extend" && f.entries.length > 1;

/** Entries attachments route between (everything except a tab-only extend entry). */
export const routable = (f: Family) => f.entries.filter((e) => !behindTab(f, e));

export function resolveMember(family: Family, counts: AttachedCounts, extend = false): CatalogSummary | null {
  const entries = family.entries;
  if (extend) return entries.find((e) => behindTab(family, e)) ?? null;
  const fits = (e: CatalogSummary) =>
    (Object.keys(counts) as RefKind[]).every((k) => counts[k] === 0 || e.meta.refCapacity[k] >= counts[k]);
  const pick = (ops: string[], need: RefKind) =>
    entries
      .filter((e) => e.meta.refKinds.includes(need) && (!behindTab(family, e) || need === "video"))
      .sort((a, b) => Number(fits(b)) - Number(fits(a)) || rank(ops, a.operation) - rank(ops, b.operation))[0] ?? null;

  if (counts.video > 0) return pick(VIDEO_OPS, "video");
  if (counts.image > 0) return pick(IMAGE_OPS, "image");
  if (counts.audio > 0) return pick(IMAGE_OPS, "audio");
  const text = entries
    .filter((e) => !e.meta.refsRequired && !behindTab(family, e))
    .sort((a, b) => rank(TEXT_OPS, a.operation) - rank(TEXT_OPS, b.operation))[0];
  return text ?? entries.find((e) => !behindTab(family, e)) ?? entries[0];
}

/** Media kinds any non-extend entry of the family accepts. */
export function familyKinds(family: Family): RefKind[] {
  const s = new Set<RefKind>();
  for (const e of routable(family)) e.meta.refKinds.forEach((k) => s.add(k));
  return (["image", "video", "audio"] as RefKind[]).filter((k) => s.has(k));
}

/** The family needs a reference for every non-extend entry. */
export const familyNeedsRef = (f: Family) => routable(f).every((e) => e.meta.refsRequired);

export const familyHasExtend = (f: Family) => f.entries.some((e) => behindTab(f, e));
