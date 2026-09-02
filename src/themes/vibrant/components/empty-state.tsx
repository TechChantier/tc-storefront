import type { ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icon";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-[var(--v-outline)]/20 bg-[var(--v-container-lowest)] px-6 py-24 text-center">
      <Icon name="search" className="mb-4 h-12 w-12 text-[var(--v-outline)]/40" />
      <h3 className="v-serif text-2xl font-medium text-[var(--v-on-surface)]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-base text-[var(--v-on-variant)]">{body}</p>
      {action ? (
        <Button variant="outline" className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--v-outline)]/10 pb-4">
      <div>
        <h1 className="v-serif text-3xl font-semibold tracking-tight text-[var(--v-primary)] md:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-base text-[var(--v-on-variant)]">{description}</p>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
