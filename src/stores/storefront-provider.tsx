"use client";

import { useState, type ReactNode } from "react";
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

  return (
    <StorefrontStoreContext.Provider value={store}>
      {children}
    </StorefrontStoreContext.Provider>
  );
}
