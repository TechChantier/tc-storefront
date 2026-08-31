"use client";

import Link from "next/link";
import {
  selectCartCurrency,
  selectCartSubtotal,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { ClassicCheckoutForm } from "../checkout-form";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ClassicCheckoutPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const items = useStorefrontStore((state) => state.cartItems);
  const hydrated = useStorefrontStore((state) => state.cartHydrated);
  const subtotal = useStorefrontStore(selectCartSubtotal);
  const currency = useStorefrontStore(selectCartCurrency);
  const orderStatus = useStorefrontStore((state) => state.orderStatus);
  const orderResult = useStorefrontStore((state) => state.orderResult);

  if (!hydrated) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <p className="text-stone-600">Loading checkout…</p>
      </main>
    );
  }

  if (orderStatus === "success" && orderResult) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Classic — Order placed
        </h1>
        <p className="mt-4 text-stone-700">
          Reference{" "}
          <span className="font-medium">{orderResult.public_reference}</span>
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Status: {orderResult.status}
        </p>
        <dl className="mt-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(orderResult.subtotal, orderResult.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>
              {formatPrice(orderResult.delivery_fee, orderResult.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{formatPrice(orderResult.tax, orderResult.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-300 pt-2 text-base">
            <dt>Total</dt>
            <dd>{formatPrice(orderResult.total, orderResult.currency)}</dd>
          </div>
        </dl>
        <Link
          href={`/${locale}/products`}
          className="mt-8 w-fit border border-stone-900 px-4 py-2 text-sm hover:bg-stone-900 hover:text-white"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Classic — Checkout
        </h1>
        <p className="mt-2 text-sm text-stone-500">Your cart is empty.</p>
        <Link
          href={`/${locale}/products`}
          className="mt-8 w-fit border border-stone-900 px-4 py-2 text-sm hover:bg-stone-900 hover:text-white"
        >
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Classic — Checkout
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Review your order and enter delivery details.
      </p>
      <Link
        href={`/${locale}/cart`}
        className="mt-4 text-sm hover:underline"
      >
        Edit cart
      </Link>

      <ul className="mt-8 divide-y divide-stone-200 border border-stone-200 bg-white">
        {items.map((item) => (
          <li key={item.product_id} className="flex gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-lg">{item.name}</p>
              <p className="mt-1 text-sm text-stone-600">
                {item.quantity} × {formatPrice(item.price, item.currency)}
              </p>
            </div>
            <p className="text-sm">
              {formatPrice(item.price * item.quantity, item.currency)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal, currency)}</span>
      </div>

      <ClassicCheckoutForm />
    </main>
  );
}
