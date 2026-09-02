import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { storefrontPageMetadata } from "@/lib/seo/page-metadata";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";

type PageProps = {
  params: Promise<{ hostname: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hostname, locale } = await params;
  return storefrontPageMetadata({
    hostname,
    locale,
    pageName: "Checkout",
    pathSuffix: "/checkout",
  });
}

export default async function StorefrontCheckoutPage({ params }: PageProps) {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind === "invalid_locale") {
    notFound();
  }

  if (loaded.kind === "error") {
    return <StorefrontErrorView result={loaded.result} />;
  }

  const { CheckoutPage } = loaded.theme;
  return <CheckoutPage />;
}
