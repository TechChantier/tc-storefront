import { StorefrontStatusPage } from "./storefront-status-page";

export function UnsupportedTemplate() {
  return (
    <StorefrontStatusPage
      title="Unsupported template"
      message="This storefront is using a template that is not available yet."
    />
  );
}
