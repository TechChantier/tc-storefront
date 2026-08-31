export const STOREFRONT_ERROR_CODES = [
  "UNAUTHORIZED",
  "STOREFRONT_DISABLED",
  "STOREFRONT_NOT_FOUND",
  "VALIDATION_ERROR",
  "RATE_LIMIT_EXCEEDED",
] as const;

export type StorefrontErrorCode = (typeof STOREFRONT_ERROR_CODES)[number];

export type StorefrontResolveStatus =
  | "resolved"
  | "not_found"
  | "disabled"
  | "misconfigured"
  | "rate_limited"
  | "invalid";

export class StorefrontResolveError extends Error {
  readonly code: StorefrontErrorCode | "INVALID_RESPONSE";
  readonly httpStatus: number;

  constructor(
    code: StorefrontErrorCode | "INVALID_RESPONSE",
    httpStatus: number,
    message = "Storefront resolve failed",
  ) {
    super(message);
    this.name = "StorefrontResolveError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function errorCodeFromHttpStatus(
  status: number,
  apiCode?: string,
): StorefrontErrorCode | null {
  if (apiCode === "UNAUTHORIZED" || status === 401) return "UNAUTHORIZED";
  if (apiCode === "STOREFRONT_DISABLED" || status === 403) {
    return "STOREFRONT_DISABLED";
  }
  if (apiCode === "STOREFRONT_NOT_FOUND" || status === 404) {
    return "STOREFRONT_NOT_FOUND";
  }
  if (apiCode === "VALIDATION_ERROR" || status === 422) {
    return "VALIDATION_ERROR";
  }
  if (apiCode === "RATE_LIMIT_EXCEEDED" || status === 429) {
    return "RATE_LIMIT_EXCEEDED";
  }
  return null;
}
