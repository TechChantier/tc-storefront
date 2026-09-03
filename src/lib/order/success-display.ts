import { resolveFulfillmentAddress } from "./payload";
import type { CheckoutForm } from "@/lib/types/order";

export function formatOrderStatusLabel(status: string): string {
  const trimmed = status.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function whatsappShareHref(
  phone: string | null | undefined,
  message: string,
): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function orderShareMessage(
  businessName: string,
  publicReference: string,
): string {
  return `I just placed an order with ${businessName}. Order ID: ${publicReference}`;
}

export function deliveryDetail(
  form: CheckoutForm,
  shopAddress: string | null | undefined,
): {
  heading: string;
  lines: string[];
  missing: string | null;
} {
  if (form.method === "pickup") {
    const address = shopAddress?.trim() ?? "";
    return {
      heading: "Pickup",
      lines: address ? [address] : [],
      missing: address ? null : "Pickup location",
    };
  }

  const street = resolveFulfillmentAddress(form);
  const locality = [form.city.trim(), form.country.trim()]
    .filter(Boolean)
    .join(", ");
  const lines = [street, locality].filter(
    (line): line is string => Boolean(line && line.length > 0),
  );

  return {
    heading: "Shipping Address",
    lines,
    missing: lines.length === 0 ? "Shipping address" : null,
  };
}
