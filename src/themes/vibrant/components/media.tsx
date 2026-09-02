import { catalogImageSrc, type CatalogImageKind } from "@/lib/catalog/image";
import { cn } from "../lib/cn";
import { MissingImage } from "./missing";

export function Media({
  src,
  alt,
  missingLabel,
  className,
  kind,
}: {
  src?: string | null;
  alt: string;
  missingLabel: string;
  className?: string;
  kind?: CatalogImageKind;
}) {
  const resolved = kind ? catalogImageSrc(src, kind) : src?.trim() || null;

  if (!resolved) {
    return <MissingImage label={missingLabel} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolved} alt={alt} className={cn("object-cover", className)} />
  );
}
