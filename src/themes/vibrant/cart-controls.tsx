"use client";

import {
  selectCartErrorMessage,
  useStorefrontStore,
  type CartItem,
  type CartStockSource,
} from "@/stores/storefront-store";
import { Button } from "./components/button";
import { Icon } from "./components/icon";
import { QuantityStepper } from "./components/quantity-stepper";

export function VibrantAddToCartButton({
  product,
  quantity = 1,
}: {
  product: CartStockSource;
  quantity?: number;
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
          : "Add to Cart";

  return (
    <div>
      <Button
        pill
        className="w-full py-4"
        disabled={!canAdd}
        onClick={() => addToCart(product, quantity)}
      >
        <span>{label}</span>
        <Icon name="arrowRight" className="h-[18px] w-[18px]" />
      </Button>
      {inCart > 0 ? (
        <p className="mt-2 text-xs text-[var(--v-on-variant)]">{inCart} in cart</p>
      ) : null}
      {remaining !== null && remaining > 0 ? (
        <p className="mt-1 text-xs text-[var(--v-on-variant)]">
          {remaining} left in stock
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-[var(--v-error)]">{error}</p>
      ) : null}
    </div>
  );
}

export function VibrantCartLineControls({ item }: { item: CartItem }) {
  const reduceFromCart = useStorefrontStore((state) => state.reduceFromCart);
  const updateCart = useStorefrontStore((state) => state.updateCart);
  const removeFromCart = useStorefrontStore((state) => state.removeFromCart);
  const max = useStorefrontStore((state) =>
    state.cartMaxQuantity(item.product_id),
  );
  const error = useStorefrontStore((state) =>
    selectCartErrorMessage(state, item.product_id),
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <QuantityStepper
          value={item.quantity}
          max={max}
          onDecrease={() => reduceFromCart(item.product_id)}
          onIncrease={() => updateCart(item.product_id, item.quantity + 1)}
          onChange={(value) => updateCart(item.product_id, value)}
        />
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          onClick={() => removeFromCart(item.product_id)}
          className="p-1 text-[var(--v-on-variant)] transition-colors hover:text-[var(--v-error)]"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--v-error)]">{error}</p>
      ) : null}
    </div>
  );
}
