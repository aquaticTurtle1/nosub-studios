"use client";

import { useEffect, useState } from "react";
import type { CatalogSummary } from "@/lib/catalog/types";
import { api } from "@/components/studio/api";

let cache: Promise<CatalogSummary[]> | null = null;

/** All catalog summaries, fetched once per page load. */
export function useCatalog(): CatalogSummary[] {
  const [models, setModels] = useState<CatalogSummary[]>([]);
  useEffect(() => {
    cache ??= api<{ models: CatalogSummary[] }>("/api/catalog").then((r) => r.models);
    let alive = true;
    void cache.then((m) => alive && setModels(m)).catch(() => (cache = null));
    return () => {
      alive = false;
    };
  }, []);
  return models;
}
