"use client";

import Link from "next/link";
import {
  buildProductListHref,
  DEFAULT_PRODUCT_PAGE,
} from "@/lib/catalog/product-query";
import { useStorefrontStore } from "@/stores/storefront-store";
import { ProAddToCartButton } from "../cart-controls";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ProProductListPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const products = useStorefrontStore((state) => state.products);
  const meta = useStorefrontStore((state) => state.productsMeta);
  const query = useStorefrontStore((state) => state.productsQuery);
  const status = useStorefrontStore((state) => state.productsStatus);
  const categories = useStorefrontStore((state) => state.categories);

  const formAction = `/${locale}/products`;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
        Pro — Products
      </h1>

      <form
        action={formAction}
        method="get"
        className="mt-8 grid gap-3 border border-slate-800 bg-slate-900 p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          type="search"
          name="search"
          defaultValue={query.search ?? ""}
          placeholder="Search…"
          className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
        />
        <select
          name="category"
          defaultValue={query.category ?? ""}
          className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
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
          className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
        >
          <option value="">All availability</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <select
          name="featured"
          defaultValue={query.featured === true ? "1" : ""}
          className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
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
          className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
        />
        <input
          type="number"
          name="max_price"
          min={0}
          step="any"
          defaultValue={query.max_price ?? ""}
          placeholder="Max price"
          className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
        />
        <button
          type="submit"
          className="bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 sm:col-span-2 lg:col-span-3"
        >
          Apply filters
        </button>
      </form>

      {status !== "ok" && status !== "idle" ? (
        <p className="mt-8 text-slate-400">Products could not be loaded.</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-slate-400">No products found.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="border border-slate-800 bg-slate-900">
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
                  <div className="flex h-48 items-center justify-center bg-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-medium">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <ProAddToCartButton product={product} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.last_page > 1 ? (
        <nav className="mt-8 flex items-center justify-between text-xs uppercase tracking-wider">
          {meta.current_page > DEFAULT_PRODUCT_PAGE ? (
            <Link
              href={buildProductListHref(locale, {
                ...query,
                page: meta.current_page - 1,
              })}
              className="hover:text-white"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate-500">
            Page {meta.current_page} of {meta.last_page}
          </span>
          {meta.current_page < meta.last_page ? (
            <Link
              href={buildProductListHref(locale, {
                ...query,
                page: meta.current_page + 1,
              })}
              className="hover:text-white"
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
