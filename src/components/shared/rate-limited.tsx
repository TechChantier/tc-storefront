import { StorefrontStatusPage } from "./storefront-status-page";

export function RateLimited() {
  return (
    <StorefrontStatusPage
      title="Please try again"
      message="The storefront is busy right now. Wait a moment and refresh the page."
    />
  );
}
