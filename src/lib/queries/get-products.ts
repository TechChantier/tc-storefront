import "server-only";

import { catalogProductsTag } from "@/lib/catalog/cache-tags";
import {
  parsePaginationMeta,
  parseProductList,
} from "@/lib/schemas/catalog";
import type { ProductListResult, ProductQuery } from "@/lib/types/catalog";
import { productQueryToSearchParamsRecord } from "@/lib/queries/product-query";
import { logEvent } from "@/lib/logger";
import { storefrontFetch } from "@/lib/storefront/tcpos-client";

type GetProductsOptions = {
  tcposSubdomain: string;
  query: ProductQuery;
};

function fallbackMeta(page: number, perPage: number, total: number) {
  const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
  return {
    current_page: page,
    per_page: perPage,
    last_page: lastPage,
    total,
    from: total ? 1 : null,
    to: Math.min(perPage, total),
  };
}

export async function getProducts(
  options: GetProductsOptions,
): Promise<ProductListResult> {
  const result = await storefrontFetch<unknown>({
    tcposSubdomain: options.tcposSubdomain,
    path: "/products",
    searchParams: productQueryToSearchParamsRecord(options.query),
    tags: [catalogProductsTag(options.tcposSubdomain)],
  });

  if (result.status === "invalid_locale") {
    return { status: "invalid_locale" };
  }

  if (result.status !== "ok") {
    logEvent("error", "catalog.products_fetch_failed", {
      tcpos_subdomain: options.tcposSubdomain,
      status: result.status,
    });
    return { status: result.status === "invalid" ? "invalid" : "unavailable" };
  }

  const parsed = parseProductList(result.data);
  if (!parsed.success) {
    logEvent("error", "catalog.products_fetch_invalid", {
      tcpos_subdomain: options.tcposSubdomain,
    });
    return { status: "invalid" };
  }

  const metaParsed = parsePaginationMeta(result.meta);
  const meta = metaParsed.success
    ? metaParsed.data
    : fallbackMeta(
        options.query.page,
        options.query.per_page,
        parsed.data.length,
      );

  return { status: "ok", products: parsed.data, meta };
}
