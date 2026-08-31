import "server-only";

import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";

export type StorefrontFetchResult<T> =
  | { status: "ok"; data: T; meta?: unknown }
  | { status: "not_found" }
  | { status: "unavailable" }
  | { status: "invalid" }
  | { status: "invalid_locale" }
  | { status: "redirect"; redirectSlug: string; permanent: boolean };

type StorefrontFetchOptions = {
  tcposSubdomain: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  tags?: string[];
  revalidate?: number;
};

function getServiceToken(): string | undefined {
  return env.storefrontServiceToken;
}

function revalidateSeconds(): number {
  return Number.isFinite(env.resolveRevalidateSeconds) &&
    env.resolveRevalidateSeconds > 0
    ? env.resolveRevalidateSeconds
    : 60;
}

/**
 * Build tenant-scoped storefront API URL.
 * subdomain mode: http://tcpos.local + abc → http://abc.tcpos.local/api/storefront/...
 * single mode: TCPOS_API_BASE_URL as-is (local IS_APP_DEPLOYED=false).
 */
export function storefrontApiUrl(tcposSubdomain: string, path: string): string | null {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const suffix = `/api/storefront${normalizedPath}`;

  if (env.tcposTenantHostMode === "single") {
    const base = env.tcposApiBaseUrl;
    if (!base) return null;
    return `${base.replace(/\/$/, "")}${suffix}`;
  }

  const rootUrl = env.tcposTenantRootUrl;
  if (!rootUrl) return null;

  let root: URL;
  try {
    root = new URL(rootUrl);
  } catch {
    return null;
  }

  const apiHost = `${tcposSubdomain}.${root.hostname}`;
  const port = root.port ? `:${root.port}` : "";
  return `${root.protocol}//${apiHost}${port}${suffix}`;
}

function appendSearchParams(
  url: URL,
  searchParams?: StorefrontFetchOptions["searchParams"],
) {
  if (!searchParams) return;
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
}

function readRedirect(
  payload: unknown,
): { slug: string; permanent: boolean } | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (record.success !== false || record.code !== "SLUG_REDIRECT") return null;

  const redirect = record.redirect;
  if (!redirect || typeof redirect !== "object") return null;
  const slug = (redirect as Record<string, unknown>).slug;
  if (typeof slug !== "string" || slug.length === 0) return null;

  return {
    slug,
    permanent: (redirect as Record<string, unknown>).permanent === true,
  };
}

function readErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const code = (payload as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

export function hasStorefrontServiceToken(): boolean {
  return Boolean(getServiceToken());
}

export async function storefrontFetch<T>(
  options: StorefrontFetchOptions,
): Promise<StorefrontFetchResult<T>> {
  const token = getServiceToken();
  if (!token) {
    logEvent("error", "tcpos_api.missing_server_config", {
      has_token: false,
    });
    return { status: "unavailable" };
  }

  const href = storefrontApiUrl(options.tcposSubdomain, options.path);
  if (!href) {
    logEvent("error", "tcpos_api.missing_tenant_url", {
      tcpos_subdomain: options.tcposSubdomain,
      host_mode: env.tcposTenantHostMode,
    });
    return { status: "unavailable" };
  }

  const url = new URL(href);
  appendSearchParams(url, options.searchParams);

  const method = options.method ?? "GET";

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
      },
      body:
        method !== "GET" && options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
      next:
        method === "GET"
          ? {
              revalidate: options.revalidate ?? revalidateSeconds(),
              tags: options.tags,
            }
          : undefined,
    });

    let raw: unknown = null;
    try {
      raw = await response.json();
    } catch {
      raw = null;
    }

    const redirect = readRedirect(raw);
    if (redirect) {
      return {
        status: "redirect",
        redirectSlug: redirect.slug,
        permanent: redirect.permanent,
      };
    }

    const apiCode = readErrorCode(raw);

    if (apiCode === "INVALID_LOCALE" || (response.status === 422 && apiCode === "INVALID_LOCALE")) {
      return { status: "invalid_locale" };
    }

    if (response.status === 404) {
      return { status: "not_found" };
    }

    if (!response.ok) {
      logEvent("error", "tcpos_api.unavailable", {
        tcpos_subdomain: options.tcposSubdomain,
        path: options.path,
        status: response.status,
      });
      return { status: "unavailable" };
    }

    if (
      !raw ||
      typeof raw !== "object" ||
      (raw as { success?: unknown }).success !== true ||
      !("data" in raw)
    ) {
      logEvent("error", "tcpos_api.invalid_response", {
        tcpos_subdomain: options.tcposSubdomain,
        path: options.path,
      });
      return { status: "invalid" };
    }

    return {
      status: "ok",
      data: (raw as { data: T }).data,
      meta: (raw as { meta?: unknown }).meta,
    };
  } catch {
    logEvent("error", "tcpos_api.request_failed", {
      tcpos_subdomain: options.tcposSubdomain,
      path: options.path,
    });
    return { status: "unavailable" };
  }
}
