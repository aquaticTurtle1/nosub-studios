import { CircleAlert } from "lucide-react";
import type { SerializedKieError } from "@/lib/kie/errors";
import { humanError } from "@/lib/ui/human-error";
import { cn } from "@/lib/utils";

/** Plain-language error with a next step; the raw label/code/message sit under "Details". */
export function ErrorText({ error, className }: { error: SerializedKieError & { failCode?: string }; className?: string }) {
  const h = humanError(error);
  return (
    <div className={cn("flex gap-2 rounded-np-md bg-np-danger-soft px-3 py-2 text-[13px] leading-5", className)} role="alert">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-np-danger" aria-hidden />
      <div className="min-w-0">
        <div className="font-medium text-np-text-primary">
          <span className="text-np-danger">Error.</span> {h.title}
        </div>
        <div className="text-np-text-secondary">{h.next}</div>
        <details className="mt-1 text-xs text-np-text-muted">
          <summary className="cursor-pointer select-none">Details</summary>
          <div className="mt-1 break-words">
            {error.label}
            {error.failCode ? ` · failCode ${error.failCode}` : error.code ? ` · code ${error.code}` : ""}
            <br />
            {error.message}
          </div>
        </details>
      </div>
    </div>
  );
}
