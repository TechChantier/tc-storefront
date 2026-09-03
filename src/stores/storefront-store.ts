"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import {
  addCartItem,
  applyCartPriceChanges,
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
} from "@/lib/types/cart";
import type {
  Category,
  PaginationMeta,
  Product,
  ProductQuery,
} from "@/lib/types/catalog";
import { DEFAULT_PRODUCT_QUERY } from "@/lib/queries/product-query";
import { createOrder } from "@/lib/order/create-order";
import {
  buildOrderPayload,
  EMPTY_CHECKOUT_FORM,
  laravelFieldsToFormFields,
  orderPayloadHash,
} from "@/lib/order/payload";
import { flattenZodFieldErrors, MAX_ORDER_ITEMS, parseCheckoutForm } from "@/lib/schemas/order";
import type {
  CheckoutForm,
  OrderError,
  OrderResult,
  OrderStatus,
} from "@/lib/types/order";
import type { StorefrontConfig } from "@/lib/types/storefront";

export type { CartErrorCode, CartItem, CartStockSource };
export type { CheckoutForm, OrderError, OrderResult, OrderStatus };

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

  featuredProducts: Product[];
  featuredStatus: CatalogStatus;

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
  hydrateFeaturedProducts: (payload: {
    products: Product[];
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

  checkoutForm: CheckoutForm;
  checkoutErrors: Record<string, string>;
  orderStatus: OrderStatus;
  orderResult: OrderResult | null;
  orderError: OrderError | null;
  orderIdempotencyKey: string | null;
  orderIdempotencyHash: string | null;

  setCheckoutField: <K extends keyof CheckoutForm>(
    field: K,
    value: CheckoutForm[K],
  ) => void;
  setCheckoutForm: (form: Partial<CheckoutForm>) => void;
  placeOrder: () => Promise<void>;
  confirmUpdatedPrices: () => Promise<void>;
  resetOrder: () => void;
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
    featuredProducts: [] as Product[],
    featuredStatus: "idle" as CatalogStatus,
  };
}

