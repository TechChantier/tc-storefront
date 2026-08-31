import { redirect } from "next/navigation";
import { StorefrontErrorView } from "@/components/shared/storefront-error-view";
import { loadStorefront } from "@/lib/storefront/load-storefront";

export async function redirectToDefaultLocale(
  hostnameParam: string,
  suffix = "",
) {
  const result = await loadStorefront(hostnameParam);

  if (result.kind !== "ready") {
    return <StorefrontErrorView result={result} />;
  }

  const path = suffix
    ? `/${result.config.default_locale}${suffix}`
    : `/${result.config.default_locale}`;

  redirect(path);
}
