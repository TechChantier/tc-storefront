import { z } from "zod";

export const CART_PERSIST_VERSION = 1 as const;

export const cartErrorCodeSchema = z.enum([
  "unavailable",
  "insufficient_stock",
]);

export const cartItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  name: z.string(),
  slug: z.string().min(1),
  price: z.number(),
  currency: z.string().min(1),
  image_url: z.string().nullable(),
  available: z.boolean(),
  track_stock: z.boolean(),
  stock_quantity: z.number().nullable(),
});

export const persistedCartSchema = z.object({
  version: z.literal(CART_PERSIST_VERSION),
  tcpos_subdomain: z.string().min(1),
  items: z.array(cartItemSchema),
});

export function parsePersistedCart(
  raw: unknown,
  expectedSubdomain: string,
) {
  const parsed = persistedCartSchema.safeParse(raw);
  if (!parsed.success) return null;
  if (parsed.data.tcpos_subdomain !== expectedSubdomain) return null;
  return parsed.data;
}
