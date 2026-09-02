"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "../lib/format";
import { cn } from "../lib/cn";
import { Media } from "./media";
import { UnavailableTag } from "./unavailable-tag";

type ProductCardVariant = "standard" | "featured" | "compact";

export function ProductCard({
  product,
  href,
  variant = "standard",
}: {
  product: Product;
  href: string;
  variant?: ProductCardVariant;
}) {
  const featuredLayout = variant === "featured";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden bg-[var(--v-container-lowest)] transition-shadow duration-300 hover:shadow-[var(--v-shadow)]",
        variant === "compact" ? "bg-transparent shadow-none hover:shadow-none" : "rounded-lg",
        featuredLayout && "w-full",
      )}
    >
      <Link href={href} className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "relative overflow-hidden bg-[var(--v-container)]",
            featuredLayout
              ? "aspect-[4/5] sm:aspect-[4/3]"
              : "aspect-[4/5]",
            variant === "compact" && "mb-3 rounded-xl",
          )}
        >
          <Media
            src={product.primary_image?.url}
            alt={product.primary_image?.alt ?? product.name}
            missingLabel="Product image"
            kind="product"
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
          />
          {product.available ? null : <UnavailableTag />}
          {featuredLayout && product.available ? (
            <div className="absolute top-4 right-4 rounded-full bg-[var(--v-surface)]/90 px-3 py-1 backdrop-blur">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--v-primary)]">
                Featured
              </span>
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            variant === "compact" ? "px-0" : "p-4",
          )}
        >
          <div className="min-w-0">
            {product.category?.name ? (
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)]">
                {product.category.name}
              </span>
            ) : null}
            <h2
              className={cn(
                "text-[var(--v-on-surface)]",
                featuredLayout
                  ? "v-serif text-2xl font-medium"
                  : variant === "compact"
                    ? "v-serif text-lg font-medium"
                    : "text-lg font-medium",
              )}
            >
              {product.name}
            </h2>
          </div>
          <span
            className={cn(
              "shrink-0 text-[var(--v-primary)]",
              featuredLayout ? "text-lg" : "text-base",
            )}
          >
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </Link>
    </article>
  );
}
