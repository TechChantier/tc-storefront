"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useStorefrontStore } from "@/stores/storefront-store";

export function ProLayout({ children }: { children: ReactNode }) {
  const locale = useStorefrontStore((state) => state.locale);
  const businessName = useStorefrontStore(
    (state) => state.config.branding.business_name,
  );
  // Branding colors (primary_color, secondary_color) will be applied in a later phase.

  return (
    <div className="flex min-h-full flex-col bg-slate-950 font-sans text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">
            {businessName}
          </span>
          <nav className="flex items-center gap-5 text-xs font-medium uppercase tracking-wider text-slate-300">
            <Link href={`/${locale}`} className="hover:text-white">
              Home
            </Link>
            <Link href={`/${locale}/about`} className="hover:text-white">
              About
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-white">
              Contact
            </Link>
            <Link href={`/${locale}/signup`} className="hover:text-white">
              Signup
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
