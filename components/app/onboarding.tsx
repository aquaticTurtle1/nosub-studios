"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyDialog } from "@/components/studio/key-dialog";
import { APP_NAME } from "./nav";

/** Shown instead of every page until an API key is connected. */
export function Onboarding() {
  const [open, setOpen] = useState(false);
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="grid max-w-md gap-6 rounded-np-xl bg-np-bg-1 p-8">
        <div className="grid gap-2">
          <h1 className="font-display text-[28px] leading-9 font-semibold">Connect your Kie.ai key</h1>
          <p className="text-np-text-secondary">
            {APP_NAME} generates images, video and audio through your own Kie.ai account. Generations are paid from
            your Kie.ai credits; the key stays on this computer and is never sent to the browser.
          </p>
        </div>
        <Button size="lg" onClick={() => setOpen(true)}>
          <KeyRound /> Connect API key
        </Button>
        <p className="text-[13px] text-np-text-muted">
          No key yet? Create one at{" "}
          <a className="text-np-accent-text underline underline-offset-2" href="https://kie.ai/api-key" target="_blank" rel="noreferrer">
            kie.ai/api-key
          </a>
          .
        </p>
      </div>
      <KeyDialog open={open} onOpenChange={setOpen} />
    </main>
  );
}
