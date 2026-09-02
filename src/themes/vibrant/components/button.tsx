import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

const variants = {
  primary:
    "bg-[var(--v-primary)] text-[var(--v-on-primary)] hover:bg-[var(--v-primary-container)] shadow-[var(--v-shadow)]",
  outline:
    "border border-[var(--v-primary)] text-[var(--v-primary)] bg-transparent hover:shadow-[var(--v-shadow)]",
  ghost:
    "text-[var(--v-on-variant)] hover:text-[var(--v-primary)] bg-transparent",
} as const;

export function Button({
  variant = "primary",
  className,
  children,
  pill = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  pill?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type={props.type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
        pill ? "rounded-full" : "rounded",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
