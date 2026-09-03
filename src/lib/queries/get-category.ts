import "server-only";

import { catalogCategoriesTag, catalogCategoryTag } from "@/lib/catalog/cache-tags";
import { parseCategory } from "@/lib/schemas/catalog";
import type { CategoryResult } from "@/lib/types/catalog";
import { logEvent } from "@/lib/logger";
import { storefrontFetch } from "@/lib/storefront/tcpos-client";

type GetCategoryOptions = {
  tcposSubdomain: string;
  slug: string;
  locale?: string;
};

export async function getCategory(
  options: GetCategoryOptions,
): Promise<CategoryResult> {
  const path = `/categories/${encodeURIComponent(options.slug)}`;
  const result = await storefrontFetch<unknown>({
    tcposSubdomain: options.tcposSubdomain,
    path,
    searchParams: { locale: options.locale },
    tags: [catalogCategoriesTag(options.tcposSubdomain)],
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
    logEvent("error", "catalog.category_fetch_failed", {
      tcpos_subdomain: options.tcposSubdomain,
      path,
      status: result.status,
    });
    return { status: "unavailable" };
  }

  const parsed = parseCategory(result.data);
  if (!parsed.success) {
    logEvent("error", "catalog.category_fetch_invalid", {
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
      catalogCategoriesTag(options.tcposSubdomain),
      catalogCategoryTag(options.tcposSubdomain, parsed.data.id),
    ],
  });

  return { status: "ok", category: parsed.data };
}
