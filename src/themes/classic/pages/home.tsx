"use client";

import Link from "next/link";
import { catalogImageSrc } from "@/lib/catalog/image";
import { useStorefrontStore } from "@/stores/storefront-store";
import { ClassicAddToCartButton } from "../cart-controls";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ClassicHomePage() {
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Classic — Home — {businessName} ({locale})
      </h1>

      {sections.featured_products !== false ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Featured</h2>
          {featuredStatus !== "ok" && featuredStatus !== "idle" ? (
            <p className="mt-4 text-stone-600">
              Featured products could not be loaded.
            </p>
          ) : featuredProducts.length === 0 ? (
            <p className="mt-4 text-stone-600">No featured products yet.</p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {featuredProducts.map((product) => (
                <li key={product.id} className="border border-stone-200 bg-white">
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
                      <h3 className="text-lg">{product.name}</h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <ClassicAddToCartButton product={product} />
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
