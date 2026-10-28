"use client";

import { toast } from "sonner";
import type { SerializedKieError } from "@/lib/kie/errors";
import { humanError } from "@/lib/ui/human-error";

/** Plain-language error toast with a next step; raw code and message under "Details". */
export function notifyError(e: SerializedKieError & { failCode?: string }) {
  const h = humanError(e);
  toast.error(h.title, {
    description: (
      <div className="grid gap-1">
        <span>{h.next}</span>
        <details className="text-xs text-np-text-muted">
          <summary className="cursor-pointer select-none">Details</summary>
          <span className="break-words">
            {e.label}
            {e.code ? ` · code ${e.code}` : ""} — {e.message}
          </span>
        </details>
      </div>
    ),
    duration: 8000,
  });
}
