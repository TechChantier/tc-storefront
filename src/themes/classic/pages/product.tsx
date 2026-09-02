"use client";

import Link from "next/link";
import { catalogImageSrc } from "@/lib/catalog/image";
import { useStorefrontStore } from "@/stores/storefront-store";
import { ClassicAddToCartButton } from "../cart-controls";

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`;
}

export function ClassicProductPage() {
  const locale = useStorefrontStore((state) => state.locale);
  const product = useStorefrontStore((state) => state.product);
  const status = useStorefrontStore((state) => state.productStatus);

  if (status !== "ok" || !product) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <p className="text-stone-600">This product could not be loaded.</p>
        <Link href={`/${locale}/products`} className="mt-4 hover:underline">
          Back to products
        </Link>
      </main>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.primary_image
        ? [product.primary_image]
        : [{ url: catalogImageSrc(null, "product"), alt: product.name }];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <Link href={`/${locale}/products`} className="text-sm hover:underline">
        Back to products
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Classic — {product.name}
      </h1>
      <p className="mt-2 text-lg text-stone-700">
        {formatPrice(product.price, product.currency)}
      </p>
      <p className="mt-1 text-sm text-stone-500">
        {product.available ? "In stock" : "Unavailable"}
      </p>
      <div className="mt-6">
        <ClassicAddToCartButton product={product} />
      </div>

      {images.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.url}
              src={catalogImageSrc(image.url, "product")}
              alt={image.alt ?? product.name}
              className="w-full object-cover"
            />
          ))}
        </div>
      ) : null}

      {product.short_description ? (
        <p className="mt-6 text-stone-700">{product.short_description}</p>
      ) : null}

      {product.description ? (
        <div
          className="mt-6 max-w-none text-stone-700"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ) : null}
    </main>
  );
}
