"use client";

import Link from "next/link";
import { buildProductListHref } from "@/lib/catalog/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";

export function ClassicCategoryListPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const categories = useStorefrontStore((state) => state.categories);
  const status = useStorefrontStore((state) => state.categoriesStatus);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Classic — Categories
      </h1>

      {status !== "ok" && status !== "idle" ? (
        <p className="mt-8 text-stone-600">Categories could not be loaded.</p>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-stone-600">No categories yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-stone-200 border-t border-stone-200">
          {categories.map((category) => (
            <li key={category.id} className="py-4">
              <Link
                href={buildProductListHref(locale, {
                  category: category.slug,
                })}
                className="flex items-center gap-4 hover:underline"
              >
                {category.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image.url}
                    alt={category.image.alt ?? category.name}
                    className="h-16 w-16 shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-stone-100 text-xs text-stone-400">
                    No image
                  </div>
                )}
                <span className="min-w-0 flex-1 text-lg">{category.name}</span>
                <span className="text-sm text-stone-500">
                  {category.product_count ?? 0} products
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
