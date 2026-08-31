"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import {
  addCartItem,
  cartCurrency,
  cartItemCount,
  cartSubtotal,
  reduceCartItem,
  updateCartItem,
} from "@/lib/cart/mutate";
import { savePersistedCart } from "@/lib/cart/persistence";
import {
  cartItemToStockSource,
  maxQuantity,
  remainingCapacity as remainingCapacityFor,
} from "@/lib/cart/stock";
import type {
  CartErrorCode,
  CartItem,
  CartStockSource,
} from "@/lib/cart/types";
import type { Category, PaginationMeta, Product } from "@/lib/catalog/types";
import {
  DEFAULT_PRODUCT_QUERY,
  type ProductQuery,
} from "@/lib/catalog/product-query";
import type { StorefrontConfig } from "@/lib/storefront/types";

export type { CartErrorCode, CartItem, CartStockSource };

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

  cartItems: CartItem[];
  cartError: CartErrorCode | null;
  cartErrorProductId: string | null;
  cartHydrated: boolean;

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

  hydrateCart: (items: CartItem[]) => void;
  addToCart: (product: CartStockSource, quantity?: number) => void;
  reduceFromCart: (productId: string) => void;
  updateCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  clearCartError: () => void;
  remainingCapacity: (product: CartStockSource) => number | null;
  cartMaxQuantity: (productId: string) => number | null;
  cartQuantityFor: (productId: string) => number;
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

function resolveStockSource(
  state: StorefrontState,
  productId: string,
): CartStockSource | undefined {
  if (state.product?.id === productId) return state.product;
  const listed = state.products.find((product) => product.id === productId);
  if (listed) return listed;
  const item = state.cartItems.find((entry) => entry.product_id === productId);
  return item ? cartItemToStockSource(item) : undefined;
}

export function selectCartCount(state: StorefrontState): number {
  return cartItemCount(state.cartItems);
}

export function selectCartSubtotal(state: StorefrontState): number {
  return cartSubtotal(state.cartItems);
}

export function selectCartCurrency(state: StorefrontState): string {
  return cartCurrency(state.cartItems);
}

export function selectCartErrorMessage(
  state: StorefrontState,
  productId?: string,
): string | null {
  if (!state.cartError) return null;
  if (productId && state.cartErrorProductId !== productId) return null;
  if (state.cartError === "unavailable") {
    return "This product is not available.";
  }
  if (state.cartError === "insufficient_stock") {
    return "You cannot add more than what is in stock.";
  }
  return null;
}

export function createStorefrontStore(
  initial: StorefrontStoreInput,
): StorefrontStore {
  return createStore<StorefrontState>()((set, get) => {
    const persistItems = (items: CartItem[]) => {
      savePersistedCart(get().config.tcpos_subdomain, items);
    };

    return {
      config: initial.config,
      locale: initial.locale,
      hostname: initial.hostname,
      ...emptyCatalog(),

      cartItems: [],
      cartError: null,
      cartErrorProductId: null,
      cartHydrated: false,

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

      hydrateCart: (items) =>
        set({
          cartItems: items,
          cartHydrated: true,
          cartError: null,
          cartErrorProductId: null,
        }),

      addToCart: (product, quantity = 1) => {
        const result = addCartItem(get().cartItems, product, quantity);
        persistItems(result.items);
        set({
          cartItems: result.items,
          cartError: result.error,
          cartErrorProductId: result.error ? product.id : null,
        });
      },

      reduceFromCart: (productId) => {
        const result = reduceCartItem(get().cartItems, productId);
        persistItems(result.items);
        set({
          cartItems: result.items,
          cartError: result.error,
          cartErrorProductId: result.error ? productId : null,
        });
      },

      updateCart: (productId, quantity) => {
        const source = resolveStockSource(get(), productId);
        const result = updateCartItem(
          get().cartItems,
          productId,
          quantity,
          source,
        );
        persistItems(result.items);
        set({
          cartItems: result.items,
          cartError: result.error,
          cartErrorProductId: result.error ? productId : null,
        });
      },

      removeFromCart: (productId) => {
        const result = updateCartItem(get().cartItems, productId, 0);
        persistItems(result.items);
        set({
          cartItems: result.items,
          cartError: null,
          cartErrorProductId: null,
        });
      },

      clearCart: () => {
        persistItems([]);
        set({
          cartItems: [],
          cartError: null,
          cartErrorProductId: null,
        });
      },

      clearCartError: () => set({ cartError: null, cartErrorProductId: null }),

      remainingCapacity: (product) =>
        remainingCapacityFor(get().cartItems, product),

      cartMaxQuantity: (productId) => {
        const source = resolveStockSource(get(), productId);
        return source ? maxQuantity(source) : 0;
      },

      cartQuantityFor: (productId) =>
        get().cartItems.find((item) => item.product_id === productId)
          ?.quantity ?? 0,
    };
  });
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
