"use client";

import { useLayoutEffect, type ReactNode } from "react";
import type { Category, PaginationMeta, Product } from "@/lib/catalog/types";
import type { ProductQuery } from "@/lib/catalog/product-query";
import {
  useStorefrontStore,
  type CatalogStatus,
} from "@/stores/storefront-store";

type HydrateProductsProps = {
  products: Product[];
  meta: PaginationMeta | null;
  query: ProductQuery;
  status: CatalogStatus;
  categories?: Category[];
  categoriesStatus?: CatalogStatus;
  children: ReactNode;
};

export function HydrateProducts({
  products,
  meta,
  query,
  status,
  categories,
  categoriesStatus,
  children,
}: HydrateProductsProps) {
  const hydrateProducts = useStorefrontStore((state) => state.hydrateProducts);
  const hydrateCategories = useStorefrontStore(
    (state) => state.hydrateCategories,
  );

  useLayoutEffect(() => {
    hydrateProducts({ products, meta, query, status });
    if (categories && categoriesStatus) {
      hydrateCategories({ categories, status: categoriesStatus });
    }
  }, [
    products,
    meta,
    query,
    status,
    categories,
    categoriesStatus,
    hydrateProducts,
    hydrateCategories,
  ]);

  return children;
}

type HydrateCategoriesProps = {
  categories: Category[];
  status: CatalogStatus;
  children: ReactNode;
};

export function HydrateCategories({
  categories,
  status,
  children,
}: HydrateCategoriesProps) {
  const hydrateCategories = useStorefrontStore(
    (state) => state.hydrateCategories,
  );

  useLayoutEffect(() => {
    hydrateCategories({ categories, status });
  }, [categories, status, hydrateCategories]);

  return children;
}

type HydrateFeaturedProductsProps = {
  products: Product[];
  status: CatalogStatus;
  children: ReactNode;
};

export function HydrateFeaturedProducts({
  products,
  status,
  children,
}: HydrateFeaturedProductsProps) {
  const hydrateFeaturedProducts = useStorefrontStore(
    (state) => state.hydrateFeaturedProducts,
  );

  useLayoutEffect(() => {
    hydrateFeaturedProducts({ products, status });
  }, [products, status, hydrateFeaturedProducts]);

  return children;
}

type HydrateProductProps = {
  product: Product | null;
  status: CatalogStatus;
  children: ReactNode;
};

export function HydrateProduct({
  product,
  status,
  children,
}: HydrateProductProps) {
  const hydrateProduct = useStorefrontStore((state) => state.hydrateProduct);

  useLayoutEffect(() => {
    hydrateProduct({ product, status });
  }, [product, status, hydrateProduct]);

  return children;
}
