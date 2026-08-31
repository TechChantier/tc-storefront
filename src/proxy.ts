import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeHostname } from "@/lib/tenant/hostname";
import {
  buildStorefrontRewritePath,
  shouldSkipStorefrontRewrite,
} from "@/lib/tenant/rewrite-path";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldSkipStorefrontRewrite(pathname)) {
    return NextResponse.next();
  }

  const hostHeader = request.headers.get("host");
  const normalized = normalizeHostname(hostHeader);

  if (!normalized.ok) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const rewritePath = buildStorefrontRewritePath(
    normalized.hostname,
    pathname,
    request.nextUrl.search,
  );

  return NextResponse.rewrite(new URL(rewritePath, request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
