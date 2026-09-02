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

export function ProSuccessPage() {
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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
        <p className="text-slate-400">Taking you to the shop…</p>
      </main>
    );
  }

  const delivery = deliveryDetail(form, business.address);
  const whatsappHref = whatsappShareHref(
    business.whatsapp_number,
    orderShareMessage(businessName, orderResult.public_reference),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <section className="mx-auto mb-12 max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-slate-600 text-xl text-white">
          ✓
        </div>
        <h1 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Thank you for your order
        </h1>
        <p className="mt-6 text-slate-200">
          We&apos;ve received your order and are getting it ready for shipment.
        </p>
        <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
          Order ID{" "}
          <span className="text-slate-200">{orderResult.public_reference}</span>
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Customer
          </h2>
          <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-500">
            Name
          </p>
          <p className="mt-1 text-slate-100">{form.name}</p>
          <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-500">
            Email
          </p>
          <p className="mt-1 text-slate-100">
            {form.email.trim() ? form.email : "*** Email ***"}
          </p>
        </article>

        <article className="border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Delivery
          </h2>
          <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-500">
            {delivery.heading}
          </p>
          {delivery.lines.length > 0 ? (
            <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-100">
              {delivery.lines.join("\n")}
            </p>
          ) : null}
          {delivery.missing ? (
            <p className="mt-1 text-slate-400">*** {delivery.missing} ***</p>
          ) : null}
        </article>

        <article className="border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Timeline
          </h2>
          <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-500">
            Status
          </p>
          <p className="mt-1 text-slate-100">
            {formatOrderStatusLabel(orderResult.status)}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-500">
            Estimated Arrival
          </p>
          <p className="mt-1 text-slate-400">*** Estimated arrival ***</p>
        </article>
      </section>

      <section className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-slate-800 pt-8 sm:flex-row">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="w-full border border-slate-600 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-200 hover:border-white sm:w-auto"
          >
            Share via WhatsApp
          </a>
        ) : (
          <p className="text-xs uppercase tracking-wider text-slate-500">
            *** WhatsApp number ***
          </p>
        )}
        <Link
          href={`/${locale}/products`}
          className="w-full bg-white px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-950 sm:w-auto"
        >
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
