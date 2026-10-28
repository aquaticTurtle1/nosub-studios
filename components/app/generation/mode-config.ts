import {
  AudioLines,
  Clapperboard,
  FileAudio,
  ImagePlus,
  type LucideIcon,
  Music,
  PenLine,
  Sparkles,
  SlidersHorizontal,
  Upload,
  Wand2,
} from "lucide-react";
import type { Category } from "@/lib/catalog/types";

export type ModeId = "image" | "video" | "audio" | "tools";

export interface HowToStep {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface ModeConfig {
  id: ModeId;
  title: string;
  category: Category;
  promptPlaceholder: string;
  /** Model selected the first time (falls back to the first in the catalog). */
  defaultModel: string;
  /** Show prompt helper presets. */
  presets: boolean;
  /** New panel: family picker with routing, References box, setting tiles, prompt chips. */
  families: boolean;
  howTo: (operation: string, needsRefs: boolean) => HowToStep[];
  /** Media shown in generating skeletons when no aspect is known. */
  defaultAspect: string;
}

export const MODES: Record<ModeId, ModeConfig> = {
  video: {
    id: "video",
    title: "Video",
    category: "video",
    promptPlaceholder: "Describe the scene — e.g. “A slow tracking shot along a rain-soaked neon street at night”",
    defaultModel: "pixverse/text-to-video",
    presets: true,
    families: true,
    defaultAspect: "16 / 9",
    howTo: (op, needsRefs) =>
      needsRefs || /image|reference|video-to|motion|keyframe|avatar|lip|extend/.test(op)
        ? [
            { icon: ImagePlus, title: "Add an image", text: "Drop a photo or frame into References." },
            { icon: Sparkles, title: "Choose a preset", text: "Pick a camera move or describe the motion." },
            { icon: Clapperboard, title: "Get video", text: "Generate and download the clip." },
          ]
        : [
            { icon: PenLine, title: "Describe the scene", text: "Say what happens and how the camera moves." },
            { icon: Sparkles, title: "Choose a preset", text: "Add a camera move or a lighting look." },
            { icon: Clapperboard, title: "Get video", text: "Generate and download the clip." },
          ],
  },
  image: {
    id: "image",
    title: "Image",
    category: "image",
    promptPlaceholder: "Describe the image — e.g. “A ceramic teapot on a linen tablecloth, soft morning light”",
    defaultModel: "z-image/z-image",
    presets: true,
    families: true,
    defaultAspect: "1 / 1",
    howTo: (op, needsRefs) =>
      needsRefs || /edit|image-to-image/.test(op)
        ? [
            { icon: ImagePlus, title: "Add an image", text: "Drop the picture you want to change." },
            { icon: PenLine, title: "Describe the change", text: "Say what to add, remove or restyle." },
            { icon: Wand2, title: "Get image", text: "Generate and download the result." },
          ]
        : [
            { icon: PenLine, title: "Describe it", text: "Subject, setting, light and style." },
            { icon: Sparkles, title: "Pick a look", text: "Add a preset or set the aspect ratio." },
            { icon: Wand2, title: "Get image", text: "Generate and download the result." },
          ],
  },
  audio: {
    id: "audio",
    title: "Audio",
    category: "audio",
    promptPlaceholder: "Describe the sound — e.g. “Warm lo-fi beat with soft piano and vinyl crackle”",
    defaultModel: "suno-api/generate-music",
    presets: false,
    families: true,
    defaultAspect: "4 / 1",
    howTo: (op) =>
      /speech|dialogue/.test(op)
        ? [
            { icon: PenLine, title: "Write the text", text: "Paste the lines to be spoken." },
            { icon: SlidersHorizontal, title: "Pick a voice", text: "Choose voice and speed in settings." },
            { icon: AudioLines, title: "Get audio", text: "Generate and download the file." },
          ]
        : [
            { icon: PenLine, title: "Describe the track", text: "Genre, mood, instruments or lyrics." },
            { icon: SlidersHorizontal, title: "Set the style", text: "Adjust length and options in settings." },
            { icon: Music, title: "Get audio", text: "Generate and download the track." },
          ],
  },
  tools: {
    id: "tools",
    title: "Tools",
    category: "tools",
    promptPlaceholder: "Optional instructions",
    defaultModel: "recraft/remove-background",
    presets: false,
    families: true,
    defaultAspect: "1 / 1",
    howTo: () => [
      { icon: Upload, title: "Add a file", text: "Drop the image, video or audio to process." },
      { icon: SlidersHorizontal, title: "Adjust", text: "Check the few settings the tool has." },
      { icon: FileAudio, title: "Get the result", text: "Run it and download the output." },
    ],
  },
};

const OP_PHRASE: Record<string, string> = {
  "text-to-video": "Video from a text prompt.",
  "image-to-video": "Animates an image.",
  "text-or-image-to-video": "Video from text or an image.",
  "reference-to-video": "Video guided by reference images.",
  "video-to-video": "Restyles or edits a video.",
  extend: "Extends an earlier generation.",
  "talking-avatar": "Talking avatar from a photo and audio.",
  "lip-sync": "Matches lips to new audio.",
  "motion-transfer": "Copies motion from a video onto a character.",
  keyframes: "Video between key frames.",
  "text-to-image": "Image from a text prompt.",
  "text-or-image-to-image": "Image from text or reference images.",
  "image-to-image": "Transforms a reference image.",
  edit: "Edits an image from instructions.",
  upscale: "Upscales to a higher resolution.",
  "remove-background": "Removes the background.",
  "layer-decomposition": "Splits an image into layers.",
  segmentation: "Builds a segmentation map.",
  "subject-detection": "Finds subjects in an image.",
  "human-identification": "Checks whether a person is in the image.",
  "text-to-speech": "Speech from text.",
  "text-to-dialogue": "Multi-voice dialogue from a script.",
  "text-to-music": "A song from a description.",
  "sound-effects": "Sound effects from text.",
  lyrics: "Song lyrics from a theme.",
  cover: "A new cover of a song.",
  "add-instrumental": "Adds an instrumental to vocals.",
  "add-vocals": "Adds vocals to an instrumental.",
  "replace-section": "Rewrites part of a song.",
  mashup: "Mixes two songs together.",
  "music-video": "A video for a generated song.",
  "audio-isolation": "Isolates the voice from noise.",
  "stem-separation": "Splits vocals and instruments.",
  midi: "Extracts MIDI from audio.",
  "convert-to-wav": "Converts a track to WAV.",
  "timestamped-lyrics": "Lyrics with timings.",
  "voice-clone": "Suno custom voice step.",
  persona: "Saves a Suno persona.",
  "style-boost": "Expands a music style description.",
  recovery: "Recovers expired Suno tracks.",
  "voice-preset": "Saves a voice for Gemini Omni.",
  character: "Saves a character for Gemini Omni.",
  "get-1080p": "Gets the 1080p version of a Veo video.",
  "get-4k": "Gets the 4K version of a Veo video.",
};

export const opPhrase = (op: string) => OP_PHRASE[op] ?? `${op.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())}.`;

export const humanOp = (op: string) =>
  ({ "text-or-image-to-video": "Text or image to video", "text-or-image-to-image": "Text or image to image" })[op] ??
  op.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
