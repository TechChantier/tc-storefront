import type { CartItem, CartStockSource } from "./types";

export type StockLimit =
  | { kind: "none" }
  | { kind: "unlimited" }
  | { kind: "max"; max: number };

export function stockLimit(source: {
  available: boolean;
  track_stock?: boolean;
  stock_quantity?: number | null;
}): StockLimit {
  if (!source.available) {
    return { kind: "none" };
  }

  if (source.track_stock && source.stock_quantity != null) {
    return { kind: "max", max: Math.max(0, Math.floor(source.stock_quantity)) };
  }

  return { kind: "unlimited" };
}

export function clampQuantity(quantity: number, limit: StockLimit): number {
  const requested = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
  if (requested <= 0 || limit.kind === "none") return 0;
  if (limit.kind === "unlimited") return requested;
  return Math.min(requested, limit.max);
}

export function remainingCapacity(
  items: CartItem[],
  source: CartStockSource,
): number | null {
  const limit = stockLimit(source);
  if (limit.kind === "none") return 0;
  if (limit.kind === "unlimited") return null;
  const inCart =
    items.find((item) => item.product_id === source.id)?.quantity ?? 0;
  return Math.max(0, limit.max - inCart);
}

export function maxQuantity(source: {
  available: boolean;
  track_stock?: boolean;
  stock_quantity?: number | null;
}): number | null {
  const limit = stockLimit(source);
  if (limit.kind === "none") return 0;
  if (limit.kind === "unlimited") return null;
  return limit.max;
}

export function cartItemToStockSource(item: CartItem): CartStockSource {
  return {
    id: item.product_id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    currency: item.currency,
    available: item.available,
    track_stock: item.track_stock,
    stock_quantity: item.stock_quantity,
    primary_image: item.image_url ? { url: item.image_url } : null,
  };
}
