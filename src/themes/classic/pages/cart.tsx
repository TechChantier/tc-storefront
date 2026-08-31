"use client";

import Link from "next/link";
import {
  selectCartCount,
  selectCartCurrency,
  selectCartSubtotal,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { ClassicCartLineControls } from "../cart-controls";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ClassicCartPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const items = useStorefrontStore((state) => state.cartItems);
  const hydrated = useStorefrontStore((state) => state.cartHydrated);
  const count = useStorefrontStore(selectCartCount);
  const subtotal = useStorefrontStore(selectCartSubtotal);
  const currency = useStorefrontStore(selectCartCurrency);

  if (!hydrated) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <p className="text-stone-600">Loading cart…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Classic — Cart</h1>
      <p className="mt-2 text-sm text-stone-500">
        {count === 0
          ? "Your cart is empty."
          : `${count} item${count === 1 ? "" : "s"} in cart`}
      </p>

      {items.length === 0 ? (
        <Link
          href={`/${locale}/products`}
          className="mt-8 w-fit border border-stone-900 px-4 py-2 text-sm hover:bg-stone-900 hover:text-white"
        >
          Browse products
        </Link>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-stone-200 border border-stone-200 bg-white">
            {items.map((item) => (
              <li key={item.product_id} className="flex gap-4 p-4">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center bg-stone-100 text-xs text-stone-400">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/products/${item.slug}`}
                    className="text-lg hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone-600">
                    {formatPrice(item.price, item.currency)} each
                  </p>
                  <div className="mt-3">
                    <ClassicCartLineControls item={item} />
                  </div>
                </div>
                <p className="text-sm">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between border-t border-stone-300 pt-4">
            <span className="text-lg">Subtotal</span>
            <span className="text-lg">{formatPrice(subtotal, currency)}</span>
          </div>
          <Link
            href={`/${locale}/checkout`}
            className="mt-6 w-fit border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </main>
  );
}
