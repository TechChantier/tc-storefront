"use client";

import Link from "next/link";
import {
  selectCartCount,
  selectCartCurrency,
  selectCartSubtotal,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { VibrantCartLineControls } from "../cart-controls";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { Media } from "../components/media";
import { Missing } from "../components/missing";
import { PageHeader } from "../components/empty-state";
import { formatPrice } from "../lib/format";

export function VibrantCartPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const items = useStorefrontStore((state) => state.cartItems);
  const hydrated = useStorefrontStore((state) => state.cartHydrated);
  const count = useStorefrontStore(selectCartCount);
  const subtotal = useStorefrontStore(selectCartSubtotal);
  const currency = useStorefrontStore(selectCartCurrency);

  if (!hydrated) {
    return (
      <main>
        <Container className="py-12">
          <p className="text-[var(--v-on-variant)]">Loading cart…</p>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className="py-8 md:py-12">
        <PageHeader
          title="Your Cart"
          description={
            count === 0
              ? "Your cart is empty."
              : "Review your selected items before proceeding to checkout."
          }
        />

        {items.length === 0 ? (
          <Link href={`/${locale}/products`}>
            <Button variant="outline">Browse products</Button>
          </Link>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex w-full flex-col gap-3 lg:w-2/3">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex flex-col gap-3 rounded-lg bg-[var(--v-container-lowest)] p-3 shadow-[var(--v-shadow)] sm:flex-row"
                >
                  <div className="aspect-[4/5] w-full shrink-0 overflow-hidden rounded-md bg-[var(--v-container)] sm:w-32">
                    <Media
                      src={item.image_url}
                      alt={item.name}
                      missingLabel="Product image"
                      kind="product"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/${locale}/products/${item.slug}`}
                          className="v-serif text-lg font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                        <Missing
                          as="p"
                          className="mt-1 text-sm text-[var(--v-on-variant)]"
                        >
                          Variant
                        </Missing>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <VibrantCartLineControls item={item} />
                      <span className="text-lg font-medium text-[var(--v-primary)]">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-1/3">
              <div className="sticky top-28 rounded-lg bg-[var(--v-container-lowest)] p-6 shadow-[var(--v-shadow)]">
                <h2 className="v-serif mb-3 text-2xl font-medium">
                  Order Summary
                </h2>
                <div className="mb-3 flex flex-col gap-1 border-b border-[var(--v-outline-variant)] pb-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--v-on-variant)]">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--v-on-variant)]">Shipping</span>
                    <Missing className="text-sm text-[var(--v-on-variant)]">
                      Calculated at next step
                    </Missing>
                  </div>
                </div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="v-serif text-2xl">Total</span>
                  <span className="v-serif text-[32px] font-semibold text-[var(--v-primary)]">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <Link href={`/${locale}/checkout`}>
                  <Button className="w-full py-4">Proceed to Checkout</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
