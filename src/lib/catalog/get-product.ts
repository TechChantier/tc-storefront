import "server-only";

import { catalogProductTag, catalogProductsTag } from "@/lib/catalog/cache-tags";
import { parseProduct } from "@/lib/catalog/schema";
import type { ProductResult } from "@/lib/catalog/types";
import { logEvent } from "@/lib/logger";
import { storefrontFetch } from "@/lib/storefront/tcpos-client";

type GetProductOptions = {
  tcposSubdomain: string;
  slug: string;
  locale?: string;
};

export async function getProduct(
  options: GetProductOptions,
): Promise<ProductResult> {
  const path = `/products/${encodeURIComponent(options.slug)}`;
  const result = await storefrontFetch<unknown>({
    tcposSubdomain: options.tcposSubdomain,
    path,
    searchParams: { locale: options.locale },
    tags: [
      catalogProductsTag(options.tcposSubdomain),
    ],
  });

  if (result.status === "redirect") {
    return {
      status: "redirect",
      redirectSlug: result.redirectSlug,
      permanent: result.permanent,
    };
  }

  if (
    result.status === "not_found" ||
    result.status === "invalid_locale" ||
    result.status === "invalid"
  ) {
    return { status: result.status };
  }

  if (result.status !== "ok") {
    logEvent("error", "catalog.product_fetch_failed", {
      tcpos_subdomain: options.tcposSubdomain,
      path,
      status: result.status,
    });
    return { status: "unavailable" };
  }

  const parsed = parseProduct(result.data);
  if (!parsed.success) {
    logEvent("error", "catalog.product_fetch_invalid", {
      tcpos_subdomain: options.tcposSubdomain,
      path,
    });
    return { status: "invalid" };
  }

  await storefrontFetch<unknown>({
    tcposSubdomain: options.tcposSubdomain,
    path,
    searchParams: { locale: options.locale },
    tags: [
      catalogProductsTag(options.tcposSubdomain),
      catalogProductTag(options.tcposSubdomain, parsed.data.id),
    ],
  });

  return { status: "ok", product: parsed.data };
}
