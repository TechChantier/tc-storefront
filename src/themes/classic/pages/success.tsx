"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  deliveryDetail,
  formatOrderStatusLabel,
  orderShareMessage,
  whatsappShareHref,
} from "@/lib/order/success-display";
import { useStorefrontStore } from "@/stores/storefront-store";

export function ClassicSuccessPage() {
  const router = useRouter();
  const locale = useStorefrontStore((state) => state.locale);
  const orderStatus = useStorefrontStore((state) => state.orderStatus);
  const orderResult = useStorefrontStore((state) => state.orderResult);
  const form = useStorefrontStore((state) => state.checkoutForm);
  const business = useStorefrontStore((state) => state.config.business);
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );

  const ready = orderStatus === "success" && Boolean(orderResult);

  useEffect(() => {
    if (!ready) {
      router.replace(`/${locale}/products`);
    }
  }, [ready, locale, router]);

  if (!ready || !orderResult) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <p className="text-stone-600">Taking you to the shop…</p>
      </main>
    );
  }

  const delivery = deliveryDetail(form, business.address);
  const whatsappHref = whatsappShareHref(
    business.whatsapp_number,
    orderShareMessage(businessName, orderResult.public_reference),
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <section className="mx-auto mb-12 max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stone-900 text-2xl">
          ✓
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Thank you for your order!
        </h1>
        <p className="mt-3 text-stone-700">
          We&apos;ve received your order and are getting it ready for shipment.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          Order ID{" "}
          <span className="font-medium text-stone-900">
            {orderResult.public_reference}
          </span>
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-stone-200 bg-white p-6">
          <h2 className="text-lg">Customer</h2>
          <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">
            Name
          </p>
          <p className="mt-1">{form.name}</p>
          <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">
            Email
          </p>
          <p className="mt-1">
            {form.email.trim() ? form.email : "*** Email ***"}
          </p>
        </article>

        <article className="border border-stone-200 bg-white p-6">
          <h2 className="text-lg">Delivery</h2>
          <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">
            {delivery.heading}
          </p>
          {delivery.lines.length > 0 ? (
            <p className="mt-1 whitespace-pre-line leading-relaxed">
              {delivery.lines.join("\n")}
            </p>
          ) : null}
          {delivery.missing ? (
            <p className="mt-1">*** {delivery.missing} ***</p>
          ) : null}
        </article>

        <article className="border border-stone-200 bg-white p-6">
          <h2 className="text-lg">Timeline</h2>
          <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">
            Status
          </p>
          <p className="mt-1">{formatOrderStatusLabel(orderResult.status)}</p>
          <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">
            Estimated Arrival
          </p>
          <p className="mt-1">*** Estimated arrival ***</p>
        </article>
      </section>

      <section className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-stone-200 pt-8 sm:flex-row">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="w-full border border-stone-900 px-4 py-2 text-center text-sm hover:bg-stone-900 hover:text-white sm:w-auto"
          >
            Share via WhatsApp
          </a>
        ) : (
          <p className="text-sm text-stone-500">*** WhatsApp number ***</p>
        )}
        <Link
          href={`/${locale}/products`}
          className="w-full bg-stone-900 px-4 py-2 text-center text-sm text-white hover:bg-stone-800 sm:w-auto"
        >
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
