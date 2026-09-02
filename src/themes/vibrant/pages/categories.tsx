"use client";

import { buildProductListHref } from "@/lib/catalog/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";
import { CategoryCard } from "../components/category-card";
import { Container } from "../components/container";
import { EmptyState, PageHeader } from "../components/empty-state";

export function VibrantCategoryListPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const categories = useStorefrontStore((state) => state.categories);
  const status = useStorefrontStore((state) => state.categoriesStatus);

  return (
    <main>
      <Container className="py-12 md:py-16">
        <PageHeader title="Categories" />
        {status !== "ok" && status !== "idle" ? (
          <p className="text-[var(--v-on-variant)]">
            Categories could not be loaded.
          </p>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            body="This shop has not published categories."
          />
        ) : (
          <div className="flex flex-wrap gap-6">
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
    </main>
  );
}
