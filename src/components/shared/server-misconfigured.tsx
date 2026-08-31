import { StorefrontStatusPage } from "./storefront-status-page";

export function ServerMisconfigured() {
  return (
    <StorefrontStatusPage
      title="Storefront unavailable"
      message="This storefront could not be loaded. Please try again later."
    />
  );
}
