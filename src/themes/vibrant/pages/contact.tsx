"use client";

import { useStorefrontStore } from "@/stores/storefront-store";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { FieldLabel, SelectInput, TextArea, TextInput } from "../components/field";
import { Icon } from "../components/icon";
import { Missing } from "../components/missing";

export function VibrantContactPage() {
  const business = useStorefrontStore((state) => state.config.business);
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );

  return (
    <main>
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <h1 className="v-serif text-4xl font-semibold tracking-tight md:text-5xl">
            Get in Touch
          </h1>
          <p className="text-lg text-[var(--v-on-variant)]">
            {businessName} — we are here to help.
          </p>
        </div>
      </Container>

      <Container className="relative mb-16 rounded-3xl bg-[var(--v-container-high)] py-16">
        <div className="grid grid-cols-1 gap-6 p-4 md:p-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <p className="text-base text-[var(--v-on-variant)]">
              Whether you have a question about our collections or need help with
              an order, reach us here.
            </p>
            <div className="space-y-3 border-t border-[var(--v-outline-variant)]/30 pt-6">
              <div className="flex items-start gap-3">
                <Icon name="pin" className="mt-1 text-[var(--v-primary)]" />
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest">
                    Studio
                  </h4>
                  {business.address ? (
                    <p className="whitespace-pre-line text-base text-[var(--v-on-variant)]">
                      {business.address}
                    </p>
                  ) : (
                    <Missing className="text-base text-[var(--v-on-variant)]">
                      Address
                    </Missing>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="mail" className="mt-1 text-[var(--v-primary)]" />
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest">
                    Email
                  </h4>
                  {business.email ? (
                    <a
                      className="text-base text-[var(--v-on-variant)] hover:text-[var(--v-primary)]"
                      href={`mailto:${business.email}`}
                    >
                      {business.email}
                    </a>
                  ) : (
                    <Missing className="text-base text-[var(--v-on-variant)]">
                      Email
                    </Missing>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="phone" className="mt-1 text-[var(--v-primary)]" />
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest">
                    Phone
                  </h4>
                  {business.phone ? (
                    <p className="text-base text-[var(--v-on-variant)]">
                      {business.phone}
                    </p>
                  ) : (
                    <Missing className="text-base text-[var(--v-on-variant)]">
                      Phone
                    </Missing>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              className="space-y-6 rounded-2xl border border-[var(--v-container)]/50 bg-[var(--v-container-lowest)]/80 p-4 backdrop-blur-xl md:p-6"
              onSubmit={(event) => event.preventDefault()}
            >
              <Missing as="p" className="text-sm text-[var(--v-on-variant)]">
                Contact form is not connected
              </Missing>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="vibrant-contact-name">Name</FieldLabel>
                  <TextInput
                    id="vibrant-contact-name"
                    className="rounded-none border-0 border-b bg-transparent px-0"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="vibrant-contact-email">Email</FieldLabel>
                  <TextInput
                    id="vibrant-contact-email"
                    type="email"
                    className="rounded-none border-0 border-b bg-transparent px-0"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="vibrant-contact-subject">Subject</FieldLabel>
                <SelectInput
                  id="vibrant-contact-subject"
                  className="rounded-none border-0 border-b bg-transparent px-0"
                  defaultValue=""
                >
                  <option disabled value="">
                    Select a topic...
                  </option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Order Support</option>
                </SelectInput>
              </div>
              <div>
                <FieldLabel htmlFor="vibrant-contact-message">Message</FieldLabel>
                <TextArea
                  id="vibrant-contact-message"
                  rows={4}
                  className="resize-none rounded-none border-0 border-b bg-transparent px-0"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" pill disabled>
                Send Message
                <Icon name="arrowRight" className="h-[18px] w-[18px]" />
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </main>
  );
}
