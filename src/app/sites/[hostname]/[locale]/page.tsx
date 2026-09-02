import { notFound } from "next/navigation";
import {
  HydrateCategories,
  HydrateFeaturedProducts,
} from "@/components/shared/catalog-hydrators";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { getCategories } from "@/lib/catalog/get-categories";
import { getProducts } from "@/lib/catalog/get-products";
import { DEFAULT_PRODUCT_QUERY } from "@/lib/catalog/product-query";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { CatalogStatus } from "@/stores/storefront-store";

type PageProps = {
  params: Promise<{ hostname: string; locale: string }>;
};

export default async function StorefrontHomePage({ params }: PageProps) {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind === "invalid_locale") {
    notFound();
  }

  if (loaded.kind === "error") {
    return <StorefrontErrorView result={loaded.result} />;
  }

  const featuredQuery = {
    ...DEFAULT_PRODUCT_QUERY,
    locale,
    per_page: 8,
    featured: true,
  };

  const [featuredResult, categoriesResult] = await Promise.all([
    getProducts({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      query: featuredQuery,
    }),
    getCategories({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      locale,
    }),
  ]);

  if (featuredResult.status === "invalid_locale") {
    notFound();
  }

  const featuredStatus: CatalogStatus =
    featuredResult.status === "ok" ? "ok" : featuredResult.status;
  const featuredProducts =
    featuredResult.status === "ok" ? featuredResult.products : [];

  const categoriesStatus: CatalogStatus =
    categoriesResult.status === "ok"
      ? "ok"
      : categoriesResult.status === "invalid_locale"
        ? "invalid_locale"
        : categoriesResult.status;
  const categories =
    categoriesResult.status === "ok" ? categoriesResult.categories : [];

  const { HomePage } = loaded.theme;

  return (
    <HydrateCategories categories={categories} status={categoriesStatus}>
      <HydrateFeaturedProducts
        products={featuredProducts}
        status={featuredStatus}
      >
        <HomePage />
      </HydrateFeaturedProducts>
    </HydrateCategories>
  );
}
