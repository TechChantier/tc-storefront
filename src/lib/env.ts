import "server-only";

/**
 * Server-only environment configuration.
 * Secrets must never use a NEXT_PUBLIC_ prefix.
 */

function readOptional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function readWithDefault(name: string, fallback: string): string {
  return readOptional(name) ?? fallback;
}

export const env = {
  tcposApiBaseUrl: readOptional("TCPOS_API_BASE_URL"),
  storefrontServiceToken: readOptional("STOREFRONT_SERVICE_TOKEN"),
  resolveRevalidateSeconds: Number(
    readWithDefault("STOREFRONT_RESOLVE_REVALIDATE_SECONDS", "60"),
  ),
  nodeEnv: readWithDefault("NODE_ENV", "development"),
} as const;
