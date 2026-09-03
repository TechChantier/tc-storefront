"use client";

import Link from "next/link";
import { useRef } from "react";
import { buildProductListHref } from "@/lib/queries/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";
import { Button } from "../components/button";
import { CategoryCard } from "../components/category-card";
import { Container } from "../components/container";
import { Icon } from "../components/icon";
import { ProductCard } from "../components/product-card";
import { vibrantCopy, vibrantImages } from "../content";

export function VibrantHomePage() {
  const locale = useStorefrontStore((state) => state.locale);
  const sections = useStorefrontStore((state) => state.config.sections);
  const categories = useStorefrontStore((state) => state.categories);
  const featuredProducts = useStorefrontStore(
    (state) => state.featuredProducts,
  );
  const featuredStatus = useStorefrontStore((state) => state.featuredStatus);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: -1 | 1) => {
    sliderRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  return (
    <main>
      {sections.hero !== false ? (
        <section className="relative h-[80vh] w-full overflow-hidden bg-[var(--v-container)] md:h-[90vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vibrantImages.hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--v-bg)] via-[var(--v-bg)]/20 to-transparent" />
          <Container className="relative z-10 flex h-full flex-col justify-end pb-24">
            <div className="max-w-2xl">
              <h1 className="v-serif mb-3 text-4xl font-semibold tracking-tight text-[var(--v-on-bg)] md:text-5xl">
                {vibrantCopy.heroHeadline}
              </h1>
              <p className="mb-6 max-w-xl text-lg text-[var(--v-on-variant)]">
                {vibrantCopy.heroTagline}
              </p>
              <Link href={`/${locale}/products`}>
                <Button pill className="px-8 py-4">
                  Shop the Collection
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      ) : null}

      {sections.categories !== false ? (
        <section className="bg-[var(--v-bg)] py-24">
          <Container>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="v-serif text-[28px] font-semibold md:text-[32px]">
                Shop by Category
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous categories"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v-outline-variant)] text-[var(--v-on-variant)] hover:border-[var(--v-primary)] hover:text-[var(--v-primary)]"
                  onClick={() => scrollCategories(-1)}
                >
                  <Icon name="arrowLeft" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next categories"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v-outline-variant)] text-[var(--v-on-variant)] hover:border-[var(--v-primary)] hover:text-[var(--v-primary)]"
                  onClick={() => scrollCategories(1)}
                >
                  <Icon name="arrowRight" className="h-5 w-5" />
                </button>
              </div>
            </div>
            {categories.length === 0 ? (
              <p className="text-[var(--v-on-variant)]">No categories yet.</p>
            ) : (
              <div
                ref={sliderRef}
                className="v-no-scrollbar flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
              >
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    href={buildProductListHref(locale, {
                      category: category.slug,
                    })}
                  />
                ))}
              </div>
            )}
          </Container>
        </section>
      ) : null}

      {sections.featured_products !== false ? (
        <section
          id="featured"
          className="bg-[var(--v-container-lowest)] py-24"
        >
          <Container>
            <div className="mb-16 text-center">
              <h2 className="v-serif mb-1 text-[28px] font-semibold md:text-[32px]">
                Featured Arrivals
              </h2>
              <p className="text-base text-[var(--v-on-variant)]">
                {vibrantCopy.featuredSubtitle}
              </p>
            </div>
            {featuredStatus !== "ok" && featuredStatus !== "idle" ? (
              <p className="text-center text-[var(--v-on-variant)]">
                Featured products could not be loaded.
              </p>
            ) : featuredProducts.length === 0 ? (
              <p className="text-center text-[var(--v-on-variant)]">
                No featured products yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    href={`/${locale}/products/${product.slug}`}
                    variant="compact"
                  />
                ))}
              </div>
            )}
            <div className="mt-16 text-center">
              <Link href={`/${locale}/products`}>
                <Button variant="outline" pill>
                  View All Products
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-[var(--v-container-low)] py-32">
        <Container className="relative z-10 max-w-4xl text-center">
          <Icon
            name="leaf"
            className="mx-auto mb-3 h-12 w-12 text-[var(--v-primary)]"
          />
          <h2 className="v-serif mb-6 text-4xl font-semibold tracking-tight md:text-5xl">
            {vibrantCopy.ethicsHeadline}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--v-on-variant)]">
            {vibrantCopy.ethicsBody}
          </p>
        </Container>
      </section>
    </main>
  );
}
