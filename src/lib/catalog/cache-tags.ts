export function catalogProductsTag(tcposSubdomain: string): string {
  return `catalog:${tcposSubdomain}:products`;
}

export function catalogProductTag(
  tcposSubdomain: string,
  productId: string,
): string {
  return `catalog:${tcposSubdomain}:product:${productId}`;
}

export function catalogCategoriesTag(tcposSubdomain: string): string {
  return `catalog:${tcposSubdomain}:categories`;
}

export function catalogCategoryTag(
  tcposSubdomain: string,
  categoryId: string,
): string {
  return `catalog:${tcposSubdomain}:category:${categoryId}`;
}
