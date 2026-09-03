import "server-only";

import { catalogCategoriesTag } from "@/lib/catalog/cache-tags";
import { parseCategoryList } from "@/lib/schemas/catalog";
import type { CategoryListResult } from "@/lib/types/catalog";
import { logEvent } from "@/lib/logger";
import { storefrontFetch } from "@/lib/storefront/tcpos-client";

type GetCategoriesOptions = {
  tcposSubdomain: string;
  locale?: string;
  featured?: boolean;
};

export async function getCategories(
  options: GetCategoriesOptions,
): Promise<CategoryListResult> {
  const result = await storefrontFetch<unknown>({
    tcposSubdomain: options.tcposSubdomain,
    path: "/categories",
    searchParams: {
      locale: options.locale,
      featured: options.featured === true ? 1 : undefined,
    },
    tags: [catalogCategoriesTag(options.tcposSubdomain)],
  });

  if (result.status === "invalid_locale") {
    return { status: "invalid_locale" };
  }

  if (result.status !== "ok") {
    logEvent("error", "catalog.categories_fetch_failed", {
      tcpos_subdomain: options.tcposSubdomain,
      status: result.status,
    });
    return { status: result.status === "invalid" ? "invalid" : "unavailable" };
  }

  const parsed = parseCategoryList(result.data);
  if (!parsed.success) {
    logEvent("error", "catalog.categories_fetch_invalid", {
      tcpos_subdomain: options.tcposSubdomain,
    });
    return { status: "invalid" };
  }

  return { status: "ok", categories: parsed.data };
}
