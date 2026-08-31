const INTERNAL_PREFIX = "/sites";

/**
 * Build the internal storefront rewrite path for a hostname + public pathname.
 * Visible browser URL stays on the original host/path.
 */
export function buildStorefrontRewritePath(
  hostname: string,
  pathname: string,
  search = "",
): string {
  const normalizedPath =
    pathname.startsWith("/") || pathname.length === 0
      ? pathname
      : `/${pathname}`;
  const basePath = normalizedPath === "/" ? "" : normalizedPath;
  const encodedHostname = encodeURIComponent(hostname);
  return `${INTERNAL_PREFIX}/${encodedHostname}${basePath}${search}`;
}

export function shouldSkipStorefrontRewrite(pathname: string): boolean {
  return pathname === INTERNAL_PREFIX || pathname.startsWith(`${INTERNAL_PREFIX}/`);
}
