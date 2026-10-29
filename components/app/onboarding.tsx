"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyDialog } from "@/components/studio/key-dialog";
import { isCloud } from "@/lib/mode";
import { APP_NAME } from "./nav";

/** Shown instead of every page until an API key is connected. */
export function Onboarding() {
  const [open, setOpen] = useState(false);
  if (isCloud()) return <CloudOnboarding open={open} setOpen={setOpen} />;
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

const link = "text-np-accent-text underline underline-offset-2 rounded-np-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-np-accent";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className={link} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function CloudOnboarding({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  return (
    <main className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div className="grid w-full max-w-lg gap-6 rounded-np-xl bg-np-bg-1 p-5 sm:p-8">
        <div className="grid gap-2">
          <h1 className="font-display text-[28px] leading-9 font-semibold">Get started with {APP_NAME}</h1>
          <p className="text-np-text-secondary">
            {APP_NAME} generates images, video and audio through your own Kie.ai account. Kie.ai charges per
            generation: $5 buys 1,000 credits, and credits do not expire. Your key stays in this browser.
          </p>
        </div>
        <ol className="grid gap-3 text-[15px]">
          <li>
            <span className="font-medium">1. Sign up.</span> Create a free account at <Ext href="https://kie.ai">kie.ai</Ext>.
          </li>
          <li>
            <span className="font-medium">2. Add credits.</span> Top up from $5 on the{" "}
            <Ext href="https://kie.ai/pricing">pricing page</Ext>.
          </li>
          <li>
            <span className="font-medium">3. Create an API key.</span> Open{" "}
            <Ext href="https://kie.ai/api-key">kie.ai/api-key</Ext> and copy your key.
          </li>
          <li>
            <span className="font-medium">4. Paste it here.</span> Studio checks your balance and you can start creating.
          </li>
        </ol>
        <Button size="lg" onClick={() => setOpen(true)}>
          <KeyRound /> Connect API key
        </Button>
      </div>
      <KeyDialog open={open} onOpenChange={setOpen} />
    </main>
  );
}
