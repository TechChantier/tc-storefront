import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import {
  defaultBrandImage,
  fallbackStorefrontMetadata,
  publicOrigin,
  shopDescription,
} from "@/lib/seo/page-metadata";
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
    return fallbackStorefrontMetadata();
  }

  const { config } = loaded;
  const tenant = config.branding.business_name;
  const origin = publicOrigin(config);
  const description = shopDescription(config, locale) ?? tenant;
  const brandImage = defaultBrandImage(config);

  return {
    metadataBase: new URL(origin),
    title: {
      default: `Home | ${tenant}`,
      template: `%s | ${tenant}`,
    },
    description,
    robots: config.seo.indexing_enabled
      ? undefined
      : { index: false, follow: false },
    icons: {
      icon: [{ url: brandImage }],
      apple: [{ url: brandImage }],
    },
    openGraph: {
      type: "website",
      siteName: tenant,
      images: [
        {
          url: brandImage,
          alt: tenant,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
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
