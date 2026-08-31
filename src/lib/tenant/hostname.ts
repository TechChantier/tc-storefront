export type NormalizeHostnameResult =
  | { ok: true; hostname: string }
  | { ok: false; reason: string };

/**
 * Normalize an incoming Host / hostname for tenant resolution.
 * Lowercase, strip scheme, strip port, strip trailing dots, reject IPs / malformed.
 */
export function normalizeHostname(
  input: string | null | undefined,
): NormalizeHostnameResult {
  if (input == null) {
    return { ok: false, reason: "hostname_missing" };
  }

  let hostname = input.trim().toLowerCase();

  if (hostname.length === 0) {
    return { ok: false, reason: "hostname_empty" };
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(hostname)) {
    try {
      const parsed = new URL(hostname);
      if (parsed.pathname && parsed.pathname !== "/") {
        return { ok: false, reason: "hostname_malformed" };
      }
      if (parsed.search || parsed.hash || parsed.username || parsed.password) {
        return { ok: false, reason: "hostname_malformed" };
      }
      hostname = parsed.hostname.toLowerCase();
    } catch {
      return { ok: false, reason: "hostname_malformed" };
    }
  }

  const isBracketedIpv6 = hostname.startsWith("[") && hostname.includes("]");
  if (isBracketedIpv6) {
    const closing = hostname.indexOf("]");
    const literal = hostname.slice(1, closing);
    const rest = hostname.slice(closing + 1);
    if (rest.startsWith(":")) {
      hostname = literal;
    } else if (rest.length === 0) {
      hostname = literal;
    } else {
      return { ok: false, reason: "hostname_malformed" };
    }
  } else {
    const colonIndex = hostname.lastIndexOf(":");
    if (colonIndex !== -1) {
      const maybePort = hostname.slice(colonIndex + 1);
      if (/^\d+$/.test(maybePort)) {
        hostname = hostname.slice(0, colonIndex);
      }
    }
  }

  hostname = hostname.replace(/\.+$/, "");

  if (hostname.length === 0) {
    return { ok: false, reason: "hostname_empty" };
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return { ok: false, reason: "hostname_unsupported_ip" };
  }

  if (hostname.includes(":")) {
    return { ok: false, reason: "hostname_unsupported_ip" };
  }

  const labels = hostname.split(".");
  if (labels.some((label) => label.length === 0)) {
    return { ok: false, reason: "hostname_malformed" };
  }

  const labelPattern = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
  for (const label of labels) {
    if (!labelPattern.test(label)) {
      return { ok: false, reason: "hostname_malformed" };
    }
  }

  if (hostname.length > 253) {
    return { ok: false, reason: "hostname_too_long" };
  }

  return { ok: true, hostname };
}

export function decodeHostnameParam(hostnameParam: string): string | null {
  try {
    return decodeURIComponent(hostnameParam);
  } catch {
    return null;
  }
}
