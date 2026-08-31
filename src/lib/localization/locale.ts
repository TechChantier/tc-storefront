export function isLocaleSupportedByTenant(
  locale: string,
  supportedLocales: readonly string[],
): boolean {
  return supportedLocales.includes(locale);
}
