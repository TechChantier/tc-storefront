"use client";

import { useStorefrontStore } from "@/stores/storefront-store";

export function ProHomePage() {
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );
  const locale = useStorefrontStore((state) => state.locale);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        Pro — Home — {businessName} ({locale})
      </h1>
    </main>
  );
}
