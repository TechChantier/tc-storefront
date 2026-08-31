"use client";

import {
  selectCanPlaceOrder,
  selectCheckoutFieldError,
  useStorefrontStore,
} from "@/stores/storefront-store";

function FieldError({ field }: { field: string }) {
  const message = useStorefrontStore((state) =>
    selectCheckoutFieldError(state, field),
  );
  if (!message) return null;
  return <p className="mt-1 text-sm text-rose-400">{message}</p>;
}

export function ProCheckoutForm() {
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

  const inputClass =
    "w-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50";

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void placeOrder();
      }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Customer
      </h2>
      <div>
        <label className="block text-xs uppercase tracking-wider" htmlFor="pro-name">
          Name
        </label>
        <input
          id="pro-name"
          className={inputClass}
          value={form.name}
          onChange={(event) => setCheckoutField("name", event.target.value)}
          autoComplete="name"
          required
        />
        <FieldError field="name" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider" htmlFor="pro-phone">
          Phone
        </label>
        <input
          id="pro-phone"
          className={inputClass}
          value={form.phone}
          onChange={(event) => setCheckoutField("phone", event.target.value)}
          autoComplete="tel"
          required
        />
        <FieldError field="phone" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider" htmlFor="pro-email">
          Email (optional)
        </label>
        <input
          id="pro-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(event) => setCheckoutField("email", event.target.value)}
          autoComplete="email"
        />
        <FieldError field="email" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="block text-xs uppercase tracking-wider"
            htmlFor="pro-country"
          >
            Country
          </label>
          <input
            id="pro-country"
            className={inputClass}
            value={form.country}
            onChange={(event) =>
              setCheckoutField("country", event.target.value)
            }
            autoComplete="country-name"
            required
          />
          <FieldError field="country" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider" htmlFor="pro-city">
            City
          </label>
          <input
            id="pro-city"
            className={inputClass}
            value={form.city}
            onChange={(event) => setCheckoutField("city", event.target.value)}
            autoComplete="address-level2"
            required
          />
          <FieldError field="city" />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider" htmlFor="pro-address">
          Address
        </label>
        <textarea
          id="pro-address"
          className={inputClass}
          rows={3}
          value={form.address}
          onChange={(event) => setCheckoutField("address", event.target.value)}
          autoComplete="street-address"
          required
        />
        <FieldError field="address" />
      </div>

      <h2 className="pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Fulfillment
      </h2>
      <fieldset className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="pro-method"
            checked={form.method === "delivery"}
            onChange={() => setCheckoutField("method", "delivery")}
          />
          Delivery
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="pro-method"
            checked={form.method === "pickup"}
            onChange={() => setCheckoutField("method", "pickup")}
          />
          Pickup
        </label>
      </fieldset>
      <FieldError field="method" />

      {showDeliveryAddress ? (
        <>
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
            <div>
              <label
                className="block text-xs uppercase tracking-wider"
                htmlFor="pro-delivery"
              >
                Delivery address
              </label>
              <textarea
                id="pro-delivery"
                className={inputClass}
                rows={3}
                value={form.fulfillmentAddress}
                onChange={(event) =>
                  setCheckoutField("fulfillmentAddress", event.target.value)
                }
              />
              <FieldError field="fulfillmentAddress" />
            </div>
          ) : (
            <FieldError field="fulfillmentAddress" />
          )}
        </>
      ) : null}

      <div>
        <label className="block text-xs uppercase tracking-wider" htmlFor="pro-note">
          Note (optional)
        </label>
        <textarea
          id="pro-note"
          className={inputClass}
          rows={3}
          value={form.note}
          onChange={(event) => setCheckoutField("note", event.target.value)}
        />
        <FieldError field="note" />
      </div>

      {orderError ? (
        <div className="border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
          <p>{orderError.message}</p>
          {orderError.stockItems && orderError.stockItems.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {orderError.stockItems.map((item) => (
                <li key={item.product_id}>
                  Requested {item.requested_quantity},{" "}
                  {item.available_quantity} available
                </li>
              ))}
            </ul>
          ) : null}
          {orderError.priceChanges && orderError.priceChanges.length > 0 ? (
            <div className="mt-3">
              <p>Some prices changed. Confirm to continue with current prices.</p>
              <button
                type="button"
                className="mt-2 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-950"
                onClick={() => void confirmUpdatedPrices()}
                disabled={submitting}
              >
                Confirm new prices
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canPlace}
        className="bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {submitting ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
