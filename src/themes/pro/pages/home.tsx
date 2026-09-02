"use client";

import Link from "next/link";
import { catalogImageSrc } from "@/lib/catalog/image";
import { useStorefrontStore } from "@/stores/storefront-store";
import { ProAddToCartButton } from "../cart-controls";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ProHomePage() {
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );
  const locale = useStorefrontStore((state) => state.locale);
  const sections = useStorefrontStore((state) => state.config.sections);
  const featuredProducts = useStorefrontStore(
    (state) => state.featuredProducts,
  );
  const featuredStatus = useStorefrontStore((state) => state.featuredStatus);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Pro — Home — {businessName} ({locale})
      </h1>

      {sections.featured_products !== false ? (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Featured
          </h2>
          {featuredStatus !== "ok" && featuredStatus !== "idle" ? (
            <p className="mt-4 text-slate-400">
              Featured products could not be loaded.
            </p>
          ) : featuredProducts.length === 0 ? (
            <p className="mt-4 text-slate-400">No featured products yet.</p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <li
                  key={product.id}
                  className="border border-slate-800 bg-slate-900"
                >
                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    className="block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={catalogImageSrc(product.primary_image?.url, "product")}
                      alt={product.primary_image?.alt ?? product.name}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
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
        </section>
      ) : null}
    </main>
  );
}
