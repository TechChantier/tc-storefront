"use client";

import { useRef } from "react";
import type { Product } from "@/lib/catalog/types";
import { Icon } from "./icon";
import { ProductCard } from "./product-card";

const CARD_GAP_PX = 24;

export function FeaturedCarousel({
  products,
  locale,
}: {
  products: Product[];
  locale: string;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: -1 | 1) => {
    const node = sliderRef.current;
    const card = node?.firstElementChild as HTMLElement | undefined;
    if (!node || !card) return;
    node.scrollBy({
      left: direction * (card.getBoundingClientRect().width + CARD_GAP_PX),
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="v-serif text-xl font-medium text-[var(--v-on-surface)]">
          Featured
        </h2>
        {products.length > 1 ? (
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous featured product"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v-outline-variant)] text-[var(--v-on-variant)] hover:border-[var(--v-primary)] hover:text-[var(--v-primary)]"
              onClick={() => scroll(-1)}
            >
              <Icon name="arrowLeft" className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next featured product"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v-outline-variant)] text-[var(--v-on-variant)] hover:border-[var(--v-primary)] hover:text-[var(--v-primary)]"
              onClick={() => scroll(1)}
            >
              <Icon name="arrowRight" className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
      <div
        ref={sliderRef}
        className="v-no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-full min-w-full shrink-0 snap-start sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)]"
          >
            <ProductCard
              product={product}
              href={`/${locale}/products/${product.slug}`}
              variant="featured"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
