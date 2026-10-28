"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/catalog/types";
import type { SerializedKieError } from "@/lib/kie/errors";
import type { KeySource } from "@/lib/server/key";
import { api, ApiError } from "./api";

interface Credits {
  balance: number | null;
  error: SerializedKieError | null;
  checkedAt: number | null;
  loading: boolean;
}

interface StudioState {
  keySource: KeySource;
  keyLoaded: boolean;
  credits: Credits;
  category: Category;
  setCategory: (c: Category) => void;
  refreshKey: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const Ctx = createContext<StudioState | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [keySource, setKeySource] = useState<KeySource>(null);
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [category, setCategory] = useState<Category>("image");
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
    () => ({ keySource, keyLoaded, credits, category, setCategory, refreshKey, refreshCredits }),
    [keySource, keyLoaded, credits, category, refreshKey, refreshCredits],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStudio outside StudioProvider");
  return v;
}
