import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { blogPostRouting } from "@/lib/blog"
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n"
import postIndex from "../content/blog/.generated/index.json"

// Locale routing: Portuguese (the default) lives unprefixed at the root and is
// rewritten internally to /pt; English is served as-is under /en. Visiting
// /pt/... directly redirects to the canonical unprefixed URL so the same page
// never exists at two public URLs. No Accept-Language auto-redirects — they
// hurt indexing (Googlebot crawls from the US); the nav has a language switcher.
//
// Blog post status codes are decided here too, before anything renders: an
// unknown slug gets a real 404 and a post under the wrong locale a 308 (see
// blogPostRouting). The page can't do either on a first visit once its static
// shell has started streaming. Other unknown paths match no route and get the
// 404 from app/global-not-found.tsx.
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

  if (pathname.includes("/blog/")) {
    const routing = blogPostRouting(pathname, postLocales)

    if (routing && "redirect" in routing) {
      return NextResponse.redirect(new URL(routing.redirect, request.url), 308)
    }
    if (routing && "notFound" in routing) {
      return notFoundResponse(request, routing.notFound)
    }
  }

  const locale: Locale =
    pathname === "/en" || pathname.startsWith("/en/") ? "en" : defaultLocale

  if (locale === "en") {
    return NextResponse.next(withLocale(request, locale))
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`
  return NextResponse.rewrite(url, withLocale(request, locale))
}

// Passes the locale to the render as the x-locale request header: the global
// 404 page (app/global-not-found.tsx) renders outside [lang] and has no other
// way to know it.
function withLocale(request: NextRequest, locale: Locale) {
  const headers = new Headers(request.headers)
  headers.set("x-locale", locale)
  return { request: { headers } }
}

// Rewrites to a path no route matches, so app/global-not-found.tsx renders the
// localized 404 page.
function notFoundResponse(request: NextRequest, locale: Locale) {
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}/404`
  return NextResponse.rewrite(url, withLocale(request, locale))
}

// Generated from local Markdown before dev/build; no HTTP lookup or stale map.
const postLocales: Record<string, Locale[]> = {}
for (const { slug, language } of postIndex) {
  if (hasLocale(language)) {
    postLocales[slug] ??= []
    postLocales[slug].push(language)
  }
}

export const config = {
  // Skip Next internals, /api/* route handlers (they live outside [lang]) and
  // any file with an extension (static assets and metadata routes like
  // sitemap.xml, robots.txt, og.png). Routes under [lang] must therefore be
  // extensionless — which is why the RSS feed is /blog/feed, not rss.xml.
  matcher: ["/((?!_next|api/|.*\\..*).*)"]
}
