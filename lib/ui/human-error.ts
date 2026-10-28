import type { SerializedKieError } from "@/lib/kie/errors";

export interface HumanError {
  title: string;
  /** What to do next. */
  next: string;
}

/** Plain-language message with a next step; the raw code/message stays in "Details". */
export function humanError(e: Pick<SerializedKieError, "kind" | "ambiguous"> & { message?: string }): HumanError {
  if (e.ambiguous) {
    return {
      title: "The submit could not be confirmed.",
      next: "It may still be running and charged. Check kie.ai/logs before trying again.",
    };
  }
  switch (e.kind) {
    case "missing_key":
      return { title: "No API key connected.", next: "Connect your Kie.ai key to generate." };
    case "invalid_key":
      return { title: "Kie.ai rejected the API key.", next: "Replace it from the credits menu." };
    case "insufficient_credits":
      return { title: "Not enough credits.", next: "Top up on kie.ai and try again." };
    case "rate_limited":
      return { title: "Too many requests at once.", next: "Wait a few seconds and try again." };
    case "validation":
      return { title: "These settings were rejected.", next: "Check the highlighted settings and try again." };
    case "maintenance":
      return { title: "Kie.ai is under maintenance.", next: "Try again later." };
    case "feature_disabled":
      return { title: "This model is temporarily disabled on Kie.ai.", next: "Pick another model." };
    case "generation_failed":
      return { title: "Generation failed.", next: "Try a different prompt or settings." };
    case "not_found":
      return { title: "Not found.", next: "Reload the page and try again." };
    case "network":
    case "timeout":
      return { title: "Can't reach the server.", next: "Check your connection and try again." };
    default:
      return { title: "Kie.ai returned an error.", next: "Try again in a moment." };
  }
}
