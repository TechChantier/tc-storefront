"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  onChange,
  disabled,
}: {
  value: number;
  min?: number;
  max?: number | null;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  return (
    <div className="flex items-center rounded-full border border-[var(--v-outline-variant)] bg-[var(--v-container-lowest)] p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || atMin}
        onClick={onDecrease}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--v-on-variant)] transition-colors hover:bg-[var(--v-container)] disabled:opacity-40"
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      {onChange ? (
        <input
          type="number"
          min={min}
          max={max ?? undefined}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-8 bg-transparent text-center text-base outline-none"
        />
      ) : (
        <span className="w-8 text-center text-base font-medium">{value}</span>
      )}
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || atMax}
        onClick={onIncrease}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--v-on-variant)] transition-colors hover:bg-[var(--v-container)] disabled:opacity-40"
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
        active
          ? "border-transparent bg-[var(--v-primary)]/10 text-[var(--v-primary)]"
          : "border-[var(--v-outline)]/10 bg-[var(--v-container)] text-[var(--v-on-variant)] hover:bg-[var(--v-container-high)]",
      )}
    >
      {children}
    </span>
  );
}
