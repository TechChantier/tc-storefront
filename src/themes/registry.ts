import type { StorefrontTemplate } from "@/themes/contracts";
import classicTheme from "@/themes/classic";
import proTheme from "@/themes/pro";

/**
 * Explicit template registry. Keys must match TCPoS `template_key` values.
 * Do not dynamically import arbitrary filesystem paths from API values.
 */
export const themeRegistry = {
  classic: classicTheme,
  pro: proTheme,
} as const satisfies Record<string, StorefrontTemplate>;

export type TemplateKey = keyof typeof themeRegistry;

export function isRegisteredTemplateKey(key: string): key is TemplateKey {
  return key in themeRegistry;
}

export function getTheme(templateKey: string): StorefrontTemplate | null {
  if (!isRegisteredTemplateKey(templateKey)) {
    return null;
  }
  return themeRegistry[templateKey];
}
