import { redirectToDefaultLocale } from "@/lib/storefront/redirect-to-locale";

type PageProps = {
  params: Promise<{ hostname: string }>;
};

export default async function ProductsRedirectPage({ params }: PageProps) {
  const { hostname } = await params;
  return redirectToDefaultLocale(hostname, "/products");
}
