"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { Category, PaginationMeta, Product } from "@/lib/catalog/types";
import {
  DEFAULT_PRODUCT_QUERY,
  type ProductQuery,
} from "@/lib/catalog/product-query";
import type { StorefrontConfig } from "@/lib/storefront/types";

export type CatalogStatus =
  | "idle"
  | "ok"
  | "not_found"
  | "unavailable"
  | "invalid"
  | "invalid_locale"
  | "redirect";

export type StorefrontState = {
  config: StorefrontConfig;
  locale: string;
  hostname: string;

  products: Product[];
  productsMeta: PaginationMeta | null;
  productsQuery: ProductQuery;
  productsStatus: CatalogStatus;

  product: Product | null;
  productStatus: CatalogStatus;

  categories: Category[];
  categoriesStatus: CatalogStatus;

  category: Category | null;
  categoryStatus: CatalogStatus;

  hydrateProducts: (payload: {
    products: Product[];
    meta: PaginationMeta | null;
    query?: ProductQuery;
    status: CatalogStatus;
  }) => void;
  hydrateProduct: (payload: {
    product: Product | null;
    status: CatalogStatus;
  }) => void;
  hydrateCategories: (payload: {
    categories: Category[];
    status: CatalogStatus;
  }) => void;
  hydrateCategory: (payload: {
    category: Category | null;
    status: CatalogStatus;
  }) => void;
  setProductsQuery: (query: ProductQuery) => void;
};

export type StorefrontStore = StoreApi<StorefrontState>;

type StorefrontStoreInput = {
  config: StorefrontConfig;
  locale: string;
  hostname: string;
};

function emptyCatalog() {
  return {
    products: [] as Product[],
    productsMeta: null as PaginationMeta | null,
    productsQuery: DEFAULT_PRODUCT_QUERY,
    productsStatus: "idle" as CatalogStatus,
    product: null as Product | null,
    productStatus: "idle" as CatalogStatus,
    categories: [] as Category[],
    categoriesStatus: "idle" as CatalogStatus,
    category: null as Category | null,
    categoryStatus: "idle" as CatalogStatus,
  };
}

export function createStorefrontStore(
  initial: StorefrontStoreInput,
): StorefrontStore {
  return createStore<StorefrontState>()((set) => ({
    config: initial.config,
    locale: initial.locale,
    hostname: initial.hostname,
    ...emptyCatalog(),

    hydrateProducts: ({ products, meta, query, status }) =>
      set((state) => ({
        products,
        productsMeta: meta,
        productsStatus: status,
        productsQuery: query ?? state.productsQuery,
      })),

    hydrateProduct: ({ product, status }) =>
      set({ product, productStatus: status }),

    hydrateCategories: ({ categories, status }) =>
      set({ categories, categoriesStatus: status }),

    hydrateCategory: ({ category, status }) =>
      set({ category, categoryStatus: status }),

    setProductsQuery: (query) => set({ productsQuery: query }),
  }));
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
