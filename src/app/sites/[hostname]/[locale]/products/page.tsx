import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  HydrateFeaturedProducts,
  HydrateProducts,
} from "@/components/shared/catalog-hydrators";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { getCategories } from "@/lib/catalog/get-categories";
import { getCategory } from "@/lib/catalog/get-category";
import { getProducts } from "@/lib/catalog/get-products";
import {
  DEFAULT_PRODUCT_QUERY,
  parseProductQuery,
} from "@/lib/catalog/product-query";
import {
  buildStorefrontMetadata,
  fallbackStorefrontMetadata,
  storefrontPath,
} from "@/lib/seo/page-metadata";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { CatalogStatus } from "@/stores/storefront-store";

type PageProps = {
  params: Promise<{ hostname: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);
  if (loaded.kind !== "ready") {
    return fallbackStorefrontMetadata();
  }

  const query = parseProductQuery(await searchParams);
  if (!query.category) {
    return buildStorefrontMetadata({
      config: loaded.config,
      locale,
      pageName: "Products",
      pathname: storefrontPath(locale, "/products"),
    });
  }

  const categoryResult = await getCategory({
    tcposSubdomain: loaded.config.tcpos_subdomain,
    slug: query.category,
    locale,
  });

  if (categoryResult.status !== "ok") {
    return buildStorefrontMetadata({
      config: loaded.config,
      locale,
      pageName: "Products",
      pathname: storefrontPath(locale, "/products"),
    });
  }

  const category = categoryResult.category;
  return buildStorefrontMetadata({
    config: loaded.config,
    locale,
    pageName: category.seo?.title?.trim() || category.name,
    description:
      category.seo?.description?.trim() || category.description || undefined,
    imageUrl: category.image?.url,
    imageAlt: category.image?.alt || category.name,
    pathname: storefrontPath(locale, "/products"),
    search: `?category=${encodeURIComponent(category.slug)}`,
  });
}

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
