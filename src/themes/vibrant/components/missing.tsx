import type { ElementType, ReactNode } from "react";
import { cn } from "../lib/cn";

type MissingProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/** Visible stand-in when the API has no field for this copy/media. */
export function Missing({ children, as: Tag = "span", className }: MissingProps) {
  return <Tag className={className}>*** {children} ***</Tag>;
}

export function MissingImage({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[var(--v-container-low)] p-4 text-center text-sm text-[var(--v-on-variant)]",
        className,
      )}
    >
      *** {label} ***
    </div>
  );
}
