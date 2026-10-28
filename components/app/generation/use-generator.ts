"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { type AttachedCounts, type Family, familiesFor, familyKinds, resolveMember, routable } from "@/lib/catalog/families";
import { type CostEstimate, estimateCost, needsConfirmation } from "@/lib/catalog/pricing";
import { type PromptRef, serializePrompt } from "@/lib/catalog/prompt-refs";
import { pruneEmpty, toZod, validateInput } from "@/lib/catalog/schema";
import type { CatalogModel, CatalogSummary } from "@/lib/catalog/types";
import type { SerializedKieError } from "@/lib/kie/errors";
import type { TaskRecord } from "@/lib/task-types";
import { fileProblem, initialChipValue, kindCapacity, layoutFields, type RefKind } from "@/lib/ui/fields";
import { collectLocalUris, previewUrl, type UploadRecord, uploadUri } from "@/lib/ui/local-ref";
import { type AttachedRef, assignTargets, mergeRefs, nextLabel } from "@/lib/ui/request";
import { api, ApiError, postJson } from "@/components/studio/api";
import { useStudio } from "@/components/studio/app-context";
import { countFiles, defaultsFor, type FormValue, type FormValues, mapFiles } from "@/components/studio/form-values";
import { notifyError } from "../notify";
import type { ModeConfig } from "./mode-config";
import { probeMedia } from "./probe-media";

/** A file from the local library (an upload or a finished generation). */
export interface LibraryItem {
  /** local://upload/<id> or local://output/<path> — never a Kie.ai or blob: URL. */
  uri: string;
  kind: RefKind;
  name: string;
  mime: string;
  size: number;
  duration?: number | null;
}

/** An attached reference. `value` is its local:// URI ("" while the file is still being saved). */
export type Ref = AttachedRef<string> & {
  /** image_1, video_2, … — fixed while attached; prompt chips point at it. */
  label: string;
  mime: string;
  size: number;
  duration?: number | null;
  /** What the thumbnail shows: the local file, or a blob: preview while saving. */
  preview: string;
  saving?: boolean;
  problem?: string;
};

interface Draft {
  familyId?: string | null;
  pinned?: boolean;
  modelKey?: string | null;
  variant?: string | null;
  extendMode?: boolean;
  values?: Record<string, unknown>;
  refs?: { uri: string; kind: RefKind; label?: string; name: string; mime: string; size: number; duration?: number | null; target: string | null }[];
}

const PENDING_UPLOAD = "https://pending-upload.invalid/file";
const RECENT_KEY = (mode: string) => `studio.recent.${mode}`;
const RECENT_FAMILY_KEY = (mode: string) => `studio.recentFamilies.${mode}`;
const KIND_WORD: Record<RefKind, string> = { image: "an image", video: "a video", audio: "an audio file" };
const KIND_PLURAL: Record<RefKind, string> = { image: "images", video: "videos", audio: "audio files" };
const NO_LIMITS: Record<RefKind, number> = { image: 0, video: 0, audio: 0 };

function readList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function pushList(key: string, value: string) {
  try {
    localStorage.setItem(key, JSON.stringify([value, ...readList(key).filter((k) => k !== value)].slice(0, 6)));
  } catch {
    // storage unavailable — recents are a convenience only
  }
}

export const readRecent = (mode: string) => readList(RECENT_KEY(mode));
export const readRecentFamilies = (mode: string) => readList(RECENT_FAMILY_KEY(mode));
const pushRecent = (mode: string, key: string) => pushList(RECENT_KEY(mode), key);

const kindOfFile = (f: File): RefKind | null => {
  const t = f.type.split("/")[0];
  return t === "image" || t === "video" || t === "audio" ? t : null;
};

/** Saves a file into the local library (data/uploads); same bytes → same entry. */
export async function saveLocalFile(file: File): Promise<UploadRecord> {
  const probe = await probeMedia(file);
  const form = new FormData();
  form.append("file", file);
  for (const [k, v] of Object.entries(probe)) if (v !== null) form.append(k, String(v));
  return (await api<{ upload: UploadRecord }>("/api/uploads", { method: "POST", body: form })).upload;
}

