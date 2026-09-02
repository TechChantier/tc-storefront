import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Metadata } from "next";
import { HydrateProduct } from "@/components/shared/catalog-hydrators";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { getProduct } from "@/lib/catalog/get-product";
import {
  buildStorefrontMetadata,
  fallbackStorefrontMetadata,
  storefrontPath,
} from "@/lib/seo/page-metadata";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { CatalogStatus } from "@/stores/storefront-store";

type PageProps = {
  params: Promise<{ hostname: string; locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hostname, locale, slug } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);
  if (loaded.kind !== "ready") {
    return fallbackStorefrontMetadata();
  }

  const result = await getProduct({
    tcposSubdomain: loaded.config.tcpos_subdomain,
    slug,
    locale,
  });

  if (result.status !== "ok") {
    return buildStorefrontMetadata({
      config: loaded.config,
      locale,
      pageName: "Products",
      pathname: storefrontPath(locale, "/products"),
    });
  }

  const product = result.product;
  return buildStorefrontMetadata({
    config: loaded.config,
    locale,
    pageName: product.seo?.title?.trim() || product.name,
    description:
      product.seo?.description?.trim() ||
      product.short_description ||
      undefined,
    imageUrl: product.primary_image?.url,
    imageAlt: product.primary_image?.alt || product.name,
    pathname: storefrontPath(locale, `/products/${product.slug}`),
  });
}

export default async function StorefrontProductPage({ params }: PageProps) {
  const { hostname, locale, slug } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind === "invalid_locale") {
    notFound();
  }

  if (loaded.kind === "error") {
    return <StorefrontErrorView result={loaded.result} />;
  }

  const result = await getProduct({
    tcposSubdomain: loaded.config.tcpos_subdomain,
    slug,
    locale,
  });

  if (result.status === "redirect") {
    const href = `/${locale}/products/${result.redirectSlug}`;
    if (result.permanent) {
      permanentRedirect(href);
    }
    redirect(href);
  }

  if (result.status === "not_found" || result.status === "invalid_locale") {
    notFound();
  }

  const status: CatalogStatus = result.status === "ok" ? "ok" : result.status;
  const product = result.status === "ok" ? result.product : null;
  const { ProductPage } = loaded.theme;

  return (
    <HydrateProduct product={product} status={status}>
      <ProductPage />
    </HydrateProduct>
  );
}
