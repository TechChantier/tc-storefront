"use client";

import { useStorefrontStore } from "@/stores/storefront-store";
import { Button } from "../components/button";
import { Container } from "../components/container";
import { FieldLabel, TextInput } from "../components/field";
import { Missing } from "../components/missing";
import { PageHeader } from "../components/empty-state";

export function VibrantSignupPage() {
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );

  return (
    <main>
      <Container className="py-12 md:py-16">
        <PageHeader
          title="Account"
          description={`Create an account with ${businessName}.`}
        />
        <form
          className="mx-auto max-w-md space-y-4 rounded-xl bg-[var(--v-container-lowest)] p-6 shadow-[var(--v-shadow)]"
          onSubmit={(event) => event.preventDefault()}
        >
          <Missing as="p" className="text-sm text-[var(--v-on-variant)]">
            Signup is not connected
          </Missing>
          <div>
            <FieldLabel htmlFor="vibrant-signup-email">Email</FieldLabel>
            <TextInput id="vibrant-signup-email" type="email" />
          </div>
          <div>
            <FieldLabel htmlFor="vibrant-signup-password">Password</FieldLabel>
            <TextInput id="vibrant-signup-password" type="password" />
          </div>
          <Button type="submit" className="w-full" disabled>
            Create account
          </Button>
        </form>
      </Container>
    </main>
  );
}
