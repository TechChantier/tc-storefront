import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import { StorefrontProvider } from "@/stores/storefront-provider";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ hostname: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hostname: string; locale: string }>;
}): Promise<Metadata> {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind !== "ready") {
    return { robots: { index: false, follow: false }, title: "Storefront" };
  }

  const { config } = loaded;
  return {
    title: config.branding.business_name,
    robots: config.seo.indexing_enabled
      ? undefined
      : { index: false, follow: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { hostname, locale } = await params;
  const loaded = await loadReadyStorefront(hostname, locale);

  if (loaded.kind === "invalid_locale") {
    notFound();
  }

  if (loaded.kind === "error") {
    return <StorefrontErrorView result={loaded.result} />;
  }

  const { Layout } = loaded.theme;

  return (
    <StorefrontProvider
      config={loaded.config}
      locale={loaded.locale}
      hostname={loaded.hostname}
    >
      <Layout>{children}</Layout>
    </StorefrontProvider>
  );
}
