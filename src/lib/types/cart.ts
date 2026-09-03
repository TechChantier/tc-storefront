import type { z } from "zod";
import type { cartErrorCodeSchema, cartItemSchema } from "@/lib/schemas/cart";

export type CartErrorCode = z.infer<typeof cartErrorCodeSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type CartStockSource = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  available: boolean;
  track_stock?: boolean;
  stock_quantity?: number | null;
  primary_image?: { url: string } | null;
};

export type CartMutationResult = {
  items: CartItem[];
  error: CartErrorCode | null;
};
