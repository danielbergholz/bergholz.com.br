import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { blogPostRouting } from "@/lib/blog"
import { defaultLocale, type Locale } from "@/lib/i18n"

// Locale routing: Portuguese (the default) lives unprefixed at the root and is
// rewritten internally to /pt; English is served as-is under /en. Visiting
// /pt/... directly redirects to the canonical unprefixed URL so the same page
// never exists at two public URLs. No Accept-Language auto-redirects — they
// hurt indexing (Googlebot crawls from the US); the nav has a language switcher.
//
// Blog posts are also checked here (see blogPostRouting): an unknown slug gets
// a real 404 and a post under the wrong locale a 308, which the page itself
// can't do on a first visit once its static shell has started streaming.
export async function proxy(request: NextRequest) {
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
    const origin = request.nextUrl.origin
    let routing = await routePost(pathname, origin, POSTS_TTL_MS)
    // A slug missing from a cached map may be a post published since it was
    // fetched; confirm against a fresh copy before answering 404.
    if (routing && "notFound" in routing) {
      routing = await routePost(pathname, origin, POSTS_RECHECK_MS)
    }

    if (routing && "redirect" in routing) {
      return NextResponse.redirect(new URL(routing.redirect, request.url), 308)
    }
    if (routing && "notFound" in routing) {
      // Any path the [...rest] catch-all handles renders the localized 404.
      const url = request.nextUrl.clone()
      url.pathname = `/${routing.notFound}/404`
      return NextResponse.rewrite(url, { status: 404 })
    }
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`
  return NextResponse.rewrite(url)
}

// The slug → locale map from /api/blog/posts (a prerendered route, so the
// fetch is a CDN hit), kept in memory so most requests skip it. If it can't be
// fetched, the proxy lets the page decide.
const POSTS_TTL_MS = 60_000
const POSTS_RECHECK_MS = 5_000
let postsCache: { fetchedAt: number; posts: Record<string, Locale> } | undefined

async function routePost(pathname: string, origin: string, maxAgeMs: number) {
  if (!postsCache || Date.now() - postsCache.fetchedAt > maxAgeMs) {
    try {
      const response = await fetch(new URL("/api/blog/posts", origin))
      if (response.ok) {
        postsCache = { fetchedAt: Date.now(), posts: await response.json() }
      }
    } catch {
      // Keep the previous copy, if any.
    }
  }
  return postsCache && blogPostRouting(pathname, postsCache.posts)
}

export const config = {
  // Skip Next internals, /api/* route handlers (they live outside [lang]) and
  // any file with an extension (static assets and metadata routes like
  // sitemap.xml, robots.txt, og.png). Routes under [lang] must therefore be
  // extensionless — which is why the RSS feed is /blog/feed, not rss.xml.
  matcher: ["/((?!_next|api/|.*\\..*).*)"]
}
