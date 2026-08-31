"use client";

import Link from "next/link";
import {
  selectCartCount,
  selectCartCurrency,
  selectCartSubtotal,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { ProCartLineControls } from "../cart-controls";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ProCartPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const items = useStorefrontStore((state) => state.cartItems);
  const hydrated = useStorefrontStore((state) => state.cartHydrated);
  const count = useStorefrontStore(selectCartCount);
  const subtotal = useStorefrontStore(selectCartSubtotal);
  const currency = useStorefrontStore(selectCartCurrency);

  if (!hydrated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        <p className="text-slate-400">Loading cart…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
        Pro — Cart
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        {count === 0
          ? "Your cart is empty."
          : `${count} item${count === 1 ? "" : "s"} in cart`}
      </p>

      {items.length === 0 ? (
        <Link
          href={`/${locale}/products`}
          className="mt-8 w-fit bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950"
        >
          Browse products
        </Link>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-slate-800 border border-slate-800 bg-slate-900">
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
                  <div className="flex h-24 w-24 items-center justify-center bg-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/products/${item.slug}`}
                    className="font-medium hover:text-white"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatPrice(item.price, item.currency)} each
                  </p>
                  <div className="mt-3">
                    <ProCartLineControls item={item} />
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-sm uppercase tracking-wider text-slate-400">
              Subtotal
            </span>
            <span className="text-lg">{formatPrice(subtotal, currency)}</span>
          </div>
          <Link
            href={`/${locale}/checkout`}
            className="mt-6 w-fit bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950"
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </main>
  );
}
