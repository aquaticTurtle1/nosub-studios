import type { StudioBackend } from "./types";

const nope = (): never => {
  throw new Error("cloud backend not built");
};

/** Placeholder until the cloud backend lands. */
export const cloudBackend: StudioBackend = {
  key: { status: nope, connect: nope, disconnect: nope },
  credits: nope,
  tasks: { list: nope, get: nope, act: nope },
  generate: nope,
  uploads: { save: nope, list: nope, remove: nope },
  drafts: { get: nope, put: nope },
  previewUrl: nope,
  outputUrl: nope,
  downloadZip: nope,
};
