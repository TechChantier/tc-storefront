"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  selectCartCurrency,
  selectCartSubtotal,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { VibrantCheckoutForm } from "../checkout-form";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { Media } from "../components/media";
import { PageHeader } from "../components/empty-state";
import { formatPrice } from "../lib/format";
import { vibrantCopy } from "../content";

export function VibrantCheckoutPage() {
  const router = useRouter();
  const locale = useStorefrontStore((state) => state.locale);
  const items = useStorefrontStore((state) => state.cartItems);
  const hydrated = useStorefrontStore((state) => state.cartHydrated);
  const subtotal = useStorefrontStore(selectCartSubtotal);
  const currency = useStorefrontStore(selectCartCurrency);
  const orderStatus = useStorefrontStore((state) => state.orderStatus);
  const orderResult = useStorefrontStore((state) => state.orderResult);

  useEffect(() => {
    if (orderStatus === "success" && orderResult) {
      router.replace(`/${locale}/success`);
    }
  }, [orderStatus, orderResult, locale, router]);

  if (!hydrated) {
    return (
      <main>
        <Container className="py-12">
          <p className="text-[var(--v-on-variant)]">Loading checkout…</p>
        </Container>
      </main>
    );
  }

  if (orderStatus === "success" && orderResult) {
    return (
      <main>
        <Container className="py-12">
          <p className="text-[var(--v-on-variant)]">
            Taking you to your confirmation…
          </p>
        </Container>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main>
        <Container className="py-12">
          <PageHeader title="Checkout" description="Your cart is empty." />
          <Link href={`/${locale}/products`}>
            <Button variant="outline">Browse products</Button>
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className="py-8 md:py-12">
        <PageHeader
          title="Checkout"
          description="Please complete your details to place your order."
        />
        <Link
          href={`/${locale}/cart`}
          className="mb-6 inline-block text-sm text-[var(--v-primary)] hover:underline"
        >
          Edit cart
        </Link>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <VibrantCheckoutForm />
          </div>
          <aside className="lg:sticky lg:top-[104px] lg:col-span-5 xl:col-span-4">
            <div className="rounded-xl border border-[var(--v-outline-variant)]/10 bg-[var(--v-container-lowest)] p-6 shadow-[var(--v-shadow)]">
              <h3 className="v-serif mb-3 text-2xl font-medium text-[var(--v-primary)]">
                Order Summary
              </h3>
              <div className="mb-6 flex flex-col gap-3 border-b border-[var(--v-outline-variant)]/40 pb-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded bg-[var(--v-container)]">
                      <Media
                        src={item.image_url}
                        alt={item.name}
                        missingLabel="Product image"
                        kind="product"
                        className="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-medium leading-tight">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-lg font-medium">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-6 flex flex-col gap-2 text-base text-[var(--v-on-variant)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{vibrantCopy.checkoutShipping}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{vibrantCopy.checkoutTax}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-[var(--v-outline-variant)]/40 pt-2 text-[28px] font-semibold text-[var(--v-primary)]">
                  <span className="v-serif">Total</span>
                  <span className="v-serif">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