const hasFile = (v: unknown) => countFiles(v as FormValue) > 0;

interface Pending {
  variant?: string | null;
  /** Pick a variant from the loaded model (used by Extend). */
  pickVariant?: (m: CatalogModel) => number;
  values?: Record<string, unknown>;
}

export function useGenerator(
  mode: ModeConfig,
  opts: {
    onSubmitted: (t: TaskRecord) => void;
    history: TaskRecord[];
    summaries: CatalogSummary[];
    /** Tool pages: the family is fixed (only its engines can be picked). */
    lockFamily?: string;
  },
) {
  const { refreshCredits } = useStudio();
  const [modelKey, setModelKey] = useState<string | null>(null);
  const [model, setModel] = useState<CatalogModel | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [refs, setRefs] = useState<Ref[]>([]);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"idle" | "uploading" | "submitting">("idle");
  const [submitError, setSubmitError] = useState<SerializedKieError | null>(null);
  const [confirm, setConfirm] = useState<CostEstimate | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(opts.lockFamily ?? null);
  // One draft per page; each tool has its own.
  const draftKey = opts.lockFamily ? `${mode.id}.${opts.lockFamily}` : mode.id;
  const [pinned, setPinned] = useState(false);
  const [extendMode, setExtendMode] = useState(false);
  const [restored, setRestored] = useState(false);
  const pending = useRef<Pending | null>(null);
  const busy = useRef(false);
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const families = useMemo(() => familiesFor(mode.category, opts.summaries), [mode.category, opts.summaries]);
  const family: Family | null = useMemo(() => families.find((f) => f.id === familyId) ?? null, [families, familyId]);
  const counts: AttachedCounts = useMemo(() => {
    const c = { image: 0, video: 0, audio: 0 };
    for (const r of refs) c[r.kind]++;
    return c;
  }, [refs]);

  // Restore this page's draft (prompt, model, settings, references) once.
  useEffect(() => {
    let cancelled = false;
    api<{ draft: Draft | null; dropped: string[] }>(`/api/drafts/${draftKey}`)
      .then(({ draft: d, dropped }) => {
        if (cancelled) return;
        if (d) {
          const restoredRefs: Ref[] = [];
          for (const r of d.refs ?? []) {
            restoredRefs.push({
              id: crypto.randomUUID(),
              kind: r.kind,
              // Drafts from before labels existed get them in attach order.
              label: r.label ?? nextLabel(restoredRefs, r.kind),
              name: r.name,
              value: r.uri,
              target: r.target,
              mime: r.mime,
              size: r.size,
              duration: r.duration,
              preview: previewUrl(r.uri),
            });
          }
          setRefs(restoredRefs);
          setExtendMode(Boolean(d.extendMode));
          setPinned(Boolean(d.pinned));
          if (d.familyId && !opts.lockFamily) setFamilyId(d.familyId);
          if (d.modelKey) {
            pending.current = { variant: d.variant, values: d.values };
            valuesRef.current = (d.values ?? {}) as FormValues;
            setModelKey(d.modelKey);
          }
        }
        if (dropped.length) {
          toast.warning(`${dropped.length === 1 ? "A reference was" : `${dropped.length} references were`} removed from your draft.`, {
            description: `No longer in the local library: ${dropped.join(", ")}`,
          });
        }
      })
      .catch(() => {
        // No draft — start fresh.
      })
      .finally(() => {
        if (!cancelled) setRestored(true);
      });
    return () => {
      cancelled = true;
    };
  }, [draftKey, opts.lockFamily]);

  // First model. Family pages: last used family (or the default model's); others: last used model.
  useEffect(() => {
    if (!restored) return;
    // Tool pages start on the tool's first engine (Suno voice: step 1), not on routing.
    if (opts.lockFamily) {
      const f = families.find((x) => x.id === opts.lockFamily);
      if (!f || modelKey) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time pick after the catalog loads
      setPinned(true);
      setModelKey(f.entries[0].key);
      return;
    }
    if (mode.families) {
      if ((familyId && families.some((f) => f.id === familyId)) || !families.length) return;
      const recent = readRecentFamilies(mode.id).find((id) => families.some((f) => f.id === id));
      const byDefault = families.find((f) => f.members.includes(mode.defaultModel));
      setFamilyId(recent ?? byDefault?.id ?? families[0].id);
      return;
    }
    if (modelKey) return;
    setModelKey(readRecent(mode.id)[0] ?? mode.defaultModel);
  }, [mode, modelKey, familyId, families, restored, opts.lockFamily]);

  useEffect(() => {
    if (!modelKey) return;
    let cancelled = false;
    api<CatalogModel>(`/api/catalog/${modelKey.split("/").map(encodeURIComponent).join("/")}`)
      .then((m) => {
        if (cancelled) return;
        const p = pending.current;
        pending.current = null;
        const vi = p?.pickVariant ? p.pickVariant(m) : Math.max(0, m.variants.findIndex((v) => v.title === p?.variant));
        const schema = m.variants[vi].schema;
        const layout = layoutFields(schema);
        const base: FormValues = defaultsFor(schema);
        for (const c of layout.core) {
          const v = initialChipValue(c);
          if (v !== undefined && base[c.name] === undefined) base[c.name] = v;
        }
        // Carried-over values: only documented, non-reference fields with a value this model accepts.
        const refNames = new Set(layout.refFields.map((r) => r.name));
        for (const [k, v] of Object.entries(p?.values ?? {})) {
          const prop = schema.properties?.[k];
          if (prop && !refNames.has(k) && v !== undefined && toZod(prop).safeParse(v).success) base[k] = v as FormValue;
        }
        setModel(m);
        setVariantIdx(vi);
        setValues(base);
        setIssues({});
        setSubmitError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        // A stale recent key (catalog changed) falls back to the default.
        if (e instanceof ApiError && e.status === 404 && modelKey !== mode.defaultModel) setModelKey(mode.defaultModel);
      });
    return () => {
      cancelled = true;
    };
  }, [modelKey, mode.defaultModel]);

  const variant = model?.variants[variantIdx] ?? null;
  const layout = useMemo(() => (variant ? layoutFields(variant.schema) : null), [variant]);

  // Assign each reference to a field, then drop the ones the docs' size/format limits reject.
  // Files still being saved keep their place in the list but are not assigned yet.
  const assigned: Ref[] = useMemo(() => {
    if (!layout) return refs;
    const ready = assignTargets(
      refs.filter((r) => !r.saving),
      layout.refFields,
    ).map((r) => {
      const f = layout.refFields.find((x) => x.name === r.target);
      const problem = f ? fileProblem({ name: r.name, type: r.mime, size: r.size }, f) : null;
      return problem ? { ...r, target: null, problem } : { ...r, problem: undefined };
    });
    return refs.map((r) => ready.find((x) => x.id === r.id) ?? { ...r, target: null });
  }, [refs, layout]);

  const switchModel = useCallback(
    (key: string, init?: Pending) => {
      pending.current = init ?? { values: valuesRef.current };
      setModel(null);
      setModelKey(key);
    },
    [],
  );

  // Family routing: the concrete model follows what is attached (unless a variant is pinned).
  const routed = useMemo(() => (family && !pinned ? resolveMember(family, counts, extendMode) : null), [family, pinned, counts, extendMode]);
  useEffect(() => {
    // After the draft is restored, so a restored model isn't overridden. Tool pages pick engines by hand.
    if (!restored || opts.lockFamily || !mode.families || !routed || routed.key === modelKey) return;
    const wantsVideo = counts.video > 0;
    switchModel(routed.key, {
      values: valuesRef.current,
      // Extend: models with a "Video" variant use it when a video is attached.
      pickVariant: (m) => {
        if (!extendMode && !wantsVideo) return 0;
        const i = m.variants.findIndex((v) => layoutFields(v.schema).refFields.some((f) => f.kinds.includes("video")));
        return wantsVideo && i >= 0 ? i : Math.max(0, m.variants.findIndex((v) => layoutFields(v.schema).refFields.length === 0));
      },
    });
  }, [restored, opts.lockFamily, mode.families, routed, modelKey, counts.video, extendMode, switchModel]);

  /** Why routing found nothing for the attachments ("PixVerse V6 doesn't take audio"). */
  const routeProblem = useMemo(() => {
    if (!mode.families || !family || pinned || extendMode) return null;
    if (resolveMember(family, counts, false)) return null;
    const kind = (["audio", "video", "image"] as RefKind[]).find((k) => counts[k] > 0);
    return kind ? `${family.name} doesn't take ${kind}. Remove it or pick another model.` : null;
  }, [mode.families, family, pinned, extendMode, counts]);

  const selectFamily = useCallback(
    (id: string) => {
      pushList(RECENT_FAMILY_KEY(mode.id), id);
      setPinned(false);
      setExtendMode(false);
      setFamilyId(id);
    },
    [mode.id],
  );

  /** Choose one exact catalog entry ("Show all variants"): routing is turned off. */
  const pinModel = useCallback(
    (key: string) => {
      const f = families.find((x) => x.members.includes(key));
      if (f) {
        setFamilyId(f.id);
        pushList(RECENT_FAMILY_KEY(mode.id), f.id);
      }
      setPinned(true);
      setExtendMode(false);
      pushRecent(mode.id, key);
      if (key !== modelKey) switchModel(key);
    },
    [families, mode.id, modelKey, switchModel],
  );

  /** Legacy (non-family pages): pick a catalog entry directly. */
  const selectModel = useCallback(
    (key: string, init?: Pending) => {
      if (key === modelKey && !init) return;
      pushRecent(mode.id, key);
      switchModel(key, init);
    },
    [mode.id, modelKey, switchModel],
  );

  const selectVariant = useCallback(
    (i: number) => {
      if (!model) return;
      const schema = model.variants[i].schema;
      const l = layoutFields(schema);
      const base = defaultsFor(schema);
      for (const c of l.core) {
        const v = initialChipValue(c);
        if (v !== undefined && base[c.name] === undefined) base[c.name] = v;
      }
      for (const [k, v] of Object.entries(values)) {
        const prop = schema.properties?.[k];
        if (prop && v !== undefined && toZod(prop).safeParse(v).success) base[k] = v;
      }
      setVariantIdx(i);
      setValues(base);
      setIssues({});
    },
    [model, values],
  );

  // Same model, different input variant (PixVerse Extend: "TaskId" vs "Video"): follow the attachment.
  useEffect(() => {
    if (!mode.families || !model || model.variants.length < 2 || pinned) return;
    const withVideo = model.variants.findIndex((v) => layoutFields(v.schema).refFields.some((f) => f.kinds.includes("video")));
    const withoutRefs = model.variants.findIndex((v) => layoutFields(v.schema).refFields.length === 0);
    if (withVideo < 0 || withoutRefs < 0) return;
    const want = counts.video > 0 ? withVideo : withoutRefs;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived from attachments
    if (want !== variantIdx) selectVariant(want);
  }, [mode.families, model, pinned, counts.video, variantIdx, selectVariant]);

  const setValue = useCallback((name: string, v: FormValue) => {
    setValues((s) => ({ ...s, [name]: v }));
    setIssues((s) => {
      if (!s[name]) return s;
      const next = { ...s };
      delete next[name];
      return next;
    });
  }, []);

  // What References accepts — kinds and how many of each, read from the schema(s):
  // the whole family (routing picks the entry) or the current entry.
  const acceptsInfo = useMemo(() => {
    if (mode.families && family && !pinned && !extendMode) {
      const limits = { ...NO_LIMITS };
      for (const e of routable(family)) {
        for (const k of Object.keys(limits) as RefKind[]) limits[k] = Math.max(limits[k], e.meta.refCapacity[k]);
      }
      return { kinds: familyKinds(family), limits, name: family.name, routed: true };
    }
    // In Extend, a model with a "Video" variant also takes an uploaded video (routing switches variant).
    const variants = extendMode && model ? model.variants.map((v) => layoutFields(v.schema).refFields) : [layout?.refFields ?? []];
    const limits = { ...NO_LIMITS };
    for (const fields of variants) {
      const cap = kindCapacity(fields);
      for (const k of Object.keys(limits) as RefKind[]) limits[k] = Math.max(limits[k], cap[k]);
    }
    return {
      kinds: (Object.keys(limits) as RefKind[]).filter((k) => limits[k] > 0),
      limits,
      name: model?.title.trim() ?? "This model",
      routed: false,
    };
  }, [layout, mode.families, family, pinned, extendMode, model]);

  /** Next free label; `taken` grows so a batch gets image_1, image_2, … */
  const labelFor = useCallback(
    (taken: { kind: RefKind; label: string }[], kind: RefKind) => {
      const prompt = layout?.promptField ? String(values[layout.promptField] ?? "") : "";
      const label = nextLabel(taken, kind, prompt);
      taken.push({ kind, label });
      return label;
    },
    [layout, values],
  );

  /**
   * The one gate every new reference goes through (drop, picker, paste, Media library):
   * kind, per-kind count and — on family pages — whether some model takes the combination.
   * Rejections are reported once per reason; nothing rejected is saved or uploaded.
   */
  const evaluate = useCallback(
    <T extends { kind: RefKind | null; name: string }>(items: T[]) => {
      const c = { ...counts };
      const ok: (T & { kind: RefKind })[] = [];
      const rejected = new Map<string, string[]>();
      const reject = (why: string, name: string) => rejected.set(why, [...(rejected.get(why) ?? []), name]);
      // Too many of one kind: the whole batch of that kind is refused, so nothing half-arrives.
      const batch = { image: 0, video: 0, audio: 0 };
      for (const it of items) if (it.kind && acceptsInfo.kinds.includes(it.kind)) batch[it.kind]++;
      for (const it of items) {
        const kind = it.kind;
        if (!kind) {
          reject("Only image, video and audio files can be references.", it.name);
          continue;
        }
        if (!acceptsInfo.kinds.includes(kind)) {
          reject(`${acceptsInfo.name} doesn't take ${kind}.`, it.name);
          continue;
        }
        if (counts[kind] + batch[kind] > acceptsInfo.limits[kind]) {
          const n = acceptsInfo.limits[kind];
          reject(`${acceptsInfo.name} takes up to ${n} ${n === 1 ? kind : KIND_PLURAL[kind]}.`, it.name);
          continue;
        }
        const next = { ...c, [kind]: c[kind] + 1 };
        if (acceptsInfo.routed && family) {
          const e = resolveMember(family, next, false);
          const fits = e && (Object.keys(next) as RefKind[]).every((k) => next[k] <= e.meta.refCapacity[k]);
          if (!fits) {
            const others = (Object.keys(c) as RefKind[]).filter((k) => k !== kind && c[k] > 0);
            reject(`${acceptsInfo.name} can't use ${kind} together with ${others.join(" and ") || "these references"}.`, it.name);
            continue;
          }
        }
        Object.assign(c, next);
        ok.push(it as T & { kind: RefKind });
      }
      return { ok, rejected };
    },
    [counts, acceptsInfo, family],
  );

  const admit = useCallback(
    <T extends { kind: RefKind | null; name: string }>(items: T[]): (T & { kind: RefKind })[] => {
      const { ok, rejected } = evaluate(items);
      for (const [why, names] of rejected) {
        toast.error(why, { description: `Not added: ${names.slice(0, 3).join(", ")}${names.length > 3 ? ` and ${names.length - 3} more` : ""}` });
      }
      return ok;
    },
    [evaluate],
  );

  /** Why these items can't all be attached (null when they can). Used by the Media library. */
  const canAttach = useCallback((items: LibraryItem[]): string | null => [...evaluate(items).rejected.keys()][0] ?? null, [evaluate]);

  /** Adds files from disk or the clipboard: checked, saved to the local library, then attached. */
  const addFiles = useCallback(
    (files: File[]) => {
      const ok = admit(files.map((file) => ({ file, kind: kindOfFile(file), name: file.name })));
      if (!ok.length) return;
      const taken: { kind: RefKind; label: string }[] = [...refs];
      const placeholders: Ref[] = ok.map(({ file, kind }) => ({
        id: crypto.randomUUID(),
        kind,
        label: labelFor(taken, kind),
        name: file.name,
        value: "",
        target: null,
        mime: file.type,
        size: file.size,
        preview: URL.createObjectURL(file),
        saving: true,
      }));
      setRefs((r) => [...r, ...placeholders]);
      ok.forEach(({ file }, i) => {
        const ph = placeholders[i];
        saveLocalFile(file)
          .then((u) => {
            const uri = uploadUri(u.id);
            setRefs((r) => r.map((x) => (x.id === ph.id ? { ...x, value: uri, preview: previewUrl(uri), duration: u.duration, saving: false } : x)));
          })
          .catch((e) => {
            setRefs((r) => r.filter((x) => x.id !== ph.id));
            if (e instanceof ApiError) notifyError(e.error);
          })
          .finally(() => URL.revokeObjectURL(ph.preview));
      });
    },
    [admit, refs, labelFor],
  );

  /** Adds files already in the local library (Media library picks, "Use as reference"). */
  const addLibrary = useCallback(
    (items: LibraryItem[]) => {
      const ok = admit(items);
      if (!ok.length) return;
      // Labels are picked here, not inside the state updater (React may call updaters twice).
      const taken: { kind: RefKind; label: string }[] = [...refs];
      const added: Ref[] = ok.map((it) => ({
        id: crypto.randomUUID(),
        kind: it.kind,
        label: labelFor(taken, it.kind),
        name: it.name,
        value: it.uri,
        target: null,
        mime: it.mime,
        size: it.size,
        duration: it.duration,
        preview: previewUrl(it.uri),
      }));
      setRefs((r) => [...r, ...added]);
    },
    [admit, refs, labelFor],
  );

  const removeRef = useCallback((id: string) => setRefs((r) => r.filter((x) => x.id !== id)), []);
  const clearRefs = useCallback(() => setRefs([]), []);
  const setRefTarget = useCallback((id: string, target: string) => setRefs((r) => r.map((x) => (x.id === id ? { ...x, target } : x))), []);

  /** Labels of the references that are ready, for prompt chips. */
  const promptRefs: PromptRef[] = useMemo(
    () => assigned.filter((r) => !r.saving && r.value).map((r) => ({ label: r.label, kind: r.kind, uri: r.value })),
    [assigned],
  );

  /** Chips → the model's token or words; the same function runs on the server at submit. */
  const promptInfo = useMemo(() => {
    if (!layout || !variant) return { hint: null, problems: [] as string[] };
    const merged = mergeRefs(values as Record<string, unknown>, assigned.filter((r) => !r.saving), layout.refFields);
    const { hint, problems } = serializePrompt(merged, variant.schema, model?.promptReferenceSyntax, promptRefs);
    return { hint, problems };
  }, [layout, variant, values, assigned, model, promptRefs]);

  /**
   * Request input as it would be sent: chips serialized, local references still local://
   * (the server uploads them at submit).
   */
  const preview = useCallback(async (): Promise<Record<string, unknown>> => {
    if (!layout || !variant) return {};
    const merged = mergeRefs(values as Record<string, unknown>, assigned.filter((r) => !r.saving), layout.refFields) as FormValues;
    const input = (pruneEmpty(await mapFiles(merged, async () => PENDING_UPLOAD)) ?? {}) as Record<string, unknown>;
    return serializePrompt(input, variant.schema, model?.promptReferenceSyntax, promptRefs).input;
  }, [values, assigned, layout, variant, model, promptRefs]);

  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  useEffect(() => {
    if (!model) return;
    let cancelled = false;
    void preview().then((v) => {
      if (!cancelled) setEstimate(estimateCost(model.pricing, v, model.free));
    });
    return () => {
      cancelled = true;
    };
  }, [model, preview]);

  const historyAverage = useMemo(() => {
    if (!model) return null;
    const runs = opts.history.filter((t) => t.modelKey === model.key && t.creditsConsumed !== null);
    if (!runs.length) return null;
    return Math.round((runs.reduce((n, t) => n + t.creditsConsumed!, 0) / runs.length) * 100) / 100;
  }, [model, opts.history]);

  const submit = useCallback(
    async (confirmed: boolean) => {
      if (!model || !variant || !layout || busy.current) return;
      setSubmitError(null);
      setIssues({});
      if (routeProblem) {
        toast.error(routeProblem);
        return;
      }
      if (assigned.some((r) => r.saving)) {
        toast.error("References are still being saved.", { description: "Try again in a moment." });
        return;
      }
      if (promptInfo.problems.length) {
        const p = promptInfo.problems[0];
        toast.error(`${p}.`, { description: "Remove it from the prompt or attach it again." });
        return;
      }
      const rejected = assigned.find((r) => r.problem);
      if (rejected) {
        toast.error("A reference doesn't meet this model's limits.", { description: rejected.problem });
        return;
      }
      const input = await preview();
      const check = validateInput(variant.schema, input);
      if (!check.ok) {
        const map = Object.fromEntries(check.issues.map((i) => [i.path.split(".")[0], i.message]));
        setIssues(map);
        const missingRef = layout.refFields.find((r) => map[r.name]);
        if (missingRef) {
          const word = KIND_WORD[missingRef.kinds[0]];
          toast.error(`This model needs ${word}.`, { description: "Add one in References." });
        } else if (map[layout.promptField ?? ""]) {
          toast.error("Write a prompt first.", { description: "Describe what you want to see." });
        } else {
          toast.error("Some settings need attention.", { description: Object.keys(map).map((k) => k.replace(/_/g, " ")).join(", ") });
        }
        return;
      }
      const est = estimateCost(model.pricing, check.value, model.free);
      if (!confirmed && needsConfirmation(model.category, est)) {
        setConfirm(est);
        return;
      }
      setConfirm(null);
      busy.current = true;
      const idempotencyKey = crypto.randomUUID();
      try {
        let merged = mergeRefs(values as Record<string, unknown>, assigned, layout.refFields) as FormValues;
        // Files picked in Advanced fields join the local library like every other reference.
        if (hasFile(merged)) merged = (await mapFiles(merged, async (f) => uploadUri((await saveLocalFile(f.file)).id))) as FormValues;
        // The server uploads local references to Kie.ai right before createTask (uploads expire after 24 h).
        setPhase(collectLocalUris(merged).length ? "uploading" : "submitting");
        const r = await api<{ task: TaskRecord }>(
          "/api/generate",
          // The prompt keeps its chips; the server serializes them using `references`.
          postJson({ modelKey: model.key, variant: variant.title, input: pruneEmpty(merged) ?? {}, idempotencyKey, confirmed: true, references: promptRefs }),
        );
        pushRecent(mode.id, model.key);
        if (familyId) pushList(RECENT_FAMILY_KEY(mode.id), familyId);
        opts.onSubmitted(r.task);
        if (r.task.error) notifyError(r.task.error);
        void refreshCredits();
      } catch (e) {
        if (e instanceof ApiError) {
          setSubmitError(e.error);
          notifyError(e.error);
          const list = e.body.issues as { path: string; message: string }[] | undefined;
          if (list) setIssues(Object.fromEntries(list.map((i) => [i.path.split(".")[0], i.message])));
        }
      } finally {
        busy.current = false;
        setPhase("idle");
      }
    },
    [model, variant, layout, preview, values, assigned, mode.id, opts, refreshCredits, routeProblem, familyId, promptInfo, promptRefs],
  );

  // Keep the draft (per page) so a reload brings everything back: saved 400 ms after the
  // last change, and right away when the page is closed or reloaded.
  const pendingDraft = useRef<string | null>(null);
  useEffect(() => {
    if (!restored) return;
    const refNames = new Set(layout?.refFields.map((f) => f.name));
    const draft: Draft = {
      familyId,
      pinned,
      modelKey,
      variant: variant?.title ?? null,
      extendMode,
      values: Object.fromEntries(Object.entries(values).filter(([k, v]) => !refNames.has(k) && v !== undefined && !hasFile(v))),
      refs: refs
        .filter((r) => !r.saving && r.value)
        .map((r) => ({ uri: r.value, kind: r.kind, label: r.label, name: r.name, mime: r.mime, size: r.size, duration: r.duration ?? null, target: r.target })),
    };
    const body = JSON.stringify(draft);
    pendingDraft.current = body;
    const t = setTimeout(() => {
      pendingDraft.current = null;
      void fetch(`/api/drafts/${draftKey}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [restored, draftKey, familyId, pinned, modelKey, variant, extendMode, values, refs, layout]);
  useEffect(() => {
    const flush = () => {
      const body = pendingDraft.current;
      if (!body) return;
      pendingDraft.current = null;
      // keepalive lets the request finish while the page unloads.
      void fetch(`/api/drafts/${draftKey}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
    };
  }, [draftKey]);

  /** "Reuse prompt": same model, variant and settings; references are not reused (uploads expire). */
  const reuse = useCallback(
    (task: TaskRecord) => {
      setRefs([]);
      setExtendMode(false);
      if (mode.families) {
        const f = families.find((x) => x.members.includes(task.modelKey));
        if (f) setFamilyId(f.id);
        setPinned(true);
      }
      pushRecent(mode.id, task.modelKey);
      pending.current = { variant: task.variant, values: task.input };
      setModel(null);
      if (task.modelKey === modelKey) setModelKey(null);
      setTimeout(() => {
        pending.current = { variant: task.variant, values: task.input };
        setModelKey(task.modelKey);
      }, 0);
      const hadRefs = Object.values(task.input).some(
        (v) => (typeof v === "string" && /^https?:\/\//.test(v)) || (Array.isArray(v) && v.some((x) => typeof x === "string" && /^https?:\/\//.test(x))),
      );
      toast.success("Prompt and settings restored.", {
        description: hadRefs ? "Re-attach references from the Media library." : undefined,
      });
    },
    [mode.id, mode.families, families, modelKey],
  );

  return {
    model,
    modelKey,
    variant,
    variantIdx,
    layout,
    values,
    refs: assigned,
    counts,
    issues,
    phase,
    submitError,
    confirm,
    estimate,
    historyAverage,
    families,
    family,
    pinned,
    extendMode,
    routeProblem,
    accepts: acceptsInfo,
    promptHint: promptInfo.hint,
    promptProblems: promptInfo.problems,
    setExtendMode,
    setConfirm,
    selectFamily,
    pinModel,
    selectModel,
    selectVariant,
    setValue,
    setValues,
    addFiles,
    addLibrary,
    canAttach,
    removeRef,
    clearRefs,
    setRefTarget,
    preview,
    submit,
    reuse,
  };
}

export type Generator = ReturnType<typeof useGenerator>;
