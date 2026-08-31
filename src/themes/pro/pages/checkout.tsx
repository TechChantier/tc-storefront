"use client";

import Link from "next/link";
import {
  selectCartCurrency,
  selectCartSubtotal,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { ProCheckoutForm } from "../checkout-form";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ProCheckoutPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const items = useStorefrontStore((state) => state.cartItems);
  const hydrated = useStorefrontStore((state) => state.cartHydrated);
  const subtotal = useStorefrontStore(selectCartSubtotal);
  const currency = useStorefrontStore(selectCartCurrency);
  const orderStatus = useStorefrontStore((state) => state.orderStatus);
  const orderResult = useStorefrontStore((state) => state.orderResult);

  if (!hydrated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        <p className="text-slate-400">Loading checkout…</p>
      </main>
    );
  }

  if (orderStatus === "success" && orderResult) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Pro — Order placed
        </h1>
        <p className="mt-6 text-slate-200">
          Reference{" "}
          <span className="font-medium">{orderResult.public_reference}</span>
        </p>
        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
          Status: {orderResult.status}
        </p>
        <dl className="mt-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Subtotal</dt>
            <dd>{formatPrice(orderResult.subtotal, orderResult.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Delivery</dt>
            <dd>
              {formatPrice(orderResult.delivery_fee, orderResult.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Tax</dt>
            <dd>{formatPrice(orderResult.tax, orderResult.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 text-base">
            <dt>Total</dt>
            <dd>{formatPrice(orderResult.total, orderResult.currency)}</dd>
          </div>
        </dl>
        <Link
          href={`/${locale}/products`}
          className="mt-8 w-fit bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Pro — Checkout
        </h1>
        <p className="mt-3 text-sm text-slate-500">Your cart is empty.</p>
        <Link
          href={`/${locale}/products`}
          className="mt-8 w-fit bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950"
        >
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
        Pro — Checkout
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        Review your order and enter delivery details.
      </p>
      <Link
        href={`/${locale}/cart`}
        className="mt-4 text-xs uppercase tracking-wider text-slate-400 hover:text-white"
      >
        Edit cart
      </Link>

      <ul className="mt-8 divide-y divide-slate-800 border border-slate-800 bg-slate-900">
        {items.map((item) => (
          <li key={item.product_id} className="flex gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-slate-400">
                {item.quantity} × {formatPrice(item.price, item.currency)}
              </p>
            </div>
            <p className="text-sm text-slate-300">
              {formatPrice(item.price * item.quantity, item.currency)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="uppercase tracking-wider text-slate-400">Subtotal</span>
        <span>{formatPrice(subtotal, currency)}</span>
      </div>

      <ProCheckoutForm />
    </main>
  );
}
