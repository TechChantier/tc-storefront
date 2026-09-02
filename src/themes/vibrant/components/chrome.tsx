"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  selectCartCount,
  useStorefrontStore,
} from "@/stores/storefront-store";
import { Button } from "./button";
import { Container } from "./container";
import { Icon } from "./icon";
import { Media } from "./media";
import { vibrantCopy } from "../content";

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "border-b-2 border-[var(--v-primary)] pb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-primary)]"
          : "text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)] transition-colors duration-200 hover:text-[var(--v-primary)]"
      }
    >
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const locale = useStorefrontStore((state) => state.locale);
  const branding = useStorefrontStore((state) => state.config.branding);
  const cartCount = useStorefrontStore(selectCartCount);
  const [open, setOpen] = useState(false);
  // Branding colors (primary_color, secondary_color) will be applied in a later phase.

  const home = `/${locale}`;
  const links = [
    { href: home, label: "Home", match: "exact" as const },
    { href: `${home}/products`, label: "Products", match: "prefix" as const },
    { href: `${home}/categories`, label: "Categories", match: "prefix" as const },
    { href: `${home}/about`, label: "About", match: "prefix" as const },
    { href: `${home}/contact`, label: "Contact", match: "prefix" as const },
  ];

  const isActive = (href: string, match: "exact" | "prefix") => {
    if (match === "exact") return pathname === href || pathname === `${href}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--v-surface)]/80 shadow-sm backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link
          href={home}
          className="v-serif flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--v-primary)]"
        >
          {branding.logo_url ? (
            <Media
              src={branding.logo_url}
              alt={branding.business_name}
              missingLabel="Logo"
              className="h-8 w-auto"
            />
          ) : (
            branding.business_name
          )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={isActive(link.href, link.match)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={`${home}/signup`}
            className="hidden text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)] transition-colors hover:text-[var(--v-primary)] md:block"
          >
            Account
          </Link>
          <Link href={`${home}/products`} className="hidden md:block">
            <Button pill>Shop Now</Button>
          </Link>
          <Link
            href={`${home}/cart`}
            aria-label="Shopping bag"
            className="relative p-2 text-[var(--v-primary)] transition-colors hover:text-[var(--v-primary-container)]"
          >
            <Icon name="bag" />
            {cartCount > 0 ? (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--v-primary)] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 text-[var(--v-primary)] md:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-[var(--v-outline-variant)]/40 bg-[var(--v-surface)] md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={isActive(link.href, link.match)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              href={`${home}/signup`}
              className="text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)]"
            >
              Account
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export function Footer() {
  const locale = useStorefrontStore((state) => state.locale);
  const branding = useStorefrontStore((state) => state.config.branding);
  const categories = useStorefrontStore((state) => state.categories);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-[var(--v-outline-variant)] bg-[var(--v-container-low)] py-6">
      <Container className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="v-serif text-2xl font-black text-[var(--v-on-surface)]">
            {branding.business_name}
          </span>
          <p className="mt-3 max-w-sm text-base text-[var(--v-on-variant)]">
            {vibrantCopy.footerTagline}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-on-surface)]">
            Shop
          </h4>
          {categories.length > 0 ? (
            categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/products?category=${encodeURIComponent(category.slug)}`}
                className="text-base text-[var(--v-on-variant)] underline transition-colors hover:text-[var(--v-primary)]"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <Link
              href={`/${locale}/products`}
              className="text-base text-[var(--v-on-variant)] underline hover:text-[var(--v-primary)]"
            >
              Products
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--v-on-surface)]">
            Support
          </h4>
          <Link
            href={`/${locale}/contact`}
            className="text-base text-[var(--v-on-variant)] underline hover:text-[var(--v-primary)]"
          >
            Contact Support
          </Link>
          <a
            href="#privacy"
            className="text-base text-[var(--v-on-variant)] underline hover:text-[var(--v-primary)]"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-base text-[var(--v-on-variant)] underline hover:text-[var(--v-primary)]"
          >
            Terms of Service
          </a>
        </div>
        <div className="border-t border-[var(--v-outline-variant)]/30 pt-4 md:col-span-4">
          <p className="text-sm text-[var(--v-on-variant)]">
            © {year} {branding.business_name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
