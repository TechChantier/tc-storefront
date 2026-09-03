import { CART_PERSIST_VERSION, parsePersistedCart } from "@/lib/schemas/cart";
import type { CartItem } from "@/lib/types/cart";

export function cartStorageKey(tcposSubdomain: string): string {
  return `tc-storefront-cart:${tcposSubdomain}`;
}

export function loadPersistedCart(tcposSubdomain: string): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(cartStorageKey(tcposSubdomain));
    if (!raw) return [];
    const parsed = parsePersistedCart(JSON.parse(raw), tcposSubdomain);
    return parsed?.items ?? [];
  } catch {
    return [];
  }
}

export function savePersistedCart(
  tcposSubdomain: string,
  items: CartItem[],
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      cartStorageKey(tcposSubdomain),
      JSON.stringify({
        version: CART_PERSIST_VERSION,
        tcpos_subdomain: tcposSubdomain,
        items,
      }),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}
