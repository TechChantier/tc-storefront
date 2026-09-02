import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HydrateCategories } from "@/components/shared/catalog-hydrators";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { getCategories } from "@/lib/catalog/get-categories";
import { storefrontPageMetadata } from "@/lib/seo/page-metadata";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { CatalogStatus } from "@/stores/storefront-store";

type PageProps = {
  params: Promise<{ hostname: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hostname, locale } = await params;
  return storefrontPageMetadata({
    hostname,
    locale,
    pageName: "Categories",
    pathSuffix: "/categories",
  });
}

export default async function StorefrontCategoriesPage({ params }: PageProps) {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind === "invalid_locale") {
    notFound();
  }

  if (loaded.kind === "error") {
    return <StorefrontErrorView result={loaded.result} />;
  }

  const result = await getCategories({
    tcposSubdomain: loaded.config.tcpos_subdomain,
    locale,
  });

  if (result.status === "invalid_locale") {
    notFound();
  }

  const status: CatalogStatus =
    result.status === "ok" ? "ok" : result.status;
  const categories = result.status === "ok" ? result.categories : [];
  const { CategoryListPage } = loaded.theme;

  return (
    <HydrateCategories categories={categories} status={status}>
      <CategoryListPage />
    </HydrateCategories>
  );
}
