"use client";

import {
  selectCartErrorMessage,
  useStorefrontStore,
  type CartItem,
  type CartStockSource,
} from "@/stores/storefront-store";

export function ClassicAddToCartButton({
  product,
}: {
  product: CartStockSource;
}) {
  const addToCart = useStorefrontStore((state) => state.addToCart);
  const remaining = useStorefrontStore((state) =>
    state.remainingCapacity(product),
  );
  const inCart = useStorefrontStore((state) =>
    state.cartQuantityFor(product.id),
  );
  const error = useStorefrontStore((state) =>
    selectCartErrorMessage(state, product.id),
  );

  const canAdd = remaining === null || remaining > 0;
  const label = !product.available
    ? "Unavailable"
    : remaining === 0 && inCart > 0
      ? "Max in cart"
      : !canAdd
        ? "Out of stock"
        : inCart > 0
          ? "Add another"
          : "Add to cart";

  return (
    <div>
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => addToCart(product, 1)}
        className="border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300"
      >
        {label}
      </button>
      {inCart > 0 ? (
        <p className="mt-2 text-xs text-stone-500">{inCart} in cart</p>
      ) : null}
      {remaining !== null && remaining > 0 ? (
        <p className="mt-1 text-xs text-stone-500">{remaining} left in stock</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

export function ClassicCartLineControls({ item }: { item: CartItem }) {
  const reduceFromCart = useStorefrontStore((state) => state.reduceFromCart);
  const updateCart = useStorefrontStore((state) => state.updateCart);
  const removeFromCart = useStorefrontStore((state) => state.removeFromCart);
  const max = useStorefrontStore((state) =>
    state.cartMaxQuantity(item.product_id),
  );
  const error = useStorefrontStore((state) =>
    selectCartErrorMessage(state, item.product_id),
  );
  const atMax = max !== null && item.quantity >= max;

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Reduce ${item.name}`}
          onClick={() => reduceFromCart(item.product_id)}
          className="border border-stone-300 px-2 py-1 text-sm"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={max ?? undefined}
          value={item.quantity}
          onChange={(event) =>
            updateCart(item.product_id, Number(event.target.value))
          }
          className="w-16 border border-stone-300 bg-white px-2 py-1 text-center text-sm"
        />
        <button
          type="button"
          aria-label={`Add another ${item.name}`}
          disabled={atMax}
          onClick={() => updateCart(item.product_id, item.quantity + 1)}
          className="border border-stone-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:text-stone-400"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => removeFromCart(item.product_id)}
          className="ml-2 text-sm text-stone-500 hover:underline"
        >
          Remove
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
