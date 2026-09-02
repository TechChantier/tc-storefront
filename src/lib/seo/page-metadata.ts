import "server-only";

import type { Metadata } from "next";
import { loadReadyStorefront } from "@/lib/storefront/load-storefront";
import type { StorefrontConfig } from "@/lib/storefront/types";

export const STOREFRONT_ICON_PATH = "/ico.png";

export function fallbackStorefrontMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
    title: { absolute: "Storefront" },
    icons: {
      icon: STOREFRONT_ICON_PATH,
      apple: STOREFRONT_ICON_PATH,
    },
  };
}

export function publicOrigin(config: StorefrontConfig): string {
  const host = config.current_domain.replace(/\/+$/, "");
  const isLocal =
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host.endsWith(".local");
  return `${isLocal ? "http" : "https"}://${host}`;
}

export function storefrontPath(locale: string, suffix = ""): string {
  if (!suffix) return `/${locale}`;
  const path = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `/${locale}${path}`;
}

export function shopDescription(
  config: StorefrontConfig,
  locale: string,
): string | undefined {
  const en = config.seo.description_en?.trim();
  const fr = config.seo.description_fr?.trim();
  if (locale.toLowerCase().startsWith("fr")) {
    return fr || en || undefined;
  }
  return en || fr || undefined;
}

function firstText(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function localizedPath(
  pathname: string,
  fromLocale: string,
  toLocale: string,
): string {
  const prefix = `/${fromLocale}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return `/${toLocale}`;
  }
  if (pathname.startsWith(`${prefix}/`)) {
    return `/${toLocale}${pathname.slice(prefix.length)}`;
  }
  return storefrontPath(toLocale, pathname);
}

export function absoluteAssetUrl(
  origin: string,
  url?: string | null,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function defaultBrandImage(config: StorefrontConfig): string {
  const origin = publicOrigin(config);
  return (
    absoluteAssetUrl(origin, config.branding.logo_url) ??
    `${origin}${STOREFRONT_ICON_PATH}`
  );
}

function shareImage(
  config: StorefrontConfig,
  imageUrl?: string | null,
): string {
  const origin = publicOrigin(config);
  return absoluteAssetUrl(origin, imageUrl) ?? defaultBrandImage(config);
}

export function buildStorefrontMetadata(input: {
  config: StorefrontConfig;
  locale: string;
  pageName: string;
  pathname: string;
  search?: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}): Metadata {
  const tenant = input.config.branding.business_name;
  const origin = publicOrigin(input.config);
  const search = input.search ?? "";
  const canonical = `${origin}${input.pathname}${search}`;
  const description =
    firstText(input.description, shopDescription(input.config, input.locale)) ??
    tenant;
  const image = shareImage(input.config, input.imageUrl);
  const imageAlt = firstText(input.imageAlt, input.pageName, tenant) ?? tenant;
  const fullTitle = `${input.pageName} | ${tenant}`;

  const languages: Record<string, string> = {};
  for (const locale of input.config.supported_locales) {
    languages[locale] = `${origin}${localizedPath(input.pathname, input.locale, locale)}${search}`;
  }
  languages["x-default"] =
    `${origin}${localizedPath(input.pathname, input.locale, input.config.default_locale)}${search}`;

  return {
    title: { absolute: fullTitle },
    description,
    robots: input.config.seo.indexing_enabled
      ? undefined
      : { index: false, follow: false },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: tenant,
      title: fullTitle,
      description,
      url: canonical,
      locale: input.locale,
      images: [
        {
          url: image,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export async function storefrontPageMetadata(input: {
  hostname: string;
  locale: string;
  pageName: string;
  pathSuffix?: string;
}): Promise<Metadata> {
  const loaded = await loadReadyStorefront(input.hostname, input.locale);
  if (loaded.kind !== "ready") {
    return fallbackStorefrontMetadata();
  }

  return buildStorefrontMetadata({
    config: loaded.config,
    locale: input.locale,
    pageName: input.pageName,
    pathname: storefrontPath(input.locale, input.pathSuffix ?? ""),
  });
}
