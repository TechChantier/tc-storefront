"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { loadPersistedCart } from "@/lib/cart/persistence";
import type { StorefrontConfig } from "@/lib/storefront/types";
import {
  createStorefrontStore,
  StorefrontStoreContext,
} from "./storefront-store";

type StorefrontProviderProps = {
  config: StorefrontConfig;
  locale: string;
  hostname: string;
  children: ReactNode;
};

export function StorefrontProvider({
  config,
  locale,
  hostname,
  children,
}: StorefrontProviderProps) {
  const [store] = useState(() =>
    createStorefrontStore({ config, locale, hostname }),
  );

  useLayoutEffect(() => {
    store
      .getState()
      .hydrateCart(loadPersistedCart(config.tcpos_subdomain));
  }, [store, config.tcpos_subdomain]);

  return (
    <StorefrontStoreContext.Provider value={store}>
      {children}
    </StorefrontStoreContext.Provider>
  );
}
