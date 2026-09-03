import { z } from "zod";

export const paginationMetaSchema = z.object({
  current_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  last_page: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  from: z.number().int().nonnegative().nullable().optional(),
  to: z.number().int().nonnegative().nullable().optional(),
});

export const seoOverrideSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const catalogImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().nullable().optional(),
});

export const categorySummarySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string().min(1),
});

export const categorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string(),
  description: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  product_count: z.number().int().nonnegative().optional(),
  image: catalogImageSchema.nullable().optional(),
  seo: seoOverrideSchema.nullable().optional(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number(),
  compare_at_price: z.number().nullable().optional(),
  currency: z.string().min(1),
  available: z.boolean(),
  stock_quantity: z.number().nullable().optional(),
  track_stock: z.boolean().optional(),
  featured: z.boolean().optional(),
  category: categorySummarySchema.nullable().optional(),
  primary_image: catalogImageSchema.nullable().optional(),
  images: z.array(catalogImageSchema).optional().default([]),
  seo: seoOverrideSchema.nullable().optional(),
  variants: z.array(z.unknown()).optional().default([]),
  updated_at: z.string().optional(),
});

export const productListSchema = z.array(productSchema);
export const categoryListSchema = z.array(categorySchema);

export function parseProduct(data: unknown) {
  return productSchema.safeParse(data);
}

export function parseProductList(data: unknown) {
  return productListSchema.safeParse(data);
}

export function parseCategory(data: unknown) {
  return categorySchema.safeParse(data);
}

export function parseCategoryList(data: unknown) {
  return categoryListSchema.safeParse(data);
}

export function parsePaginationMeta(data: unknown) {
  return paginationMetaSchema.safeParse(data);
}
