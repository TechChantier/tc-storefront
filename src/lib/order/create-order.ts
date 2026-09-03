"use server";

import { logEvent } from "@/lib/logger";
import {
  flattenZodFieldErrors,
  orderErrorCodeSchema,
  orderPriceChangeSchema,
  orderStockErrorSchema,
  parseOrderPayload,
  parseOrderResult,
} from "@/lib/schemas/order";
import type { CreateOrderResult, OrderError } from "@/lib/types/order";
import { resolveStorefront } from "@/lib/storefront/resolve-storefront";
import { storefrontMutate } from "@/lib/storefront/tcpos-client";

function firstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function fieldErrorsFromLaravel(
  errors: Record<string, unknown> | undefined,
): Record<string, string> | undefined {
  if (!errors) return undefined;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (key === "price_changes" || key === "items") continue;
    const message = firstString(value);
    if (message) fields[key] = message;
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

function priceChangesFromErrors(
  errors: Record<string, unknown> | undefined,
) {
  const raw = errors?.price_changes;
  if (!Array.isArray(raw)) return undefined;
  const parsed = raw.flatMap((entry) => {
    const result = orderPriceChangeSchema.safeParse(entry);
    return result.success ? [result.data] : [];
  });
  return parsed.length > 0 ? parsed : undefined;
}

function stockItemsFromErrors(errors: Record<string, unknown> | undefined) {
  const raw = errors?.items;
  if (!Array.isArray(raw)) return undefined;
  const parsed = raw.flatMap((entry) => {
    const result = orderStockErrorSchema.safeParse(entry);
    return result.success ? [result.data] : [];
  });
  return parsed.length > 0 ? parsed : undefined;
}

function toOrderError(
  code: string,
  message: string,
  errors?: Record<string, unknown>,
): OrderError {
  const parsedCode = orderErrorCodeSchema.safeParse(code);
  return {
    code: parsedCode.success ? parsedCode.data : "ORDER_CREATION_FAILED",
    message,
    fields: fieldErrorsFromLaravel(errors),
    priceChanges: priceChangesFromErrors(errors),
    stockItems: stockItemsFromErrors(errors),
  };
}

export async function createOrder(input: {
  hostname: string;
  payload: unknown;
}): Promise<CreateOrderResult> {
  const resolved = await resolveStorefront(input.hostname);
  if (resolved.status !== "resolved") {
    const message =
      resolved.status === "disabled"
        ? "This storefront is not accepting orders."
        : resolved.status === "rate_limited"
          ? "Too many requests. Try again shortly."
          : "Unable to place the order right now.";
    const code =
      resolved.status === "rate_limited" ? "RATE_LIMIT_EXCEEDED" : "UNAVAILABLE";
    logEvent("error", "order.resolve_failed", {
      hostname: input.hostname,
      kind: resolved.status,
    });
    return {
      status: "error",
      error: { code, message },
    };
  }

  const parsed = parseOrderPayload(input.payload);
  if (!parsed.success) {
    return {
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "Check the highlighted fields and try again.",
        fields: flattenZodFieldErrors(parsed.error),
      },
    };
  }

  const result = await storefrontMutate<unknown>({
    tcposSubdomain: resolved.config.tcpos_subdomain,
    path: "/orders",
    method: "POST",
    body: parsed.data,
  });

  if (result.status === "unavailable") {
    return {
      status: "error",
      error: {
        code: "UNAVAILABLE",
        message: "Unable to place the order right now.",
      },
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      error: toOrderError(result.code, result.message, result.errors),
    };
  }

  const data = parseOrderResult(result.data);
  if (!data.success) {
    const raw = result.data;
    logEvent("error", "order.result_invalid", {
      tcpos_subdomain: resolved.config.tcpos_subdomain,
      data_type: raw === null ? "null" : typeof raw,
      data_keys:
        raw && typeof raw === "object"
          ? Object.keys(raw as object).join(",")
          : "",
    });
    return {
      status: "error",
      error: {
        code: "ORDER_CREATION_FAILED",
        message: "The order was created but the response could not be read.",
      },
    };
  }

  return { status: "ok", data: data.data };
}
