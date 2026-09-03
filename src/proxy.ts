import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { defaultLocale } from "@/lib/i18n"

// Locale routing: Portuguese (the default) lives unprefixed at the root and is
// rewritten internally to /pt; English is served as-is under /en. Visiting
// /pt/... directly redirects to the canonical unprefixed URL so the same page
// never exists at two public URLs. No Accept-Language auto-redirects — they
// hurt indexing (Googlebot crawls from the US); the nav has a language switcher.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === `/${defaultLocale}` ||
    pathname.startsWith(`/${defaultLocale}/`)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/"
    return NextResponse.redirect(url, 308)
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Next internals, /api/* route handlers (they live outside [lang]) and
  // any file with an extension (static assets and metadata routes like
  // sitemap.xml, robots.txt, og.png). Routes under [lang] must therefore be
  // extensionless — which is why the RSS feed is /blog/feed, not rss.xml.
  matcher: ["/((?!_next|api/|.*\\..*).*)"]
}
