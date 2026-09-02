"use client";

import Link from "next/link";
import { useState } from "react";
import { useStorefrontStore } from "@/stores/storefront-store";
import { VibrantAddToCartButton } from "../cart-controls";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { Media } from "../components/media";
import { Missing } from "../components/missing";
import { QuantityStepper } from "../components/quantity-stepper";
import { UnavailableTag } from "../components/unavailable-tag";
import { formatPrice } from "../lib/format";

export function VibrantProductPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const product = useStorefrontStore((state) => state.product);
  const status = useStorefrontStore((state) => state.productStatus);
  const remaining = useStorefrontStore((state) =>
    state.product ? state.remainingCapacity(state.product) : 0,
  );
  const [quantity, setQuantity] = useState(1);

  if (status !== "ok" || !product) {
    return (
      <main>
        <Container className="py-12">
          <p className="text-[var(--v-on-variant)]">
            This product could not be loaded.
          </p>
          <Link
            href={`/${locale}/products`}
            className="mt-4 inline-block text-[var(--v-primary)] hover:underline"
          >
            Back to products
          </Link>
        </Container>
      </main>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.primary_image
        ? [product.primary_image]
        : [];
  const max = remaining;

  return (
    <main>
      <Container className="py-8 md:py-12">
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-2 md:col-span-7">
            <div className="relative h-[480px] overflow-hidden rounded-xl bg-white shadow-sm md:h-[800px]">
              <Media
                src={images[0]?.url}
                alt={images[0]?.alt ?? product.name}
                missingLabel="Product image"
                kind="product"
                className="h-full w-full"
              />
              {product.available ? null : <UnavailableTag />}
            </div>
            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((image) => (
                  <Media
                    key={image.url}
                    src={image.url}
                    alt={image.alt ?? product.name}
                    missingLabel="Product image"
                    kind="product"
                    className="h-24 w-full rounded-lg md:h-32"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center py-6 md:col-span-5 md:pl-6">
            {product.category?.name ? (
              <span className="mb-1 inline-block w-max rounded-full bg-[var(--v-primary)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--v-primary)]">
                {product.category.name}
              </span>
            ) : null}
            <h1 className="v-serif mb-1 text-[28px] font-semibold md:text-5xl">
              {product.name}
            </h1>
            <p className="v-serif mb-6 text-2xl font-medium text-[var(--v-on-variant)]">
              {formatPrice(product.price, product.currency)}
              {product.compare_at_price ? (
                <span className="ml-2 text-base line-through">
                  {formatPrice(product.compare_at_price, product.currency)}
                </span>
              ) : null}
            </p>
            {product.short_description ? (
              <p className="mb-6 text-lg text-[var(--v-on-variant)]">
                {product.short_description}
              </p>
            ) : null}
            {product.description ? (
              <div
                className="mb-6 max-w-none text-lg text-[var(--v-on-variant)]"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <Missing
                as="p"
                className="mb-6 text-lg text-[var(--v-on-variant)]"
              >
                Product description
              </Missing>
            )}
            <p className="mb-4 text-sm text-[var(--v-on-variant)]">
              {product.available ? "In stock" : "Unavailable"}
            </p>
            <hr className="my-3 border-[var(--v-outline-variant)]/30" />
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest">
                  Quantity
                </span>
                <QuantityStepper
                  value={quantity}
                  max={max}
                  onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
                  onIncrease={() => setQuantity((value) => value + 1)}
                  onChange={(value) => setQuantity(Math.max(1, value))}
                  disabled={!product.available}
                />
              </div>
              <VibrantAddToCartButton product={product} quantity={quantity} />
              <Button type="button" variant="outline" pill className="w-full py-4">
                Add to Wishlist
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
