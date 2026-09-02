"use client";

import { useStorefrontStore } from "@/stores/storefront-store";
import { Container } from "../components/container";
import { Missing, MissingImage } from "../components/missing";

export function VibrantAboutPage() {
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );

  return (
    <main className="w-full">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <h1 className="v-serif text-4xl font-semibold tracking-tight md:text-5xl">
            {businessName}
          </h1>
          <Missing as="p" className="text-lg text-[var(--v-on-variant)]">
            About headline
          </Missing>
        </div>
      </Container>

      <Container className="space-y-6 pb-24">
        <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:auto-rows-[400px] md:grid-cols-12">
          <div className="relative overflow-hidden rounded-xl bg-[var(--v-container-low)] shadow-[var(--v-shadow)] md:col-span-8">
            <MissingImage label="About story image" className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="v-serif text-[32px] font-semibold text-white">
                Our Story
              </h2>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-[var(--v-container-lowest)] p-6 shadow-[var(--v-shadow)] md:col-span-4">
            <h3 className="v-serif mb-3 text-2xl font-medium">The Vision</h3>
            <Missing as="p" className="text-base text-[var(--v-on-variant)]">
              About vision copy
            </Missing>
          </div>
          <div className="overflow-hidden rounded-xl bg-[var(--v-container-low)] shadow-[var(--v-shadow)] md:col-span-4">
            <MissingImage label="Materials image" className="h-full w-full" />
          </div>
          <div className="relative flex flex-col justify-center overflow-hidden rounded-xl bg-[var(--v-primary)]/10 p-6 shadow-[var(--v-shadow)] md:col-span-8">
            <h3 className="v-serif mb-3 text-2xl font-medium text-[var(--v-primary)]">
              Our Values
            </h3>
            <Missing as="p" className="text-base text-[var(--v-on-variant)]">
              Values copy
            </Missing>
          </div>
        </div>
      </Container>
    </main>
  );
}
