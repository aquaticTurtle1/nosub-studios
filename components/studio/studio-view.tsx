"use client";

import { AlertTriangle, BookOpen, Loader2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LIVE_TESTED } from "@/lib/catalog/live-tested";
import { type CostEstimate, estimateCost, needsConfirmation } from "@/lib/catalog/pricing";
import { pruneEmpty, validateInput } from "@/lib/catalog/schema";
import type { CatalogModel, CatalogSummary, Category } from "@/lib/catalog/types";
import type { SerializedKieError } from "@/lib/kie/errors";
import type { TaskRecord } from "@/lib/task-types";
import { api, ApiError, postJson } from "./api";
import { useStudio } from "./app-context";
import { ErrorText } from "./error-text";
import { countFiles, defaultsFor, type FormValues, mapFiles } from "./form-values";
import { firstModelKey, humanOp, ModelPicker } from "./model-picker";
import { SchemaForm } from "./schema-form";
import { TaskCard } from "./task-card";
import { useTasks } from "./use-tasks";

const PENDING_UPLOAD = "https://pending-upload.invalid/file";

export function StudioView() {
  const { category, keySource, refreshCredits } = useStudio();
  const [summaries, setSummaries] = useState<CatalogSummary[]>([]);
  const [pricingAt, setPricingAt] = useState<string | null>(null);
  const [selectedByCat, setSelectedByCat] = useState<Partial<Record<Category, string>>>({});
  const [model, setModel] = useState<CatalogModel | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"idle" | "uploading" | "submitting">("idle");
  const [submitError, setSubmitError] = useState<SerializedKieError | null>(null);
  const [confirm, setConfirm] = useState<CostEstimate | null>(null);
  const { tasks, upsert, act } = useTasks({ limit: 30 });

  useEffect(() => {
    void api<{ models: CatalogSummary[]; pricingFetchedAt: string | null }>("/api/catalog").then((r) => {
      setSummaries(r.models);
      setPricingAt(r.pricingFetchedAt);
    });
  }, []);

  const selected = selectedByCat[category] ?? firstModelKey(summaries, category);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    void api<CatalogModel>(`/api/catalog/${selected.split("/").map(encodeURIComponent).join("/")}`).then((m) => {
      if (cancelled) return;
      setModel(m);
      setVariantIdx(0);
      setValues(defaultsFor(m.variants[0].schema));
      setIssues({});
      setSubmitError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const variant = model?.variants[variantIdx] ?? null;
  const taskIds = useMemo(
    () => tasks.filter((t) => t.state === "success" && t.kieTaskId && !t.kieTaskId.startsWith("local-")).map((t) => t.kieTaskId!),
    [tasks],
  );

  // Estimate with files counted as placeholders (uploads happen only at submit).
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  useEffect(() => {
    if (!model) return;
    let cancelled = false;
    void mapFiles(values, async () => PENDING_UPLOAD).then((v) => {
      if (!cancelled) setEstimate(estimateCost(model.pricing, (pruneEmpty(v) ?? {}) as Record<string, unknown>, model.free));
    });
    return () => {
      cancelled = true;
    };
  }, [model, values]);

  async function submit(confirmed: boolean) {
    if (!model || !variant || phase !== "idle") return;
    setSubmitError(null);
    setIssues({});
    // 1. Validate before uploading anything.
    const preview = (await mapFiles(values, async () => PENDING_UPLOAD)) as Record<string, unknown>;
    const check = validateInput(variant.schema, preview);
    if (!check.ok) {
      setIssues(Object.fromEntries(check.issues.map((i) => [i.path, i.message])));
      setSubmitError({ kind: "validation", label: "Invalid settings", message: check.issues.map((i) => `${i.path}: ${i.message}`).join("; "), ambiguous: false, code: undefined });
      return;
    }
    // 2. Guardrail: nothing can be cancelled once submitted.
    const est = estimateCost(model.pricing, check.value, model.free);
    if (!confirmed && needsConfirmation(model.category, est)) {
      setConfirm(est);
      return;
    }
    setConfirm(null);
    const idempotencyKey = crypto.randomUUID();
    try {
      // 3. Upload references right before submit (Kie deletes uploads after 24 h).
      let input = preview;
      if (countFiles(values)) {
        setPhase("uploading");
        input = (await mapFiles(values, async (f) => {
          const form = new FormData();
          form.append("file", f.file);
          const r = await api<{ url: string }>("/api/upload", { method: "POST", body: form });
          return r.url;
        })) as Record<string, unknown>;
      }
      setPhase("submitting");
      const r = await api<{ task: TaskRecord }>(
        "/api/generate",
        postJson({ modelKey: model.key, variant: variant.title, input: pruneEmpty(input) ?? {}, idempotencyKey, confirmed: true }),
      );
      upsert(r.task);
      void refreshCredits();
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(e.error);
        const list = e.body.issues as { path: string; message: string }[] | undefined;
        if (list) setIssues(Object.fromEntries(list.map((i) => [i.path, i.message])));
      }
    } finally {
      setPhase("idle");
    }
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 p-4 lg:h-dvh lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,420px)]">
      <div className="flex max-h-80 min-h-0 flex-col lg:h-[calc(100dvh-2rem)] lg:max-h-none">
        <ModelPicker
          models={summaries}
          category={category}
          selected={selected}
          onSelect={(k) => setSelectedByCat((s) => ({ ...s, [category]: k }))}
        />
      </div>

      <main className="min-h-0 overflow-y-auto lg:h-[calc(100dvh-2rem)]">
        {!model || !variant ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading model…
          </div>
        ) : (
          <div className="grid gap-4">
            <header className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold">{model.title}</h1>
                <Badge variant="secondary">{humanOp(model.operation)}</Badge>
                <Badge variant="outline">{model.family}</Badge>
                {!LIVE_TESTED[model.key] && <Badge variant="outline">not live-tested</Badge>}
                <a className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" href={model.docUrl} target="_blank" rel="noreferrer">
                  <BookOpen className="size-3.5" /> Docs
                </a>
              </div>
              <code className="text-xs text-muted-foreground">
                POST {model.createPath} · model: {model.modelId}
              </code>
              {model.summary && <p className="text-xs text-muted-foreground">{model.summary}</p>}
              {model.issues.length > 0 && (
                <div className="flex gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0" />
                  <div>
                    <div className="font-medium">Unverified</div>
                    {model.issues.map((i) => (
                      <div key={i}>{i}</div>
                    ))}
                  </div>
                </div>
              )}
            </header>

            {model.variants.length > 1 && (
              <Tabs
                value={String(variantIdx)}
                onValueChange={(v) => {
                  const i = Number(v);
                  setVariantIdx(i);
                  setValues(defaultsFor(model.variants[i].schema));
                  setIssues({});
                }}
              >
                <TabsList>
                  {model.variants.map((v, i) => (
                    <TabsTrigger key={v.title} value={String(i)}>
                      {v.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            <SchemaForm schema={variant.schema} values={values} onChange={setValues} taskIds={taskIds} issues={issues} />

            <CostPanel estimate={estimate} pricingAt={pricingAt} />

            {submitError && <ErrorText error={submitError} />}
            <div className="sticky bottom-0 flex items-center gap-3 border-t bg-background/95 py-3 backdrop-blur">
              <Button size="lg" onClick={() => void submit(false)} disabled={phase !== "idle" || !keySource}>
                {phase === "idle" ? <Wand2 /> : <Loader2 className="animate-spin" />}
                {phase === "uploading" ? "Uploading references…" : phase === "submitting" ? "Submitting…" : "Generate"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {!keySource
                  ? "Connect an API key to generate."
                  : estimate?.credits !== null && estimate?.credits !== undefined
                    ? `≈ ${estimate.credits} credits (≈ $${(estimate.credits * 0.005).toFixed(3)})`
                    : "Cost unknown — you will be asked to confirm"}
              </span>
            </div>
          </div>
        )}
      </main>

      <section className="flex min-h-0 flex-col gap-2 lg:h-[calc(100dvh-2rem)]">
        <h2 className="text-sm font-medium">Queue</h2>
        <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pr-1">
          {tasks.length === 0 && <p className="text-sm text-muted-foreground">No generations yet.</p>}
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onAction={act} compact />
          ))}
        </div>
      </section>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm generation</DialogTitle>
            <DialogDescription>
              Kie.ai has no cancel endpoint: once submitted, this run will be charged even if you stop tracking it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1 text-sm">
            <div>
              Estimated cost:{" "}
              <strong>{confirm?.credits !== null && confirm?.credits !== undefined ? `${confirm.credits} credits (≈ $${(confirm.credits * 0.005).toFixed(2)})` : "unknown"}</strong>
            </div>
            <div className="text-xs text-muted-foreground">{confirm?.basis}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Back
            </Button>
            <Button onClick={() => void submit(true)}>Submit and pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CostPanel({ estimate, pricingAt }: { estimate: CostEstimate | null; pricingAt: string | null }) {
  const [open, setOpen] = useState(false);
  if (!estimate) return null;
  return (
    <div className="grid gap-1 rounded-md border p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-medium">Estimated cost</span>
        <span className="tabular-nums">{estimate.credits !== null ? `${estimate.credits} credits` : "unknown"}</span>
        <span className="text-muted-foreground">· {estimate.basis}</span>
        {estimate.ranked.length > 1 && (
          <button className="ml-auto underline" onClick={() => setOpen(!open)}>
            {open ? "hide" : `all ${estimate.ranked.length} price rows`}
          </button>
        )}
      </div>
      {estimate.row && <div className="text-muted-foreground">Matched row: {estimate.row.description}</div>}
      {open && (
        <ul className="grid gap-0.5 text-muted-foreground">
          {estimate.ranked.map((r) => (
            <li key={r.description}>
              {r.description} — {r.credits} credits {r.unit} (${r.usd})
            </li>
          ))}
        </ul>
      )}
      <div className="text-muted-foreground">
        From the kie.ai/pricing snapshot{pricingAt ? ` of ${new Date(pricingAt).toLocaleDateString()}` : ""}, matched by model name and your settings — an approximation. The real charge is recorded per task.
      </div>
    </div>
  );
}
