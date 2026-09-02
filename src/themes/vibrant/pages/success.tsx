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
import { Button } from "../components/button";
import { Container } from "../components/container";
import { Icon } from "../components/icon";
import { Missing } from "../components/missing";
import { vibrantCopy } from "../content";

export function VibrantSuccessPage() {
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
      <main>
        <Container className="py-12">
          <p className="text-[var(--v-on-variant)]">Taking you to the shop…</p>
        </Container>
      </main>
    );
  }

  const delivery = deliveryDetail(form, business.address);
  const whatsappHref = whatsappShareHref(
    business.whatsapp_number,
    orderShareMessage(businessName, orderResult.public_reference),
  );

  return (
    <main>
      <Container className="py-12 md:py-24">
        <section className="mx-auto mb-16 flex max-w-3xl flex-col items-center text-center md:mb-24">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--v-primary-container)]/20 text-[var(--v-primary)]">
            <Icon name="check" className="h-10 w-10 stroke-[2.5]" />
          </div>
          <h1 className="v-serif mb-3 text-[28px] font-semibold tracking-tight md:text-5xl">
            Thank you for your order!
          </h1>
          <p className="mb-2 text-lg text-[var(--v-on-variant)]">
            We&apos;ve received your order and are getting it ready for shipment.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--v-container-low)] px-4 py-2 text-[var(--v-primary)]">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)]">
              Order ID
            </span>
            <span className="v-serif text-2xl font-medium">
              {orderResult.public_reference}
            </span>
          </div>
        </section>

        <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-12">
          <article className="flex h-full flex-col rounded-xl border border-[var(--v-outline-variant)]/30 bg-[var(--v-container-lowest)] p-8 shadow-[var(--v-shadow)] md:col-span-4">
            <div className="mb-6 flex items-center gap-3 border-b border-[var(--v-container)] pb-4">
              <Icon name="person" className="h-6 w-6 text-[var(--v-primary)]" />
              <h2 className="v-serif text-xl font-medium">Customer</h2>
            </div>
            <div className="flex flex-grow flex-col gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-outline)]">
                  Name
                </p>
                <p className="text-base">{form.name}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-outline)]">
                  Email
                </p>
                {form.email.trim() ? (
                  <p className="text-base">{form.email}</p>
                ) : (
                  <Missing className="text-base">Email</Missing>
                )}
              </div>
            </div>
          </article>

          <article className="flex h-full flex-col rounded-xl border border-[var(--v-outline-variant)]/30 bg-[var(--v-container-lowest)] p-8 shadow-[var(--v-shadow)] md:col-span-4">
            <div className="mb-6 flex items-center gap-3 border-b border-[var(--v-container)] pb-4">
              <Icon name="truck" className="h-6 w-6 text-[var(--v-primary)]" />
              <h2 className="v-serif text-xl font-medium">Delivery</h2>
            </div>
            <div className="flex flex-grow flex-col gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-outline)]">
                  {delivery.heading}
                </p>
                {delivery.lines.length > 0 ? (
                  <p className="whitespace-pre-line text-base leading-relaxed">
                    {delivery.lines.join("\n")}
                  </p>
                ) : null}
                {delivery.missing ? (
                  <Missing className="text-base">{delivery.missing}</Missing>
                ) : null}
              </div>
            </div>
          </article>

          <article className="flex h-full flex-col rounded-xl border border-[var(--v-outline-variant)]/30 bg-[var(--v-container-lowest)] p-8 shadow-[var(--v-shadow)] md:col-span-4">
            <div className="mb-6 flex items-center gap-3 border-b border-[var(--v-container)] pb-4">
              <Icon name="calendar" className="h-6 w-6 text-[var(--v-primary)]" />
              <h2 className="v-serif text-xl font-medium">Timeline</h2>
            </div>
            <div className="flex flex-grow flex-col gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-outline)]">
                  Status
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--v-primary-container)]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[var(--v-primary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--v-primary)]" />
                  {formatOrderStatusLabel(orderResult.status)}
                </div>
              </div>
              <div className="mt-2">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-outline)]">
                  Estimated Arrival
                </p>
                <p className="text-lg font-medium">
                  {vibrantCopy.estimatedArrival}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="flex flex-col items-center justify-center gap-6 border-t border-[var(--v-container)] pt-12 sm:flex-row">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--v-outline)]/20 bg-[var(--v-container-lowest)] px-8 py-4 text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:border-[var(--v-outline)] hover:bg-[var(--v-container-low)] hover:shadow-[var(--v-shadow)] sm:w-auto"
            >
              <Icon name="chat" className="h-5 w-5 text-[var(--v-primary)]" />
              Share via WhatsApp
            </a>
          ) : (
            <Missing className="text-sm">WhatsApp number</Missing>
          )}
          <Link href={`/${locale}/products`} className="w-full sm:w-auto">
            <Button pill className="w-full px-8 py-4">
              Continue Shopping
            </Button>
          </Link>
        </section>
      </Container>
    </main>
  );
}
