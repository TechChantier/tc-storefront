"use client";

import Link from "next/link";
import {
  buildProductListHref,
  DEFAULT_PRODUCT_PAGE,
} from "@/lib/catalog/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { EmptyState, PageHeader } from "../components/empty-state";
import { FeaturedCarousel } from "../components/featured-carousel";
import { FieldLabel, TextInput } from "../components/field";
import { Icon } from "../components/icon";
import { ProductCard } from "../components/product-card";
import { Chip } from "../components/quantity-stepper";

export function VibrantProductListPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const products = useStorefrontStore((state) => state.products);
  const meta = useStorefrontStore((state) => state.productsMeta);
  const query = useStorefrontStore((state) => state.productsQuery);
  const status = useStorefrontStore((state) => state.productsStatus);
  const categories = useStorefrontStore((state) => state.categories);
  const featuredProducts = useStorefrontStore(
    (state) => state.featuredProducts,
  );
  const formAction = `/${locale}/products`;

  return (
    <main>
      <Container className="flex flex-col gap-6 py-8 md:flex-row md:py-12">
        <aside className="w-full shrink-0 md:w-64">
          <form action={formAction} method="get" className="sticky top-24 space-y-6">
            <div>
              <FieldLabel htmlFor="vibrant-search">Search</FieldLabel>
              <div className="relative">
                <TextInput
                  id="vibrant-search"
                  type="search"
                  name="search"
                  defaultValue={query.search ?? ""}
                  placeholder="Find a product..."
                  className="pl-10"
                />
                <Icon
                  name="search"
                  className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--v-outline)]"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <input type="hidden" name="category" defaultValue={query.category ?? ""} />
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildProductListHref(locale, {
                    ...query,
                    page: DEFAULT_PRODUCT_PAGE,
                    category: undefined,
                  })}
                >
                  <Chip active={!query.category}>All</Chip>
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={buildProductListHref(locale, {
                      ...query,
                      page: DEFAULT_PRODUCT_PAGE,
                      category: category.slug,
                    })}
                  >
                    <Chip active={query.category === category.slug}>
                      {category.name}
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Price Range</FieldLabel>
              <div className="flex items-center gap-2">
                <TextInput
                  type="number"
                  name="min_price"
                  min={0}
                  step="any"
                  defaultValue={query.min_price ?? ""}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2"
                />
                <span className="text-[var(--v-outline)]">-</span>
                <TextInput
                  type="number"
                  name="max_price"
                  min={0}
                  step="any"
                  defaultValue={query.max_price ?? ""}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Availability</FieldLabel>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="availability"
                  value="in_stock"
                  defaultChecked={query.availability === "in_stock"}
                  className="h-5 w-5 rounded border-[var(--v-outline)] text-[var(--v-primary)]"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div>
              <FieldLabel>Featured</FieldLabel>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  value="1"
                  defaultChecked={query.featured === true}
                  className="h-5 w-5 rounded border-[var(--v-outline)] text-[var(--v-primary)]"
                />
                <span>Featured only</span>
              </label>
            </div>

            <Button type="submit" variant="outline" className="w-full">
              Apply Filters
            </Button>
          </form>
        </aside>

        <section className="min-w-0 flex-1">
          <PageHeader
            title="Curated Collection"
            trailing={
              meta ? (
                <span className="text-base text-[var(--v-on-variant)]">
                  Showing {products.length} of {meta.total} items
                </span>
              ) : null
            }
          />

          {query.featured !== true ? (
            <FeaturedCarousel products={featuredProducts} locale={locale} />
          ) : null}

          {status !== "ok" && status !== "idle" ? (
            <p className="text-[var(--v-on-variant)]">Products could not be loaded.</p>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              body="We couldn't find anything matching your current filters. Try adjusting your search or clear all filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={`/${locale}/products/${product.slug}`}
                />
              ))}
            </div>
          )}

          {meta && meta.last_page > 1 ? (
            <nav className="mt-8 flex items-center justify-between text-sm">
              {meta.current_page > DEFAULT_PRODUCT_PAGE ? (
                <Link
                  href={buildProductListHref(locale, {
                    ...query,
                    page: meta.current_page - 1,
                  })}
                  className="text-[var(--v-primary)] hover:underline"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-[var(--v-on-variant)]">
                Page {meta.current_page} of {meta.last_page}
              </span>
              {meta.current_page < meta.last_page ? (
                <Link
                  href={buildProductListHref(locale, {
                    ...query,
                    page: meta.current_page + 1,
                  })}
                  className="text-[var(--v-primary)] hover:underline"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>
      </Container>
    </main>
  );
}
