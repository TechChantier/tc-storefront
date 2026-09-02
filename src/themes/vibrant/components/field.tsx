import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--v-on-variant)]"
    >
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded border border-[var(--v-outline-variant)]/60 bg-[var(--v-surface)] px-4 py-3 text-base text-[var(--v-on-surface)] outline-none transition-colors placeholder:text-[var(--v-outline)] focus:border-[var(--v-primary)] focus:ring-1 focus:ring-[var(--v-primary)]";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, className)} {...props} />;
}

export function SelectInput({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-[var(--v-error)]">{message}</p>;
}
