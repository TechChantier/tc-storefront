import type { CartItem, CartMutationResult, CartStockSource } from "./types";
import { clampQuantity, stockLimit } from "./stock";

function snapshot(source: CartStockSource, quantity: number): CartItem {
  return {
    product_id: source.id,
    quantity,
    name: source.name,
    slug: source.slug,
    price: source.price,
    currency: source.currency,
    image_url: source.primary_image?.url ?? null,
    available: source.available,
    track_stock: source.track_stock ?? false,
    stock_quantity: source.stock_quantity ?? null,
  };
}

export function addCartItem(
  items: CartItem[],
  source: CartStockSource,
  quantity = 1,
): CartMutationResult {
  const addBy = Math.max(1, Math.floor(quantity));
  const limit = stockLimit(source);
  const current = items.find((item) => item.product_id === source.id);
  const currentQty = current?.quantity ?? 0;
  const nextQty = clampQuantity(currentQty + addBy, limit);

  if (nextQty <= 0) {
    return {
      items,
      error: limit.kind === "none" ? "unavailable" : "insufficient_stock",
    };
  }

  if (nextQty === currentQty) {
    return { items, error: "insufficient_stock" };
  }

  const item = snapshot(source, nextQty);
  const nextItems = current
    ? items.map((entry) =>
        entry.product_id === source.id ? item : entry,
      )
    : [...items, item];

  const clamped = nextQty < currentQty + addBy;
  return {
    items: nextItems,
    error: clamped ? "insufficient_stock" : null,
  };
}

export function reduceCartItem(
  items: CartItem[],
  productId: string,
): CartMutationResult {
  const current = items.find((item) => item.product_id === productId);
  if (!current) {
    return { items, error: null };
  }

  if (current.quantity <= 1) {
    return {
      items: items.filter((item) => item.product_id !== productId),
      error: null,
    };
  }

  return {
    items: items.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: item.quantity - 1 }
        : item,
    ),
    error: null,
  };
}

export function updateCartItem(
  items: CartItem[],
  productId: string,
  quantity: number,
  source?: CartStockSource,
): CartMutationResult {
  const current = items.find((item) => item.product_id === productId);
  if (!current) {
    return { items, error: null };
  }

  const stockSource = source ?? {
    id: current.product_id,
    name: current.name,
    slug: current.slug,
    price: current.price,
    currency: current.currency,
    available: current.available,
    track_stock: current.track_stock,
    stock_quantity: current.stock_quantity,
    primary_image: current.image_url ? { url: current.image_url } : null,
  };

  const nextQty = clampQuantity(quantity, stockLimit(stockSource));
  if (nextQty <= 0) {
    return {
      items: items.filter((item) => item.product_id !== productId),
      error: stockLimit(stockSource).kind === "none" ? "unavailable" : null,
    };
  }

  const requested = Math.floor(quantity);
  const item = snapshot(stockSource, nextQty);
  return {
    items: items.map((entry) =>
      entry.product_id === productId ? item : entry,
    ),
    error: requested > nextQty ? "insufficient_stock" : null,
  };
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCurrency(items: CartItem[]): string {
  return items[0]?.currency ?? "XAF";
}

export function applyCartPriceChanges(
  items: CartItem[],
  changes: { product_id: string; current_price: number }[],
): CartItem[] {
  if (changes.length === 0) return items;
  const byId = new Map(
    changes.map((change) => [change.product_id, change.current_price]),
  );
  return items.map((item) => {
    const nextPrice = byId.get(item.product_id);
    return nextPrice === undefined ? item : { ...item, price: nextPrice };
  });
}
