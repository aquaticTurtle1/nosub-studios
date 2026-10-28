"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SerializedKieError } from "@/lib/kie/errors";
import type { KeySource } from "@/lib/server/key";
import type { TaskRecord } from "@/lib/task-types";
import type { LibraryItem } from "@/components/app/generation/use-generator";
import { api, ApiError } from "./api";

interface Credits {
  balance: number | null;
  error: SerializedKieError | null;
  checkedAt: number | null;
  loading: boolean;
}

export interface Handoff {
  mode: "image" | "video" | "audio" | "tools";
  /** Local files to attach (uploads or generated outputs). */
  items: LibraryItem[];
  /** "Reuse prompt" from another page. */
  reuse?: TaskRecord;
  /** Prefer a model with this operation when attaching (e.g. "image-to-video"). */
  operation?: string;
  /** Explore: open the page on this family (lib/catalog/families.ts). */
  family?: string;
  /** Explore: add this prompt helper (lib/presets.ts). */
  preset?: string;
  /** Explore: open the Media library right away ("Animate a photo"). */
  openLibrary?: boolean;
}

interface StudioState {
  keySource: KeySource;
  keyLoaded: boolean;
  credits: Credits;
  /** Files handed from one page to another ("Animate", "Use as reference"), consumed once. */
  handoff: Handoff | null;
  setHandoff: (h: Handoff | null) => void;
  refreshKey: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const Ctx = createContext<StudioState | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [keySource, setKeySource] = useState<KeySource>(null);
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [credits, setCredits] = useState<Credits>({ balance: null, error: null, checkedAt: null, loading: false });

  const refreshCredits = useCallback(async () => {
    setCredits((c) => ({ ...c, loading: true }));
    try {
      const r = await api<{ balance: number; checkedAt: number }>("/api/credits");
      setCredits({ balance: r.balance, error: null, checkedAt: r.checkedAt, loading: false });
    } catch (e) {
      setCredits({ balance: null, error: e instanceof ApiError ? e.error : null, checkedAt: Date.now(), loading: false });
    }
  }, []);

  const refreshKey = useCallback(async () => {
    const r = await api<{ configured: boolean; source: KeySource }>("/api/key");
    setKeySource(r.source);
    setKeyLoaded(true);
    if (r.configured) await refreshCredits();
    else setCredits({ balance: null, error: null, checkedAt: null, loading: false });
  }, [refreshCredits]);

  useEffect(() => {
    // Initial load from the server; setState happens after the awaited fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshKey();
  }, [refreshKey]);

  const value = useMemo(
    () => ({ keySource, keyLoaded, credits, handoff, setHandoff, refreshKey, refreshCredits }),
    [keySource, keyLoaded, credits, handoff, refreshKey, refreshCredits],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStudio outside StudioProvider");
  return v;
}
