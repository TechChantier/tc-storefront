"use client";

import type { ReactNode } from "react";
import {
  selectCanPlaceOrder,
  selectCheckoutFieldError,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { Button } from "./components/button";
import { FieldError, FieldLabel, TextArea, TextInput } from "./components/field";
import { Icon } from "./components/icon";
import { Missing } from "./components/missing";

function StoreFieldError({ field }: { field: string }) {
  const message = useStorefrontStore((state) =>
    selectCheckoutFieldError(state, field),
  );
  return <FieldError message={message} />;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: "person" | "truck" | "card";
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--v-outline-variant)]/30 bg-[var(--v-container-lowest)] p-6 shadow-[0_4px_20px_rgba(0,105,112,0.05)]">
      <h2 className="v-serif mb-3 flex items-center gap-2 text-2xl font-medium text-[var(--v-primary)]">
        <Icon name={icon} className="h-5 w-5" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function VibrantCheckoutForm() {
  const form = useStorefrontStore((state) => state.checkoutForm);
  const setCheckoutField = useStorefrontStore((state) => state.setCheckoutField);
  const placeOrder = useStorefrontStore((state) => state.placeOrder);
  const confirmUpdatedPrices = useStorefrontStore(
    (state) => state.confirmUpdatedPrices,
  );
  const orderStatus = useStorefrontStore((state) => state.orderStatus);
  const orderError = useStorefrontStore((state) => state.orderError);
  const canPlace = useStorefrontStore(selectCanPlaceOrder);
  const submitting = orderStatus === "submitting";
  const showDeliveryAddress = form.method === "delivery";

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void placeOrder();
      }}
    >
      <Section icon="person" title="Contact Information">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="vibrant-name">Name</FieldLabel>
            <TextInput
              id="vibrant-name"
              value={form.name}
              onChange={(event) => setCheckoutField("name", event.target.value)}
              autoComplete="name"
              required
            />
            <StoreFieldError field="name" />
          </div>
          <div>
            <FieldLabel htmlFor="vibrant-phone">Phone Number</FieldLabel>
            <TextInput
              id="vibrant-phone"
              value={form.phone}
              onChange={(event) => setCheckoutField("phone", event.target.value)}
              autoComplete="tel"
              required
            />
            <StoreFieldError field="phone" />
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="vibrant-email">Email Address (optional)</FieldLabel>
            <TextInput
              id="vibrant-email"
              type="email"
              value={form.email}
              onChange={(event) => setCheckoutField("email", event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <StoreFieldError field="email" />
          </div>
        </div>
      </Section>

      <Section icon="truck" title="Shipping Address">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="vibrant-country">Country</FieldLabel>
            <TextInput
              id="vibrant-country"
              value={form.country}
              onChange={(event) =>
                setCheckoutField("country", event.target.value)
              }
              autoComplete="country-name"
              required
            />
            <StoreFieldError field="country" />
          </div>
          <div>
            <FieldLabel htmlFor="vibrant-city">City</FieldLabel>
            <TextInput
              id="vibrant-city"
              value={form.city}
              onChange={(event) => setCheckoutField("city", event.target.value)}
              autoComplete="address-level2"
              required
            />
            <StoreFieldError field="city" />
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="vibrant-address">Street Address</FieldLabel>
            <TextArea
              id="vibrant-address"
              rows={3}
              value={form.address}
              onChange={(event) =>
                setCheckoutField("address", event.target.value)
              }
              autoComplete="street-address"
              required
            />
            <StoreFieldError field="address" />
          </div>
          <div>
            <FieldLabel>State</FieldLabel>
            <Missing className="block text-sm text-[var(--v-on-variant)]">
              State is not in checkout
            </Missing>
          </div>
          <div>
            <FieldLabel>Zip Code</FieldLabel>
            <Missing className="block text-sm text-[var(--v-on-variant)]">
              Zip code is not in checkout
            </Missing>
          </div>
        </div>

        <fieldset className="mt-6 flex gap-4 text-sm">
          <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)]">
            Fulfillment
          </legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="vibrant-method"
              checked={form.method === "delivery"}
              onChange={() => setCheckoutField("method", "delivery")}
            />
            Delivery
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="vibrant-method"
              checked={form.method === "pickup"}
              onChange={() => setCheckoutField("method", "pickup")}
            />
            Pickup
          </label>
        </fieldset>
        <StoreFieldError field="method" />

        {showDeliveryAddress ? (
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.sameAsCustomerAddress}
                onChange={(event) =>
                  setCheckoutField("sameAsCustomerAddress", event.target.checked)
                }
              />
              Same as customer address
            </label>
            {!form.sameAsCustomerAddress ? (
              <div className="mt-3">
                <FieldLabel htmlFor="vibrant-delivery">
                  Delivery address
                </FieldLabel>
                <TextArea
                  id="vibrant-delivery"
                  rows={3}
                  value={form.fulfillmentAddress}
                  onChange={(event) =>
                    setCheckoutField("fulfillmentAddress", event.target.value)
                  }
                />
              </div>
            ) : null}
            <StoreFieldError field="fulfillmentAddress" />
          </div>
        ) : null}

        <div className="mt-4">
          <FieldLabel htmlFor="vibrant-note">Note (optional)</FieldLabel>
          <TextArea
            id="vibrant-note"
            rows={3}
            value={form.note}
            onChange={(event) => setCheckoutField("note", event.target.value)}
          />
          <StoreFieldError field="note" />
        </div>
      </Section>

      <Section icon="card" title="Payment Method">
        <Missing className="block text-base text-[var(--v-on-variant)]">
          Card payment fields are not collected on this storefront
        </Missing>
      </Section>

      {orderError ? (
        <div className="rounded-lg border border-[var(--v-error)]/30 bg-[var(--v-error-container)] p-4 text-sm text-[var(--v-error)]">
          <p>{orderError.message}</p>
          {orderError.stockItems && orderError.stockItems.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {orderError.stockItems.map((item) => (
                <li key={item.product_id}>
                  Requested {item.requested_quantity}, {item.available_quantity}{" "}
                  available
                </li>
              ))}
            </ul>
          ) : null}
          {orderError.priceChanges && orderError.priceChanges.length > 0 ? (
            <div className="mt-3">
              <p>Some prices changed. Confirm to continue with current prices.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => void confirmUpdatedPrices()}
                disabled={submitting}
              >
                Confirm new prices
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full py-4"
        disabled={!canPlace}
      >
        <Icon name="lock" className="h-[18px] w-[18px]" />
        {submitting ? "Placing order…" : "Place Order"}
      </Button>
    </form>
  );
}
