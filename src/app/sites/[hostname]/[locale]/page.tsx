import { notFound } from "next/navigation";
import { HydrateProducts } from "@/components/shared/catalog-hydrators";
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

  const query = { ...DEFAULT_PRODUCT_QUERY, locale, per_page: 8 };

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      query,
    }),
    getCategories({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      locale,
    }),
  ]);

  if (productsResult.status === "invalid_locale") {
    notFound();
  }

  const productsStatus: CatalogStatus =
    productsResult.status === "ok" ? "ok" : productsResult.status;
  const products =
    productsResult.status === "ok" ? productsResult.products : [];
  const meta = productsResult.status === "ok" ? productsResult.meta : null;

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
    <HydrateProducts
      products={products}
      meta={meta}
      query={query}
      status={productsStatus}
      categories={categories}
      categoriesStatus={categoriesStatus}
    >
      <HomePage />
    </HydrateProducts>
  );
}
