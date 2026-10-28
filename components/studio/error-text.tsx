import type { SerializedKieError } from "@/lib/kie/errors";
import { cn } from "@/lib/utils";

const TONE: Partial<Record<SerializedKieError["kind"], string>> = {
  insufficient_credits: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  rate_limited: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  network: "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300",
};

/** One distinct, explicit rendering per error kind (label + exact message). */
export function ErrorText({ error, className }: { error: SerializedKieError & { failCode?: string }; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-xs",
        TONE[error.kind] ?? "border-destructive/40 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <div className="font-medium">
        {error.label}
        {error.failCode ? ` · failCode ${error.failCode}` : error.code && !error.label.includes(String(error.code)) ? ` · code ${error.code}` : ""}
      </div>
      <div className="break-words opacity-90">{error.message}</div>
      {error.ambiguous && (
        <div className="mt-1 opacity-90">
          The request may have reached Kie.ai. It was not retried, to avoid a double charge — check{" "}
          <a className="underline" href="https://kie.ai/logs" target="_blank" rel="noreferrer">
            kie.ai/logs
          </a>
          .
        </div>
      )}
    </div>
  );
}
