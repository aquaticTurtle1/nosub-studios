/**
 * Prompt helpers. These are local text templates appended to your prompt — not
 * model features. Kie.ai models have no camera or style presets of their own.
 * Edit freely: `phrase` is what gets appended.
 */
export interface PromptPreset {
  id: string;
  label: string;
  /** Which generation pages show it. */
  modes: ("image" | "video")[];
  phrase: string;
}

export const PRESETS: PromptPreset[] = [
  {
    id: "slow-push-in",
    label: "Slow push-in",
    modes: ["video"],
    phrase: "The camera slowly pushes in toward the subject with a steady, smooth dolly move.",
  },
  {
    id: "orbit",
    label: "Orbit",
    modes: ["video"],
    phrase: "The camera orbits the subject in a slow, continuous half circle, keeping it centered.",
  },
  {
    id: "handheld",
    label: "Handheld",
    modes: ["video"],
    phrase: "Handheld camera with subtle natural shake, documentary feel, following the action closely.",
  },
  {
    id: "drone-reveal",
    label: "Drone reveal",
    modes: ["video"],
    phrase: "Aerial drone shot rising and tilting down to reveal the wide landscape below.",
  },
  {
    id: "golden-hour",
    label: "Golden hour",
    modes: ["video", "image"],
    phrase: "Warm golden-hour sunlight, long soft shadows, gentle lens flare.",
  },
  {
    id: "studio-product",
    label: "Studio product shot",
    modes: ["video", "image"],
    phrase: "Clean studio product shot on a seamless backdrop, softbox lighting, crisp reflections, sharp focus.",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    modes: ["image", "video"],
    phrase: "Cinematic composition, shallow depth of field, anamorphic look, rich color grading.",
  },
  {
    id: "portrait",
    label: "Soft portrait",
    modes: ["image"],
    phrase: "Close-up portrait, soft diffused window light, natural skin texture, 85mm lens.",
  },
];

/** Appends a preset phrase to a prompt, once. */
export function applyPreset(prompt: string, preset: PromptPreset): string {
  if (prompt.includes(preset.phrase)) return prompt;
  const base = prompt.trim();
  return base ? `${base.replace(/[.\s]*$/, ".")} ${preset.phrase}` : preset.phrase;
}
