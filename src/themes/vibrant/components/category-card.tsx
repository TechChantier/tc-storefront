"use client";

import Link from "next/link";
import type { Category } from "@/lib/types/catalog";
import { Media } from "./media";

export function CategoryCard({
  category,
  href,
}: {
  category: Category;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/5] w-[280px] min-w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-[var(--v-container-low)] shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <Media
        src={category.image?.url}
        alt={category.image?.alt ?? category.name}
        missingLabel="Category image"
        kind="category"
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3">
        <span className="v-serif text-2xl font-medium text-white">
          {category.name}
        </span>
      </div>
    </Link>
  );
}
