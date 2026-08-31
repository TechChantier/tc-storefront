"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useStorefrontStore } from "@/stores/storefront-store";

export function ClassicLayout({ children }: { children: ReactNode }) {
  const locale = useStorefrontStore((state) => state.locale);
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );
  // Branding colors (primary_color, secondary_color) will be applied in a later phase.

  return (
    <div className="flex min-h-full flex-col bg-stone-50 font-serif text-stone-900">
      <header className="border-b border-stone-300 px-6 py-4">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <span className="text-lg tracking-tight">{businessName}</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/${locale}`} className="hover:underline">
              Home
            </Link>
            <Link href={`/${locale}/products`} className="hover:underline">
              Products
            </Link>
            <Link href={`/${locale}/categories`} className="hover:underline">
              Categories
            </Link>
            <Link href={`/${locale}/about`} className="hover:underline">
              About
            </Link>
            <Link href={`/${locale}/contact`} className="hover:underline">
              Contact
            </Link>
            <Link href={`/${locale}/signup`} className="hover:underline">
              Signup
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
