import { notFound, permanentRedirect, redirect } from "next/navigation";
import { HydrateProduct } from "@/components/shared/catalog-hydrators";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { getProduct } from "@/lib/catalog/get-product";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { CatalogStatus } from "@/stores/storefront-store";

type PageProps = {
  params: Promise<{ hostname: string; locale: string; slug: string }>;
};

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
