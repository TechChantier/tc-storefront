import { RateLimited } from "@/components/shared/rate-limited";
import { ServerMisconfigured } from "@/components/shared/server-misconfigured";
import { StorefrontNotFound } from "@/components/shared/storefront-not-found";
import { StorefrontUnavailable } from "@/components/shared/storefront-unavailable";
import { UnsupportedTemplate } from "@/components/shared/unsupported-template";
import type { StorefrontLoadResult } from "@/lib/storefront/load-storefront";

export function StorefrontErrorView({
  result,
}: {
  result: Exclude<StorefrontLoadResult, { kind: "ready" }>;
}) {
  switch (result.kind) {
    case "not_found":
      return <StorefrontNotFound />;
    case "disabled":
      return <StorefrontUnavailable />;
    case "unsupported_template":
      return <UnsupportedTemplate />;
    case "rate_limited":
      return <RateLimited />;
    case "misconfigured":
      return <ServerMisconfigured />;
  }
}
