"use client";

import { Container } from "../components/container";
import { vibrantCopy, vibrantImages } from "../content";

export function VibrantAboutPage() {
  return (
    <main className="w-full">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <h1 className="v-serif text-4xl font-semibold tracking-tight md:text-5xl">
            {vibrantCopy.aboutHeadline}
          </h1>
          <p className="text-lg text-[var(--v-on-variant)]">
            {vibrantCopy.aboutSubhead}
          </p>
        </div>
      </Container>

      <Container className="space-y-6 pb-24">
        <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:auto-rows-[400px] md:grid-cols-12">
          <div className="relative overflow-hidden rounded-xl bg-[var(--v-container-low)] shadow-[var(--v-shadow)] md:col-span-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vibrantImages.aboutStory}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="v-serif text-[32px] font-semibold text-white">
                Our Story
              </h2>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-[var(--v-container-lowest)] p-6 shadow-[var(--v-shadow)] md:col-span-4">
            <h3 className="v-serif mb-3 text-2xl font-medium">The Vision</h3>
            <p className="text-base text-[var(--v-on-variant)]">
              {vibrantCopy.vision}
            </p>
          </div>
          <div className="overflow-hidden rounded-xl bg-[var(--v-container-low)] shadow-[var(--v-shadow)] md:col-span-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vibrantImages.aboutMaterials}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative flex flex-col justify-center overflow-hidden rounded-xl bg-[var(--v-primary)]/10 p-6 shadow-[var(--v-shadow)] md:col-span-8">
            <h3 className="v-serif mb-3 text-2xl font-medium text-[var(--v-primary)]">
              Our Values
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {vibrantCopy.values.map((value) => (
                <div key={value.title}>
                  <h4 className="mb-1 text-xs font-bold uppercase tracking-widest">
                    {value.title}
                  </h4>
                  <p className="text-sm text-[var(--v-on-variant)]">
                    {value.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
