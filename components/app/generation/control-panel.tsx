"use client";

import { ArrowLeft, ChevronDown, ChevronRight, ChevronUp, Code2, Loader2, Upload, Wand2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SchemaForm } from "@/components/studio/schema-form";
import { familyHasExtend, routable } from "@/lib/catalog/families";
import type { ToolDef } from "@/lib/catalog/tools";
import type { TaskRecord } from "@/lib/task-types";
import type { RefKind } from "@/lib/ui/fields";
import { cn } from "@/lib/utils";
import { ExtendSource, TASK_ID_FIELD } from "./extend-source";
import { FamilyPicker, ModelFieldButton } from "./family-picker";
import { lastThumb } from "./model-thumb";
import { humanOp, type ModeConfig } from "./mode-config";
import { PromptBox } from "./prompt-box";
import { limitsText, RefsBox } from "./refs-box";
import { SettingChip } from "./setting-chip";
import { dropTarget } from "./use-file-drop";
import { type Generator, readRecentFamilies } from "./use-generator";

export function costLabel(g: Generator): { button: string; note: string } {
  const est = g.estimate;
  if (g.model?.free) return { button: "free", note: 'Docs: "This endpoint is free."' };
  if (est?.credits !== null && est?.credits !== undefined) {
    return { button: `${est.credits} credits`, note: `≈ $${(est.credits * 0.005).toFixed(3)} · ${est.basis}` };
  }
  if (g.historyAverage !== null) return { button: `~${g.historyAverage} credits`, note: "Your average for this model" };
  return { button: "cost unknown", note: est?.basis ?? "No price known for these settings" };
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function routeReason(g: Generator): string {
  if (g.pinned) return "chosen variant";
  if (g.extendMode) return "extend";
  const parts = (["image", "video", "audio"] as RefKind[]).filter((k) => g.counts[k]).map((k) => plural(g.counts[k], k));
  return parts.length ? `auto · ${parts.join(", ")} attached` : "auto · text only";
}

export function ControlPanel({
  mode,
  g,
  tasks,
  dragging,
  tool,
  onBrowse,
}: {
  mode: ModeConfig;
  g: Generator;
  tasks: TaskRecord[];
  /** Files are being dragged over the page: the panel shows where to drop. */
  dragging: boolean;
  /** Opens the Media library. */
  onBrowse: () => void;
  /** Tool pages: a fixed tool instead of the model picker. */
  tool?: ToolDef | null;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [payload, setPayload] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const layout = g.layout;
  const cost = costLabel(g);
  const taskIds = useMemo(
    () => tasks.filter((t) => t.state === "success" && t.kieTaskId && !t.kieTaskId.startsWith("local-")).map((t) => t.kieTaskId!),
    [tasks],
  );
  const busy = g.phase !== "idle";
  const fam = g.family;

  // In Extend mode the task-ID field is filled by the video picker, not by a text box.
  const taskIdField = g.extendMode ? layout?.required.find((n) => TASK_ID_FIELD.test(n)) : undefined;
  const requiredShown = layout?.required.filter((n) => n !== taskIdField) ?? [];
  const advancedIssue = layout?.advanced.some((n) => g.issues[n]);

  const accepts: RefKind[] = g.accepts.kinds;
  const showRefs = accepts.length > 0;
  const hasExtend = Boolean(fam && familyHasExtend(fam));
  // Family routing: list what each mode takes (MiniMax H3: Image-to-Video 2 images, Reference-to-Video 9/3/3).
  const routes =
    fam && !tool && !g.pinned && !g.extendMode
      ? routable(fam)
          .filter((e) => e.meta.refKinds.length > 0)
          .map((e) => ({ key: e.key, op: humanOp(e.operation), text: limitsText(e.meta.refKinds, e.meta.refCapacity), active: e.key === g.model?.key }))
      : [];

  // Secondary sections hide on phones until the sheet is expanded.
  const secondary = cn(!sheetOpen && "max-lg:hidden");
  const thumb = fam ? fam.entries.map((e) => lastThumb(tasks, e.key)).find(Boolean) ?? null : null;

  return (
    <aside
      aria-label="Generation settings"
      {...dropTarget(g.addFiles)}
      className={cn(
        "z-30 flex flex-col bg-np-bg-1",
        "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:rounded-t-np-xl max-lg:shadow-np-popover",
        sheetOpen ? "max-lg:max-h-[88dvh]" : "max-lg:max-h-[50dvh]",
        "lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:w-[400px] lg:shrink-0",
      )}
    >
      <button
        className="flex h-6 shrink-0 items-center justify-center text-np-text-muted lg:hidden"
        onClick={() => setSheetOpen((o) => !o)}
        aria-label={sheetOpen ? "Collapse settings" : "Expand settings"}
        aria-expanded={sheetOpen}
      >
        {sheetOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </button>

      <div className="np-scroll grid min-h-0 flex-1 content-start gap-5 overflow-y-auto px-4 pb-4 lg:pt-5">
        {!g.model || !layout ? (
          <div className="flex h-40 items-center justify-center text-np-text-muted">
            <Loader2 className="size-5 animate-spin" aria-label="Loading model" />
          </div>
        ) : (
          <>
            {tool && (
              <header className="grid gap-1">
                <Link href="/tools" className="flex w-fit items-center gap-1 text-xs text-np-text-secondary hover:text-np-text-primary">
                  <ArrowLeft className="size-3.5" aria-hidden /> All tools
                </Link>
                <h2 className="font-display text-lg font-semibold">{tool.name}</h2>
                <p className="text-xs text-np-text-muted">{tool.blurb}</p>
              </header>
            )}
            {/* References (and Extend video) sit directly above the prompt. */}
            {(showRefs || hasExtend) && (
              <section className={cn("grid gap-2", secondary)} aria-label="References">
                <div className="flex min-h-6 items-center gap-2">
                  {hasExtend ? (
                    <div role="tablist" aria-label="Input" className="flex flex-1 gap-1 rounded-np-md bg-np-bg-2 p-1">
                      {[
                        { id: false, label: "References" },
                        { id: true, label: "Extend video" },
                      ].map((t) => (
                        <button
                          key={t.label}
                          role="tab"
                          aria-selected={g.extendMode === t.id}
                          onClick={() => {
                            if (g.extendMode !== t.id) g.clearRefs();
                            g.setExtendMode(t.id);
                          }}
                          className={cn(
                            "h-7 flex-1 rounded-np-sm text-xs text-np-text-secondary hover:text-np-text-primary",
                            g.extendMode === t.id && "bg-np-bg-3 font-medium text-np-text-primary",
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <h2 className="flex-1 text-xs font-medium text-np-text-secondary">References</h2>
                  )}
                  {g.refs.length > 0 && (
                    <Button variant="ghost" size="xs" onClick={g.clearRefs} className="text-np-text-secondary" aria-label="Clear references">
                      Clear
                    </Button>
                  )}
                </div>
                {g.extendMode && fam && taskIdField !== undefined && (
                  <ExtendSource
                    family={fam}
                    tasks={tasks}
                    selected={g.values[taskIdField] as string | undefined}
                    onSelect={(id) => g.setValue(taskIdField, id)}
                  />
                )}
                {(!g.extendMode || layout.refFields.length > 0 || g.model.variants.length > 1) && accepts.length > 0 && (
                  <RefsBox
                    modelName={g.accepts.name}
                    accepts={accepts}
                    limits={g.accepts.limits}
                    refs={g.refs}
                    fields={layout.refFields}
                    invalid={layout.refFields.some((r) => g.issues[r.name])}
                    onBrowse={onBrowse}
                    routes={routes}
                    onRemove={g.removeRef}
                    onTarget={g.setRefTarget}
                  />
                )}
                {g.routeProblem && <p className="text-xs text-np-danger">{g.routeProblem}</p>}
              </section>
            )}

            {layout.promptField && (
              <PromptBox
                value={(g.values[layout.promptField] as string) ?? ""}
                onChange={(v) => g.setValue(layout.promptField!, v)}
                placeholder={mode.promptPlaceholder}
                length={g.promptLength}
                limit={g.promptLimit}
                refs={g.refs.map((r) => ({ label: r.label, kind: r.kind, name: r.name, preview: r.preview }))}
                hint={g.promptHint}
                presetMode={mode.presets ? (mode.id as "image" | "video") : null}
                invalid={Boolean(g.issues[layout.promptField])}
                compact={!sheetOpen}
              />
            )}

            <section className={cn("grid gap-2", secondary)}>
              <h2 className="text-xs font-medium text-np-text-secondary">{tool ? "Engine" : "Model"}</h2>
              {tool && fam ? (
                <>
                  {fam.entries.length > 1 ? (
                    <div role="radiogroup" aria-label="Engine" className="flex flex-wrap gap-1 rounded-np-md bg-np-bg-2 p-1">
                      {fam.entries.map((e) => (
                        <button
                          key={e.key}
                          role="radio"
                          aria-checked={e.key === g.model?.key}
                          onClick={() => g.pinModel(e.key)}
                          className={cn(
                            "h-7 flex-1 rounded-np-sm px-2 text-xs whitespace-nowrap text-np-text-secondary hover:text-np-text-primary",
                            e.key === g.model?.key && "bg-np-bg-3 font-medium text-np-text-primary",
                          )}
                        >
                          {tool.engines?.[e.key] ?? e.title.trim()}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{g.model.title.trim()}</p>
                  )}
                  <p className="truncate text-[11px] text-np-text-muted" title={g.model.modelId} data-testid="resolved-model">
                    {g.model.modelId}
                  </p>
                </>
              ) : (
                <>
                  <FamilyPicker
                    key={pickerKey}
                    families={g.families}
                    family={fam}
                    pinnedKey={g.pinned ? g.model.key : null}
                    recentIds={readRecentFamilies(mode.id)}
                    tasks={tasks}
                    onFamily={(id) => {
                      g.selectFamily(id);
                      setPickerKey((k) => k + 1);
                    }}
                    onPin={g.pinModel}
                  >
                    <ModelFieldButton family={fam} thumb={thumb} aria-label={`Model: ${fam?.name ?? g.model.title}. Change model`} />
                  </FamilyPicker>
                  <p className="truncate text-[11px] text-np-text-muted" title={g.model.modelId} data-testid="resolved-model">
                    {g.model.modelId} · {routeReason(g)}
                  </p>
                </>
              )}
              {g.model.issues.length > 0 && (
                <p className="flex gap-1.5 text-xs text-np-warning">
                  <span className="shrink-0 rounded-np-sm bg-np-warning-soft px-1.5 leading-5">Unverified</span>
                  <span className="line-clamp-2">{g.model.issues[0]}</span>
                </p>
              )}
              {g.model.variants.length > 1 && !g.extendMode && (
                <div role="radiogroup" aria-label="Input type" className="flex flex-wrap gap-1 rounded-np-md bg-np-bg-2 p-1">
                  {g.model.variants.map((v, i) => (
                    <button
                      key={v.title}
                      role="radio"
                      aria-checked={i === g.variantIdx}
                      onClick={() => g.selectVariant(i)}
                      className={cn(
                        "h-7 flex-1 rounded-np-sm px-2 text-xs whitespace-nowrap text-np-text-secondary hover:text-np-text-primary",
                        i === g.variantIdx && "bg-np-bg-3 font-medium text-np-text-primary",
                      )}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {layout.core.length > 0 && (
              <section className={cn("grid gap-2", secondary)} aria-label="Main settings">
                <h2 className="text-xs font-medium text-np-text-secondary">Settings</h2>
                <div className="grid grid-cols-2 gap-2">
                    {layout.core.map((c) => (
                      <SettingChip
                        key={c.name}
                        variant="tile"
                        chip={c}
                        value={g.values[c.name]}
                        invalid={Boolean(g.issues[c.name])}
                        onChange={(v) => g.setValue(c.name, v)}
                      />
                    ))}
                </div>
              </section>
            )}

            {requiredShown.length > 0 && (
              <section className={cn("grid gap-3", secondary)} aria-label="Required settings">
                <SchemaForm
                  schema={g.variant!.schema}
                  values={g.values}
                  onChange={g.setValues}
                  taskIds={taskIds}
                  issues={g.issues}
                  only={requiredShown}
                />
              </section>
            )}

            {layout.advanced.length > 0 && (
              <section className={cn("grid gap-3", secondary)}>
                <button
                  onClick={() => setAdvancedOpen((o) => !o)}
                  aria-expanded={advancedOpen || advancedIssue}
                  className="flex items-center gap-1.5 text-xs font-medium text-np-text-secondary hover:text-np-text-primary"
                >
                  <ChevronRight className={cn("size-3.5 transition-transform duration-150", (advancedOpen || advancedIssue) && "rotate-90")} />
                  Advanced · {layout.advanced.length}
                  {advancedIssue && <span className="text-np-danger">needs attention</span>}
                </button>
                {(advancedOpen || advancedIssue) && (
                  <div className="grid gap-4">
                    <SchemaForm
                      schema={g.variant!.schema}
                      values={g.values}
                      onChange={g.setValues}
                      taskIds={taskIds}
                      issues={g.issues}
                      only={layout.advanced}
                    />
                  </div>
                )}
              </section>
            )}
            {/* Dry run: exactly what would be sent. Local references stay local:// — the server uploads them at submit. */}
            <div className={cn("grid gap-2", secondary)}>
              <Button
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={async () => setPayload(payload ? null : JSON.stringify({ model: g.model!.modelId, input: await g.preview() }, null, 2))}
              >
                <Code2 /> {payload ? "Hide request" : "Preview request"}
              </Button>
              {payload && payload.includes("local://") && (
                <p className="text-xs text-np-text-muted">local:// files are uploaded to Kie.ai when you press Generate, and replaced with fresh URLs.</p>
              )}
              {payload && (
                <pre data-testid="request-preview" className="np-scroll max-h-72 overflow-y-auto rounded-np-md bg-np-bg-0 p-3 text-xs break-all whitespace-pre-wrap text-np-text-secondary">
                  {payload}
                </pre>
              )}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 px-4 pt-2 pb-4">
        {!sheetOpen && g.model && (
          <button
            onClick={() => setSheetOpen(true)}
            className="mb-2 flex w-full items-center gap-2 text-left text-xs text-np-text-secondary lg:hidden"
          >
            <span className="truncate font-medium text-np-text-primary">{fam ? fam.name : g.model.title}</span>
            <span className="shrink-0">· {showRefs ? "References and settings" : "Settings"}</span>
            <ChevronUp className="ml-auto size-3.5 shrink-0" aria-hidden />
          </button>
        )}
        {g.promptTooLong && (
          <p role="alert" data-testid="prompt-too-long" className="mb-2 text-xs text-np-danger">
            {g.promptTooLong} Shorten it to generate.
          </p>
        )}
        <Button
          size="lg"
          className="w-full shadow-np-accent"
          aria-busy={busy}
          disabled={Boolean(g.promptTooLong)}
          onClick={() => void g.submit(false)}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Wand2 />}
          <span>
            {g.phase === "uploading" ? "Uploading references…" : g.phase === "submitting" ? "Submitting…" : "Generate"}
            {!busy && <span className="font-normal"> · {cost.button}</span>}
          </span>
        </Button>
        <p className="mt-1.5 truncate text-center text-xs text-np-text-muted" title={cost.note}>
          {cost.note} · Ctrl+Enter
        </p>
      </div>

      {dragging && (
        <div
          data-testid="drop-overlay"
          className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-np-lg bg-np-accent-soft ring-2 ring-np-accent"
        >
          <span className="flex items-center gap-2 rounded-np-md bg-np-bg-3 px-4 py-2.5 text-sm font-medium text-np-text-primary shadow-np-popover">
            <Upload className="size-4 text-np-accent-text" aria-hidden /> Drop to add as reference
          </span>
        </div>
      )}
    </aside>
  );
}
