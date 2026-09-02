import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { normalizeHostname } from "@/lib/tenant/hostname";
import { errorCodeFromHttpStatus } from "./errors";
import {
  parseStorefrontErrorEnvelope,
  parseStorefrontResolveSuccess,
} from "./schema";
import type { StorefrontConfig } from "./types";

export type ResolveStorefrontResult =
  | { status: "resolved"; config: StorefrontConfig }
  | { status: "not_found" }
  | { status: "disabled" }
  | { status: "misconfigured" }
  | { status: "rate_limited" }
  | { status: "invalid" };

function resolveCacheTag(hostname: string): string {
  return `storefront-resolve:${hostname}`;
}

function mapErrorStatus(
  code: ReturnType<typeof errorCodeFromHttpStatus>,
): Exclude<ResolveStorefrontResult["status"], "resolved"> {
  switch (code) {
    case "STOREFRONT_NOT_FOUND":
    case "VALIDATION_ERROR":
      return "not_found";
    case "STOREFRONT_DISABLED":
      return "disabled";
    case "RATE_LIMIT_EXCEEDED":
      return "rate_limited";
    case "UNAUTHORIZED":
      return "misconfigured";
    default:
      return "misconfigured";
  }
}

async function fetchStorefrontConfig(
  hostname: string,
  token: string,
  apiBaseUrl: string,
): Promise<ResolveStorefrontResult> {
  const url = `${apiBaseUrl.replace(/\/$/, "")}/api/storefront/resolve`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hostname }),
      cache: "no-store",
    });
  } catch {
    // Handled: console.error would open the Next.js 16 error overlay.
    logEvent("warn", "resolver.request_failed", { hostname });
    return { status: "misconfigured" };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok) {
    const parsed = parseStorefrontResolveSuccess(payload);
    if (!parsed.success) {
      logEvent("error", "resolver.invalid_response", { hostname });
      return { status: "invalid" };
    }
    return { status: "resolved", config: parsed.data.data };
  }

  const envelope = parseStorefrontErrorEnvelope(payload);
  const apiCode = envelope.success ? envelope.data.code : undefined;
  const mapped = errorCodeFromHttpStatus(response.status, apiCode);

  if (mapped === "UNAUTHORIZED") {
    logEvent("error", "resolver.unauthorized", { hostname });
  } else if (mapped === "RATE_LIMIT_EXCEEDED") {
    logEvent("warn", "resolver.rate_limited", { hostname });
  } else if (!mapped) {
    logEvent("error", "resolver.unavailable", {
      hostname,
      status: response.status,
    });
  }

  return { status: mapErrorStatus(mapped) };
}

/**
 * Resolve a storefront hostname through the central TCPoS API.
 * The rest of the app must not call /resolve directly.
 */
export const resolveStorefront = cache(async function resolveStorefront(
  hostnameInput: string,
): Promise<ResolveStorefrontResult> {
  const normalized = normalizeHostname(hostnameInput);
  if (!normalized.ok) {
    return { status: "not_found" };
  }

  const hostname = normalized.hostname;
  const token = env.storefrontServiceToken;
  const apiBaseUrl = env.tcposApiBaseUrl;

  if (!token || !apiBaseUrl) {
    logEvent("error", "resolver.missing_server_config", {
      has_token: Boolean(token),
      has_base_url: Boolean(apiBaseUrl),
    });
    return { status: "misconfigured" };
  }

  const revalidateSeconds =
    Number.isFinite(env.resolveRevalidateSeconds) &&
    env.resolveRevalidateSeconds > 0
      ? env.resolveRevalidateSeconds
      : 60;

  return unstable_cache(
    () => fetchStorefrontConfig(hostname, token, apiBaseUrl),
    ["storefront-resolve", hostname],
    {
      revalidate: revalidateSeconds,
      tags: [resolveCacheTag(hostname)],
    },
  )();
});
