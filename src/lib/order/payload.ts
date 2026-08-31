import type { CartItem } from "@/lib/cart/types";
import { MAX_ORDER_ITEMS, parseCheckoutForm } from "./schema";
import type { CheckoutForm, OrderPayload } from "./types";

export const EMPTY_CHECKOUT_FORM: CheckoutForm = {
  name: "",
  phone: "",
  email: "",
  country: "",
  city: "",
  address: "",
  method: "delivery",
  fulfillmentAddress: "",
  note: "",
  sameAsCustomerAddress: true,
};

export function resolveFulfillmentAddress(form: CheckoutForm): string | null {
  if (form.method !== "delivery") return null;
  const address = form.sameAsCustomerAddress
    ? form.address.trim()
    : form.fulfillmentAddress.trim();
  return address.length > 0 ? address : null;
}

export function buildOrderPayload(input: {
  form: CheckoutForm;
  items: CartItem[];
  locale: string;
  idempotencyKey: string;
}): { ok: true; payload: OrderPayload } | { ok: false; error: unknown } {
  const formParsed = parseCheckoutForm(input.form);
  if (!formParsed.success) {
    return { ok: false, error: formParsed.error };
  }

  const form = formParsed.data;
  const email = form.email.length > 0 ? form.email : null;
  const note = form.note.length > 0 ? form.note : null;

  const payload: OrderPayload = {
    customer: {
      name: form.name,
      phone: form.phone,
      email,
      country: form.country,
      city: form.city,
      address: form.address,
    },
    fulfillment: {
      method: form.method,
      address: resolveFulfillmentAddress(form),
      note,
    },
    items: input.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      displayed_price: item.price,
    })),
    locale: input.locale.slice(0, 5),
    idempotency_key: input.idempotencyKey,
  };

  return { ok: true, payload };
}

export function orderPayloadHash(payload: OrderPayload): string {
  return JSON.stringify({
    customer: payload.customer,
    fulfillment: payload.fulfillment,
    items: payload.items,
    locale: payload.locale ?? null,
  });
}

export function cartExceedsOrderLimit(itemCount: number): boolean {
  return itemCount > MAX_ORDER_ITEMS;
}

const LARAVEL_FIELD_TO_FORM: Record<string, keyof CheckoutForm> = {
  "customer.name": "name",
  "customer.phone": "phone",
  "customer.email": "email",
  "customer.country": "country",
  "customer.city": "city",
  "customer.address": "address",
  "fulfillment.method": "method",
  "fulfillment.address": "fulfillmentAddress",
  "fulfillment.note": "note",
};

export function laravelFieldsToFormFields(
  fields?: Record<string, string>,
): Record<string, string> {
  if (!fields) return {};
  const mapped: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    mapped[key] = message;
    const formKey = LARAVEL_FIELD_TO_FORM[key];
    if (formKey && !mapped[formKey]) {
      mapped[formKey] = message;
    }
  }
  return mapped;
}