function resolveStockSource(
  state: StorefrontState,
  productId: string,
): CartStockSource | undefined {
  if (state.product?.id === productId) return state.product;
  const listed = state.products.find((product) => product.id === productId);
  if (listed) return listed;
  const featured = state.featuredProducts.find(
    (product) => product.id === productId,
  );
  if (featured) return featured;
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

export function selectCheckoutFieldError(
  state: StorefrontState,
  field: string,
): string | undefined {
  return state.checkoutErrors[field];
}

export function selectCanPlaceOrder(state: StorefrontState): boolean {
  return (
    state.cartHydrated &&
    state.cartItems.length > 0 &&
    state.cartItems.length <= MAX_ORDER_ITEMS &&
    state.orderStatus !== "submitting" &&
    state.orderStatus !== "success"
  );
}

const HASH_PLACEHOLDER_KEY = "00000000-0000-4000-8000-000000000000";

export function createStorefrontStore(
  initial: StorefrontStoreInput,
): StorefrontStore {
  return createStore<StorefrontState>()((set, get) => {
    const persistItems = (items: CartItem[]) => {
      savePersistedCart(get().config.tcpos_subdomain, items);
    };

    const resetOrderIfComplete = () => {
      if (get().orderStatus !== "success") return {};
      return {
        orderStatus: "idle" as const,
        orderResult: null,
        orderError: null,
        orderIdempotencyKey: null,
        orderIdempotencyHash: null,
      };
    };

    const submitOrder = async () => {
      const state = get();
      if (state.orderStatus === "submitting") return;

      if (state.cartItems.length === 0) {
        set({
          orderStatus: "error",
          orderResult: null,
          orderError: {
            code: "CART_EMPTY",
            message: "Your cart is empty.",
          },
        });
        return;
      }

      if (state.cartItems.length > MAX_ORDER_ITEMS) {
        set({
          orderStatus: "error",
          orderResult: null,
          orderError: {
            code: "CART_TOO_LARGE",
            message: `Orders can include at most ${MAX_ORDER_ITEMS} products.`,
          },
        });
        return;
      }

      const formParsed = parseCheckoutForm(state.checkoutForm);
      if (!formParsed.success) {
        set({
          checkoutErrors: flattenZodFieldErrors(formParsed.error),
          orderStatus: "error",
          orderResult: null,
          orderError: {
            code: "VALIDATION_ERROR",
            message: "Check the highlighted fields and try again.",
            fields: flattenZodFieldErrors(formParsed.error),
          },
        });
        return;
      }

      const hashed = buildOrderPayload({
        form: state.checkoutForm,
        items: state.cartItems,
        locale: state.locale,
        idempotencyKey: HASH_PLACEHOLDER_KEY,
      });
      if (!hashed.ok) {
        set({
          orderStatus: "error",
          orderResult: null,
          orderError: {
            code: "VALIDATION_ERROR",
            message: "Check the highlighted fields and try again.",
          },
        });
        return;
      }

      const hash = orderPayloadHash(hashed.payload);
      const idempotencyKey =
        state.orderIdempotencyKey && state.orderIdempotencyHash === hash
          ? state.orderIdempotencyKey
          : crypto.randomUUID();

      const built = buildOrderPayload({
        form: state.checkoutForm,
        items: state.cartItems,
        locale: state.locale,
        idempotencyKey,
      });
      if (!built.ok) {
        set({
          orderStatus: "error",
          orderResult: null,
          orderError: {
            code: "VALIDATION_ERROR",
            message: "Check the highlighted fields and try again.",
          },
        });
        return;
      }

      set({
        checkoutErrors: {},
        orderStatus: "submitting",
        orderError: null,
        orderIdempotencyKey: idempotencyKey,
        orderIdempotencyHash: hash,
      });

      try {
        const result = await createOrder({
          hostname: get().hostname,
          payload: built.payload,
        });

        if (result.status === "ok") {
          persistItems([]);
          set({
            cartItems: [],
            cartError: null,
            cartErrorProductId: null,
            orderStatus: "success",
            orderResult: result.data,
            orderError: null,
            orderIdempotencyKey: null,
            orderIdempotencyHash: null,
          });
          return;
        }

        const formFields = laravelFieldsToFormFields(result.error.fields);
        set({
          checkoutErrors: formFields,
          orderStatus: "error",
          orderResult: null,
          orderError: result.error,
        });
      } catch {
        set({
          orderStatus: "error",
          orderResult: null,
          orderError: {
            code: "UNAVAILABLE",
            message: "Unable to place the order right now.",
          },
        });
      }
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
      checkoutForm: EMPTY_CHECKOUT_FORM,
      checkoutErrors: {},
      orderStatus: "idle",
      orderResult: null,
      orderError: null,
      orderIdempotencyKey: null,
      orderIdempotencyHash: null,

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

      hydrateFeaturedProducts: ({ products, status }) =>
        set({ featuredProducts: products, featuredStatus: status }),

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
          ...resetOrderIfComplete(),
          cartItems: result.items,
          cartError: result.error,
          cartErrorProductId: result.error ? product.id : null,
        });
      },

      reduceFromCart: (productId) => {
        const result = reduceCartItem(get().cartItems, productId);
        persistItems(result.items);
        set({
          ...resetOrderIfComplete(),
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
          ...resetOrderIfComplete(),
          cartItems: result.items,
          cartError: result.error,
          cartErrorProductId: result.error ? productId : null,
        });
      },

      removeFromCart: (productId) => {
        const result = updateCartItem(get().cartItems, productId, 0);
        persistItems(result.items);
        set({
          ...resetOrderIfComplete(),
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

      setCheckoutField: (field, value) =>
        set((state) => {
          const checkoutErrors = { ...state.checkoutErrors };
          delete checkoutErrors[field];
          return {
            checkoutForm: { ...state.checkoutForm, [field]: value },
            checkoutErrors,
          };
        }),

      setCheckoutForm: (form) =>
        set((state) => ({
          checkoutForm: { ...state.checkoutForm, ...form },
        })),

      placeOrder: () => submitOrder(),

      confirmUpdatedPrices: async () => {
        const changes = get().orderError?.priceChanges ?? [];
        const items = applyCartPriceChanges(get().cartItems, changes);
        persistItems(items);
        set({
          cartItems: items,
          orderIdempotencyKey: null,
          orderIdempotencyHash: null,
          orderError: null,
        });
        await submitOrder();
      },

      resetOrder: () =>
        set({
          orderStatus: "idle",
          orderResult: null,
          orderError: null,
          checkoutErrors: {},
          orderIdempotencyKey: null,
          orderIdempotencyHash: null,
        }),
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
