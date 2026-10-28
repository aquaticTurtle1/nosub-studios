import type { PromptReferenceSyntax } from "./types";

type Documented = Omit<Extract<PromptReferenceSyntax, { kind: "token" }>, "kind" | "source">;

/**
 * Reference syntax per catalog key, copied from the Kie.ai docs page of that model
 * (`source` is filled with the page URL by scripts/build-catalog.ts). Every other model
 * that takes references gets `{ kind: "none", unverified: true }`: the docs don't say,
 * so the prompt names references in plain words instead. The Kie docs link no provider
 * docs, so nothing here comes from elsewhere. Quotes are the docs' own wording.
 */
export const DOCUMENTED_SYNTAX: Record<string, Documented> = {
  // "Use `@imageN` in the prompt to reference an image from `image_urls`, where N is the 1-based index"
  "grok-imagine/1-5-preview": { format: "@image{n}", indexBase: 1, fields: ["image_urls"] },
  // "reference an uploaded image by typing @image(n) followed by a space (for example: @image1 …)"
  "grok-imagine/image-to-video": { format: "@image{n}", indexBase: 1, fields: ["image_urls"] },
  "grok-imagine/image-to-image": { format: "@image{n}", indexBase: 1, fields: ["image_urls"] },
  // "Use "[Image 1]", "[Image 2]" to refer to the images in reference_image, in the same order."
  "happyhorse-1-1/reference-to-video": { format: "[Image {n}]", indexBase: 1, fields: ["reference_image"] },
  // "`@image_1`, `@image_2`, … map to `image_urls` in order (1-based); `@video_1`, … map to `video_urls`"
  "kling/v4-reference-to-video": { format: "@{kind}_{n}", indexBase: 1, fields: ["image_urls", "video_urls"] },
  // "Mention frames in the prompt using `@first_frame`, `@keyframe_1`, and `@last_frame`."
  "kling/v4-keyframe-to-video": {
    format: "@keyframe_{n}",
    indexBase: 1,
    fieldFormats: { first_frame_url: "@first_frame", keyframe_urls: "@keyframe_{n}", last_frame_url: "@last_frame" },
  },
  // `ref_name`: "Can be referenced in the prompt using `@name`." — we send each image's label as its ref_name.
  "pixverse/reference-to-video": { format: "@{name}", indexBase: 1, fields: ["image_references"], nameField: "ref_name" },
  // "Refer to inputs by order, e.g. "the man in reference image 2 says ... using reference audio 1""
  "vidu-q4/reference-to-video": { format: "reference {kind} {n}", indexBase: 1, fields: ["reference_image_urls", "reference_audio_urls"] },
  // "In reference mode, use Image1/Video1/Audio1 to reference the provided media."
  "wan/3-0-video": { format: "{Kind}{n}", indexBase: 1, fields: ["reference_image_urls", "reference_video_urls", "reference_audio_urls"] },
  "wan/3-0-video-prime": { format: "{Kind}{n}", indexBase: 1, fields: ["reference_image_urls", "reference_video_urls", "reference_audio_urls"] },
  // Example prompt only: "Image 1 is eating, while video 1 and image 2 are singing beside it."
  "wan/2-7-r2v": { format: "{Kind} {n}", indexBase: 1, fields: ["reference_image", "reference_video"], note: "Only shown in the docs' example prompt" },
  // Example prompt only: "Replace the can in image 2 with the can from image 1"
  "flux2/flex-image-to-image": { format: "image {n}", indexBase: 1, fields: ["input_urls"], note: "Only shown in the docs' example prompt" },
};

export function syntaxFor(key: string, docUrl: string, hasRefs: boolean): PromptReferenceSyntax | undefined {
  if (!hasRefs) return undefined;
  const d = DOCUMENTED_SYNTAX[key];
  return d ? { kind: "token", ...d, source: docUrl } : { kind: "none", unverified: true };
}
