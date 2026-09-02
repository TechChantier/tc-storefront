export const NO_PRODUCT_IMAGE = "/img/no-product.png";
export const NO_CATEGORY_IMAGE = "/img/no-category.png";

export type CatalogImageKind = "product" | "category";

/**
 * Product / category image URL, or the shared placeholder when missing.
 * Do not use for branding, hero, or other non-catalog media.
 */
export function catalogImageSrc(
  url: string | null | undefined,
  kind: CatalogImageKind,
): string {
  if (typeof url === "string" && url.trim().length > 0) {
    return url.trim();
  }
  return kind === "category" ? NO_CATEGORY_IMAGE : NO_PRODUCT_IMAGE;
}
