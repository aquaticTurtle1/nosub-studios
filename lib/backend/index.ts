import { isCloud } from "@/lib/mode";
import { cloudBackend } from "./cloud";
import { localBackend } from "./local";
import type { StudioBackend } from "./types";

export const backend: StudioBackend = isCloud() ? cloudBackend : localBackend;
export type { Draft, StudioBackend } from "./types";
