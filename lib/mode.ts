export type StudioMode = "local" | "cloud";

// Literal process.env access so Next inlines NEXT_PUBLIC_* into the browser bundle.
export const MODE: StudioMode = process.env.NEXT_PUBLIC_STUDIO_MODE === "cloud" ? "cloud" : "local";

export function isCloud(): boolean {
  return MODE === "cloud";
}
