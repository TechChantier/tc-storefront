import { notFound } from "next/navigation";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";

type PageProps = {
  params: Promise<{ hostname: string; locale: string }>;
};

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
