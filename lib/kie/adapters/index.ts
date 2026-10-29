import type { Family } from "@/lib/catalog/types";
import { marketAdapter } from "./market";
import { omniAssetAdapter } from "./omni-asset";
import { sunoRecoveryAdapter } from "./suno-recovery";
import type { ProviderAdapter } from "./types";

const ADAPTERS: Record<Family, ProviderAdapter> = {
  market: marketAdapter,
  "omni-asset": omniAssetAdapter,
  "suno-recovery": sunoRecoveryAdapter,
};

export function adapterFor(family: Family): ProviderAdapter {
  return ADAPTERS[family];
}
