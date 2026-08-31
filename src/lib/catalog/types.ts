import type { z } from "zod";
import type {
  catalogImageSchema,
  categorySchema,
  categorySummarySchema,
  paginationMetaSchema,
  productSchema,
  seoOverrideSchema,
} from "./schema";
import type { ProductQuery } from "./product-query";

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof catalogImageSchema>;
export type SeoOverride = z.infer<typeof seoOverrideSchema>;

export type CatalogFetchStatus =
  | "ok"
  | "not_found"
  | "unavailable"
  | "invalid"
  | "invalid_locale"
  | "redirect";

export type ProductListResult =
  | { status: "ok"; products: Product[]; meta: PaginationMeta }
  | { status: "unavailable" }
  | { status: "invalid" }
  | { status: "invalid_locale" };

export type ProductResult =
  | { status: "ok"; product: Product }
  | { status: "not_found" }
  | { status: "unavailable" }
  | { status: "invalid" }
  | { status: "invalid_locale" }
  | { status: "redirect"; redirectSlug: string; permanent: boolean };

export type CategoryListResult =
  | { status: "ok"; categories: Category[] }
  | { status: "unavailable" }
  | { status: "invalid" }
  | { status: "invalid_locale" };

export type CategoryResult =
  | { status: "ok"; category: Category }
  | { status: "not_found" }
  | { status: "unavailable" }
  | { status: "invalid" }
  | { status: "invalid_locale" }
  | { status: "redirect"; redirectSlug: string; permanent: boolean };

export type { ProductQuery };
