import type { z } from "zod";
import type {
  checkoutFormSchema,
  orderErrorCodeSchema,
  orderPayloadSchema,
  orderPriceChangeSchema,
  orderResultSchema,
  orderStockErrorSchema,
} from "./schema";

export type CheckoutForm = z.infer<typeof checkoutFormSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;
export type OrderResult = z.infer<typeof orderResultSchema>;
export type OrderErrorCode = z.infer<typeof orderErrorCodeSchema>;
export type OrderPriceChange = z.infer<typeof orderPriceChangeSchema>;
export type OrderStockError = z.infer<typeof orderStockErrorSchema>;

export type OrderStatus = "idle" | "submitting" | "success" | "error";

export type OrderError = {
  code: OrderErrorCode;
  message: string;
  fields?: Record<string, string>;
  priceChanges?: OrderPriceChange[];
  stockItems?: OrderStockError[];
};

export type CreateOrderResult =
  | { status: "ok"; data: OrderResult }
  | { status: "error"; error: OrderError };
