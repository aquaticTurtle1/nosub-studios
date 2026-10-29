"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SerializedKieError } from "@/lib/kie/errors";
import { backend } from "@/lib/backend";
import { isCloud } from "@/lib/mode";
import { ApiError } from "./api";
import { useStudio } from "./app-context";
import { ErrorText } from "./error-text";

type Result = { valid: true; balance: number; remembered?: boolean } | { valid: false; error: SerializedKieError } | null;

export function KeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { keySource, refreshKey } = useStudio();
  const [replacing, setReplacing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [remember, setRemember] = useState(true);
  const cloud = isCloud();

  const configured = keySource !== null;
  const showInput = !configured || replacing;

  function close(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setReplacing(false);
      setValue("");
      setResult(null);
    }
  }

  async function save() {
    setBusy(true);
    setResult(null);
    try {
      const r = await backend.key.connect(value, { remember: cloud ? remember : true });
      setResult({ valid: true, balance: r.balance!, remembered: r.remembered });
      setValue("");
      setReplacing(false);
      await refreshKey();
    } catch (e) {
      if (e instanceof ApiError) {
        setResult({ valid: false, error: e.error });
        // Status 200: the key was saved but failed the credit check (as before: clear the field, refresh).
        if (e.status === 200) {
          setValue("");
          setReplacing(false);
          await refreshKey();
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await backend.key.disconnect();
      setResult(null);
      await refreshKey();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{configured ? "Manage API key" : "Connect API key"}</DialogTitle>
          <DialogDescription>
            {cloud && configured && !replacing ? (
              "Your key is stored in this browser."
            ) : showInput ? (
              <>
                Paste the API key copied from{" "}
                <a className="underline" href="https://kie.ai/api-key" target="_blank" rel="noreferrer">
                  kie.ai/api-key
                </a>
                . Paste it as-is.
              </>
            ) : keySource === "env" ? (
              "Using KIE_API_KEY from .env.local. It takes priority over a key saved here; edit .env.local to change it."
            ) : (
              "A key is saved in an HTTP-only cookie on this machine. It is never sent to the browser."
            )}
          </DialogDescription>
        </DialogHeader>

        {showInput && keySource !== "env" && (
          <form
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (value.trim()) void save();
            }}
          >
            <Label htmlFor="kie-key">API key</Label>
            <Input
              id="kie-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            {cloud && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--np-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-np-accent"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember on this device
                </label>
                <CloudNotes />
              </>
            )}
          </form>
        )}
        {cloud && !showInput && <CloudNotes />}

        {result?.valid === true && (
          <p className="text-sm text-np-success">Key saved and accepted. Balance: {result.balance} credits.</p>
        )}
        {cloud && result?.valid === true && remember && result.remembered === false && (
          <p className="text-sm text-np-warning" role="status">
            This browser can&apos;t store the key. It will be asked again next time.
          </p>
        )}
        {result?.valid === false && (
          <div className="text-sm">
            <p className="mb-1 font-medium">Key saved, but the credit check failed:</p>
            <ErrorText error={result.error} />
          </div>
        )}

        <DialogFooter className="gap-2">
          {showInput && keySource !== "env" ? (
            <>
              {replacing && (
                <Button variant="ghost" onClick={() => setReplacing(false)} disabled={busy}>
                  Back
                </Button>
              )}
              <Button onClick={save} disabled={busy || !value.trim()}>
                {busy ? "Saving…" : configured ? "Replace API key" : "Connect API key"}
              </Button>
            </>
          ) : cloud && configured ? (
            <>
              <Button variant="destructive" onClick={remove} disabled={busy}>
                Disconnect key
              </Button>
              <Button onClick={() => setReplacing(true)} disabled={busy}>
                Replace API key
              </Button>
            </>
          ) : keySource === "cookie" ? (
            <>
              <Button variant="destructive" onClick={remove} disabled={busy}>
                Remove API key
              </Button>
              <Button onClick={() => setReplacing(true)} disabled={busy}>
                Replace API key
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => close(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CloudNotes() {
  return (
    <ul className="grid gap-1 text-[13px] text-np-text-muted">
      <li>Your key stays in this browser. Studio&apos;s server never receives it.</li>
      <li>If your key leaks, create a new one in Kie.ai.</li>
      <li>A new key starts a new history.</li>
    </ul>
  );
}
