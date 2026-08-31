"use client";

import Link from "next/link";
import { buildProductListHref } from "@/lib/catalog/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";

export function ProCategoryListPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const categories = useStorefrontStore((state) => state.categories);
  const status = useStorefrontStore((state) => state.categoriesStatus);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
        Pro — Categories
      </h1>

      {status !== "ok" && status !== "idle" ? (
        <p className="mt-8 text-slate-400">Categories could not be loaded.</p>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-slate-400">No categories yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-slate-800 border-t border-slate-800">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={buildProductListHref(locale, {
                  category: category.slug,
                })}
                className="flex items-center gap-4 py-4 hover:text-white"
              >
                {category.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image.url}
                    alt={category.image.alt ?? category.name}
                    className="h-16 w-16 shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    No image
                  </div>
                )}
                <span className="min-w-0 flex-1 text-lg font-medium">
                  {category.name}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  {category.product_count ?? 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
