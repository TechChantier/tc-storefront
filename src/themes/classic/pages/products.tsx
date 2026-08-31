"use client";

import Link from "next/link";
import {
  buildProductListHref,
  DEFAULT_PRODUCT_PAGE,
} from "@/lib/catalog/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ClassicProductListPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const products = useStorefrontStore((state) => state.products);
  const meta = useStorefrontStore((state) => state.productsMeta);
  const query = useStorefrontStore((state) => state.productsQuery);
  const status = useStorefrontStore((state) => state.productsStatus);
  const categories = useStorefrontStore((state) => state.categories);

  const formAction = `/${locale}/products`;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Classic — Products
      </h1>

      <form
        action={formAction}
        method="get"
        className="mt-8 grid gap-3 border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          type="search"
          name="search"
          defaultValue={query.search ?? ""}
          placeholder="Search…"
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue={query.category ?? ""}
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="availability"
          defaultValue={
            query.availability && query.availability !== "all"
              ? query.availability
              : ""
          }
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All availability</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <select
          name="featured"
          defaultValue={query.featured === true ? "1" : ""}
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All products</option>
          <option value="1">Featured</option>
        </select>
        <input
          type="number"
          name="min_price"
          min={0}
          step="any"
          defaultValue={query.min_price ?? ""}
          placeholder="Min price"
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="max_price"
          min={0}
          step="any"
          defaultValue={query.max_price ?? ""}
          placeholder="Max price"
          className="border border-stone-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white sm:col-span-2 lg:col-span-3"
        >
          Apply filters
        </button>
      </form>

      {status !== "ok" && status !== "idle" ? (
        <p className="mt-8 text-stone-600">Products could not be loaded.</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-stone-600">No products found.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <li key={product.id} className="border border-stone-200 bg-white">
              <Link
                href={`/${locale}/products/${product.slug}`}
                className="block"
              >
                {product.primary_image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.primary_image.url}
                    alt={product.primary_image.alt ?? product.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-stone-100 text-sm text-stone-400">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg">{product.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.last_page > 1 ? (
        <nav className="mt-8 flex items-center justify-between text-sm">
          {meta.current_page > DEFAULT_PRODUCT_PAGE ? (
            <Link
              href={buildProductListHref(locale, {
                ...query,
                page: meta.current_page - 1,
              })}
              className="hover:underline"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-stone-500">
            Page {meta.current_page} of {meta.last_page}
          </span>
          {meta.current_page < meta.last_page ? (
            <Link
              href={buildProductListHref(locale, {
                ...query,
                page: meta.current_page + 1,
              })}
              className="hover:underline"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}
