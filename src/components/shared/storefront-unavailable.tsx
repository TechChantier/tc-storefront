import { StorefrontStatusPage } from "./storefront-status-page";

export function StorefrontUnavailable() {
  return (
    <StorefrontStatusPage
      title="Storefront unavailable"
      message="This storefront is temporarily unavailable."
    />
  );
}
