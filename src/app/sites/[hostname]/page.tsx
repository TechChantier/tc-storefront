import { redirectToDefaultLocale } from "@/lib/storefront/redirect-to-locale";

type StorefrontRootPageProps = {
  params: Promise<{ hostname: string }>;
};

export default async function StorefrontRootPage({
  params,
}: StorefrontRootPageProps) {
  const { hostname } = await params;
  return redirectToDefaultLocale(hostname);
}
