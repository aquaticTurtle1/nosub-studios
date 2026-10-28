"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SerializedKieError } from "@/lib/kie/errors";
import { api, ApiError, postJson } from "./api";
import { useStudio } from "./app-context";
import { ErrorText } from "./error-text";

type Result = { valid: true; balance: number } | { valid: false; error: SerializedKieError } | null;

export function KeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { keySource, refreshKey } = useStudio();
  const [replacing, setReplacing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

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
      const r = await api<{ valid: boolean; balance?: number; error?: SerializedKieError }>("/api/key", postJson({ key: value }));
      setResult(r.valid ? { valid: true, balance: r.balance! } : { valid: false, error: r.error! });
      setValue("");
      setReplacing(false);
      await refreshKey();
    } catch (e) {
      if (e instanceof ApiError) setResult({ valid: false, error: e.error });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api("/api/key", { method: "DELETE" });
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
            {showInput ? (
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
          </form>
        )}

        {result?.valid === true && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Key saved and accepted. Balance: {result.balance} credits.</p>
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
