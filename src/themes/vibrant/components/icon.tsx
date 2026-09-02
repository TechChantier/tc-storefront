import { cn } from "../lib/cn";

const paths = {
  bag: "M6 7V6a6 6 0 1 1 12 0v1M5 7h14l-.7 12.1A2 2 0 0 1 16.3 21H7.7a2 2 0 0 1-2-1.9L5 7Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  lock: "M8 11V8a4 4 0 1 1 8 0v3M7 11h10v9H7v-9Z",
  person: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 9a8 8 0 0 0-16 0",
  truck: "M3 7h11v10H3V7Zm11 3h4l3 3v4h-7V10ZM7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  phone: "M7 3h3l1 4-2 1a12 12 0 0 0 6 6l1-2 4 1v3c0 1-1 2-2 2A16 16 0 0 1 5 5c0-1 1-2 2-2Z",
  pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
  leaf: "M5 19c8-1 13-8 14-14-6 1-13 6-14 14Zm0 0 6-6",
  heart:
    "M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z",
  card: "M3 7h18v10H3V7Zm0 3h18",
  info: "M12 17v-6M12 7h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block h-6 w-6 shrink-0", className)}
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
