import { timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import type { NextRequest } from "next/server"

import { DEVTO_CACHE_TAG } from "@/data-access/blog"

// On-demand revalidation for everything built from dev.to data. Protected by
// REVALIDATE_SECRET (query `?secret=` or `Authorization: Bearer`); see the
// README for wiring it to dev.to's article_created/article_updated webhooks.
// Without the env var the endpoint is disabled (always 401).

function secretMatches(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("secret")

  if (!secretMatches(provided, process.env.REVALIDATE_SECRET)) {
    return Response.json(
      { revalidated: false, message: "Invalid secret" },
      { status: 401 }
    )
  }

  // Expire the cached dev.to responses immediately (webhook semantics — the
  // next visit fetches fresh data instead of serving stale). Every route built
  // from them (home, /videos, /blog, posts, feeds, sitemap) carries the tag
  // through its fetches, so this alone marks them all for regeneration.
  revalidateTag(DEVTO_CACHE_TAG, { expire: 0 })

  return Response.json({ revalidated: true, now: Date.now() })
}
