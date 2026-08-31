"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { StorefrontConfig } from "@/lib/storefront/types";

export type StorefrontState = {
  config: StorefrontConfig;
  locale: string;
  hostname: string;
};

export type StorefrontStore = StoreApi<StorefrontState>;

export function createStorefrontStore(initial: StorefrontState): StorefrontStore {
  return createStore<StorefrontState>()(() => initial);
}

export const StorefrontStoreContext = createContext<StorefrontStore | null>(
  null,
);

export function useStorefrontStore<T>(
  selector: (state: StorefrontState) => T,
): T {
  const store = useContext(StorefrontStoreContext);
  if (!store) {
    throw new Error("useStorefrontStore must be used within StorefrontProvider");
  }
  return useStore(store, selector);
}
