import { notFound } from "next/navigation";
import {
  HydrateFeaturedProducts,
  HydrateProducts,
} from "@/components/shared/catalog-hydrators";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { getCategories } from "@/lib/catalog/get-categories";
import { getProducts } from "@/lib/catalog/get-products";
import {
  DEFAULT_PRODUCT_QUERY,
  parseProductQuery,
} from "@/lib/catalog/product-query";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { CatalogStatus } from "@/stores/storefront-store";

type PageProps = {
  params: Promise<{ hostname: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StorefrontProductsPage({
  params,
  searchParams,
}: PageProps) {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind === "invalid_locale") {
    notFound();
  }

  if (loaded.kind === "error") {
    return <StorefrontErrorView result={loaded.result} />;
  }

  const rawSearch = await searchParams;
  const query = { ...parseProductQuery(rawSearch), locale };
  const featuredQuery = {
    ...DEFAULT_PRODUCT_QUERY,
    locale,
    per_page: 8,
    featured: true,
  };

  const [productsResult, categoriesResult, featuredResult] = await Promise.all([
    getProducts({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      query,
    }),
    getCategories({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      locale,
    }),
    getProducts({
      tcposSubdomain: loaded.config.tcpos_subdomain,
      query: featuredQuery,
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

  const featuredStatus: CatalogStatus =
    featuredResult.status === "ok" ? "ok" : featuredResult.status;
  const featuredProducts =
    featuredResult.status === "ok" ? featuredResult.products : [];

  const { ProductListPage } = loaded.theme;

  return (
    <HydrateProducts
      products={products}
      meta={meta}
      query={query}
      status={productsStatus}
      categories={categories}
      categoriesStatus={categoriesStatus}
    >
      <HydrateFeaturedProducts
        products={featuredProducts}
        status={featuredStatus}
      >
        <ProductListPage />
      </HydrateFeaturedProducts>
    </HydrateProducts>
  );
}
