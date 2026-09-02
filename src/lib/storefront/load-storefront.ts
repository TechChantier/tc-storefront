import "server-only";

import { cache } from "react";
import { isLocaleSupportedByTenant } from "@/lib/localization/locale";
import { decodeHostnameParam } from "@/lib/tenant/hostname";
import { getTheme, isRegisteredTemplateKey } from "@/themes/registry";
import type { StorefrontTemplate } from "@/themes/contracts";
import { resolveStorefront } from "./resolve-storefront";
import type { StorefrontConfig } from "./types";

export type StorefrontLoadErrorKind =
  | "not_found"
  | "disabled"
  | "unsupported_template"
  | "misconfigured"
  | "rate_limited";

export type StorefrontLoadResult =
  | { kind: "ready"; config: StorefrontConfig; hostname: string }
  | { kind: StorefrontLoadErrorKind };

export type ReadyStorefront = {
  kind: "ready";
  config: StorefrontConfig;
  hostname: string;
  locale: string;
  theme: StorefrontTemplate;
};

export type LoadReadyStorefrontResult =
  | ReadyStorefront
  | { kind: "error"; result: Exclude<StorefrontLoadResult, { kind: "ready" }> }
  | { kind: "invalid_locale" };

export const loadStorefront = cache(async function loadStorefront(
  hostnameParam: string,
): Promise<StorefrontLoadResult> {
  const decoded = decodeHostnameParam(hostnameParam);
  if (!decoded) {
    return { kind: "not_found" };
  }

  const resolved = await resolveStorefront(decoded);

  switch (resolved.status) {
    case "not_found":
      return { kind: "not_found" };
    case "disabled":
      return { kind: "disabled" };
    case "rate_limited":
      return { kind: "rate_limited" };
    case "misconfigured":
    case "invalid":
      return { kind: "misconfigured" };
    case "resolved": {
      if (!isRegisteredTemplateKey(resolved.config.template_key)) {
        return { kind: "unsupported_template" };
      }
      return {
        kind: "ready",
        config: resolved.config,
        hostname: decoded,
      };
    }
  }
});

export const loadReadyStorefront = cache(async function loadReadyStorefront(
  hostnameParam: string,
  localeParam: string,
): Promise<LoadReadyStorefrontResult> {
  const result = await loadStorefront(hostnameParam);

  if (result.kind !== "ready") {
    return { kind: "error", result };
  }

  if (
    !isLocaleSupportedByTenant(localeParam, result.config.supported_locales)
  ) {
    return { kind: "invalid_locale" };
  }

  const theme = getTheme(result.config.template_key);
  if (!theme) {
    return { kind: "error", result: { kind: "unsupported_template" } };
  }

  return {
    kind: "ready",
    config: result.config,
    hostname: result.hostname,
    locale: localeParam,
    theme,
  };
});
