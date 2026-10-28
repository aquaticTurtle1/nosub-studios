/**
 * The Tools page: one card per job, each opening its own panel. A tool with several
 * catalog entries lets you pick the engine (Recraft or Topaz for upscaling). Every
 * `tools` catalog entry belongs to exactly one tool (checked in tests/tools.test.ts).
 * Names and blurbs are ours; edit freely.
 */
export type ToolSection = "Image" | "Video" | "Audio" | "Characters and voices";

export interface ToolDef {
  id: string;
  name: string;
  /** One line on the card: what you get. */
  blurb: string;
  section: ToolSection;
  /** lucide icon name used by the card. */
  icon: "image-up" | "eraser" | "layers" | "scan" | "video" | "film" | "mic-off" | "audio-lines" | "file-audio" | "music" | "text" | "sparkles" | "life-buoy" | "user" | "volume" | "users";
  members: string[];
  /** Engine names shown in the panel when there are several members. */
  engines?: Record<string, string>;
}

export const TOOLS: ToolDef[] = [
  {
    id: "upscale-image",
    name: "Upscale image",
    blurb: "A larger, sharper version of an image.",
    section: "Image",
    icon: "image-up",
    members: ["recraft/crisp-upscale", "topaz/image-upscale"],
    engines: { "recraft/crisp-upscale": "Recraft Crisp", "topaz/image-upscale": "Topaz" },
  },
  { id: "remove-background", name: "Remove background", blurb: "Cut the subject out onto a transparent background.", section: "Image", icon: "eraser", members: ["recraft/remove-background"] },
  {
    id: "split-layers",
    name: "Split into layers",
    blurb: "Separate an image into editable layers.",
    section: "Image",
    icon: "layers",
    members: ["seedream/5-flash-layer-decomposition", "seedream/5-pro-layer-decomposition"],
    engines: { "seedream/5-flash-layer-decomposition": "Seedream 5.0 Flash", "seedream/5-pro-layer-decomposition": "Seedream 5.0 Pro" },
  },
  {
    id: "segment-map",
    name: "Find regions",
    blurb: "Map the regions of a Grok Imagine 2.0 image for Segment Edit.",
    section: "Image",
    icon: "scan",
    members: ["grok-imagine-image-2-0/segment-map"],
  },
  { id: "upscale-video", name: "Upscale video", blurb: "A higher-resolution version of a video.", section: "Video", icon: "video", members: ["topaz/video-upscale"] },
  { id: "upscale-grok-video", name: "Upscale a Grok video", blurb: "Upscale a video you made with Grok Imagine.", section: "Video", icon: "video", members: ["grok-imagine/upscale"] },
  {
    id: "veo-hd",
    name: "Veo in HD",
    blurb: "Get the 1080p or 4K file of a Veo 3.1 video.",
    section: "Video",
    icon: "film",
    members: ["veo3-api/get-veo-3-1080-p-video", "veo3-api/get-veo-3-4k-video"],
    engines: { "veo3-api/get-veo-3-1080-p-video": "1080p", "veo3-api/get-veo-3-4k-video": "4K" },
  },
  { id: "isolate-voice", name: "Isolate voice", blurb: "Remove background noise from speech.", section: "Audio", icon: "mic-off", members: ["elevenlabs/audio-isolation"] },
  { id: "separate-stems", name: "Separate vocals", blurb: "Split a Suno song into vocals and instruments.", section: "Audio", icon: "audio-lines", members: ["suno-api/separate-vocals"] },
  { id: "convert-wav", name: "Convert to WAV", blurb: "A WAV file of a Suno song.", section: "Audio", icon: "file-audio", members: ["suno-api/convert-to-wav"] },
  { id: "midi", name: "MIDI from a song", blurb: "Turn a Suno song into MIDI notes.", section: "Audio", icon: "music", members: ["suno-api/generate-midi"] },
  { id: "timestamped-lyrics", name: "Timed lyrics", blurb: "Lyrics of a Suno song with timestamps.", section: "Audio", icon: "text", members: ["suno-api/get-timestamped-lyrics"] },
  { id: "boost-style", name: "Boost a music style", blurb: "Expand a short style into a richer description.", section: "Audio", icon: "sparkles", members: ["suno-api/boost-music-style"] },
  { id: "recover-audio", name: "Recover a song", blurb: "Fetch a Suno song again by its task ID.", section: "Audio", icon: "life-buoy", members: ["suno-api/recovery-audio"] },
  { id: "omni-character", name: "Character", blurb: "Save a character from photos for Gemini Omni video.", section: "Characters and voices", icon: "user", members: ["gemini-omni-character"] },
  { id: "omni-voice", name: "Voice preset", blurb: "Save a voice for Gemini Omni video.", section: "Characters and voices", icon: "volume", members: ["gemini-omni-audio"] },
  { id: "suno-persona", name: "Suno persona", blurb: "Keep the singer of a Suno song for new songs.", section: "Characters and voices", icon: "user", members: ["suno-api/generate-persona"] },
  {
    id: "suno-voice",
    name: "Custom Suno voice",
    blurb: "Clone your voice for Suno, in four steps.",
    section: "Characters and voices",
    icon: "volume",
    // In the order you use them.
    members: ["suno-api/suno-voice-validate", "suno-api/suno-voice-regenerate", "suno-api/suno-voice-generate", "suno-api/suno-voice-check-voice"],
    engines: {
      "suno-api/suno-voice-validate": "1. Verification phrase",
      "suno-api/suno-voice-regenerate": "2. New phrase",
      "suno-api/suno-voice-generate": "3. Create voice",
      "suno-api/suno-voice-check-voice": "4. Check status",
    },
  },
  {
    id: "find-people",
    name: "Find people (OmniHuman)",
    blurb: "Detect the people or subjects in a photo before OmniHuman 1.5.",
    section: "Characters and voices",
    icon: "users",
    members: ["omnihuman-1-5/human-identification", "omnihuman-1-5/subject-detection"],
    engines: { "omnihuman-1-5/human-identification": "People", "omnihuman-1-5/subject-detection": "Subjects" },
  },
];

export const SECTIONS: ToolSection[] = ["Image", "Video", "Audio", "Characters and voices"];

export const toolById = (id: string) => TOOLS.find((t) => t.id === id) ?? null;
