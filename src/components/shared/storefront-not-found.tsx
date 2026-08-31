import { StorefrontStatusPage } from "./storefront-status-page";

export function StorefrontNotFound() {
  return (
    <StorefrontStatusPage
      title="Storefront not found"
      message="We could not find a storefront for this address."
    />
  );
}
