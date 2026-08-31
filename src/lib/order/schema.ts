import { z } from "zod";

export const MAX_ORDER_ITEMS = 50;

export const fulfillmentMethodSchema = z.enum(["delivery", "pickup"]);

export const checkoutFormSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    phone: z.string().trim().min(1).max(50),
    email: z.string().trim().max(255),
    country: z.string().trim().min(1).max(255),
    city: z.string().trim().min(1).max(255),
    address: z.string().trim().min(1).max(1000),
    method: fulfillmentMethodSchema,
    fulfillmentAddress: z.string().trim().max(1000),
    note: z.string().trim().max(2000),
    sameAsCustomerAddress: z.boolean(),
  })
  .superRefine((form, ctx) => {
    if (form.email.length > 0) {
      const email = z.email().safeParse(form.email);
      if (!email.success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid email address.",
          path: ["email"],
        });
      }
    }

    if (form.method === "delivery") {
      const deliveryAddress = form.sameAsCustomerAddress
        ? form.address
        : form.fulfillmentAddress;
      if (deliveryAddress.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "A delivery address is required.",
          path: ["fulfillmentAddress"],
        });
      }
    }
  });

export const orderItemPayloadSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
  displayed_price: z.number().min(0).optional(),
});

export const orderPayloadSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(255),
    phone: z.string().min(1).max(50),
    email: z.email().max(255).nullable().optional(),
    country: z.string().min(1).max(255),
    city: z.string().min(1).max(255),
    address: z.string().min(1).max(1000),
  }),
  fulfillment: z
    .object({
      method: fulfillmentMethodSchema,
      address: z.string().max(1000).nullable(),
      note: z.string().max(2000).nullable(),
    })
    .superRefine((fulfillment, ctx) => {
      if (
        fulfillment.method === "delivery" &&
        (!fulfillment.address || fulfillment.address.length === 0)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "A delivery address is required.",
          path: ["address"],
        });
      }
    }),
  items: z.array(orderItemPayloadSchema).min(1).max(MAX_ORDER_ITEMS),
  locale: z.string().max(5).nullable().optional(),
  idempotency_key: z.string().uuid(),
});

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asCurrency(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["code", "currency", "value"]) {
      if (typeof record[key] === "string" && record[key].trim().length > 0) {
        return record[key].trim();
      }
    }
  }
  return "XAF";
}

export const orderResultSchema = z.object({
  public_reference: z.string().min(1),
  status: z.string().min(1).optional().default("pending"),
  currency: z.unknown().transform(asCurrency),
  subtotal: z.unknown().transform((value) => asNumber(value)),
  delivery_fee: z.unknown().transform((value) => asNumber(value)),
  tax: z.unknown().transform((value) => asNumber(value)),
  total: z.unknown().transform((value) => asNumber(value)),
  created_at: z.string().nullable().optional(),
});

export const orderPriceChangeSchema = z.object({
  product_id: z.string().min(1),
  displayed_price: z.number(),
  current_price: z.number(),
});

export const orderStockErrorSchema = z.object({
  product_id: z.string().min(1),
  requested_quantity: z.number().int(),
  available_quantity: z.number(),
});

export const orderErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "INSUFFICIENT_STOCK",
  "ORDER_REQUIRES_CONFIRMATION",
  "IDEMPOTENCY_KEY_REUSED",
  "ORDER_PROCESSING",
  "RATE_LIMIT_EXCEEDED",
  "PRODUCT_UNAVAILABLE",
  "ORDER_CREATION_FAILED",
  "CART_EMPTY",
  "CART_TOO_LARGE",
  "UNAVAILABLE",
]);

export function flattenZodFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_form";
    if (!fields[path]) {
      fields[path] = issue.message;
    }
  }
  return fields;
}

export function parseCheckoutForm(data: unknown) {
  return checkoutFormSchema.safeParse(data);
}

export function parseOrderPayload(data: unknown) {
  return orderPayloadSchema.safeParse(data);
}

export function parseOrderResult(data: unknown) {
  const unwrapped =
    data &&
    typeof data === "object" &&
    "public_reference" in (data as object) === false &&
    "data" in (data as object) &&
    (data as { data?: unknown }).data &&
    typeof (data as { data?: unknown }).data === "object"
      ? (data as { data: unknown }).data
      : data;

  const parsed = orderResultSchema.safeParse(unwrapped);
  if (parsed.success) return parsed;

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    "public_reference" in unwrapped &&
    typeof (unwrapped as { public_reference?: unknown }).public_reference ===
      "string" &&
    (unwrapped as { public_reference: string }).public_reference.length > 0
  ) {
    const record = unwrapped as Record<string, unknown>;
    return {
      success: true as const,
      data: {
        public_reference: record.public_reference as string,
        status:
          typeof record.status === "string" && record.status.length > 0
            ? record.status
            : "pending",
        currency: asCurrency(record.currency),
        subtotal: asNumber(record.subtotal),
        delivery_fee: asNumber(record.delivery_fee),
        tax: asNumber(record.tax),
        total: asNumber(record.total),
        created_at:
          typeof record.created_at === "string" ? record.created_at : null,
      },
    };
  }

  return parsed;
}
