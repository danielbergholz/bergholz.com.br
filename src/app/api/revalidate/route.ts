import { timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"

import { DEVTO_CACHE_TAG } from "@/data-access/blog"

// On-demand revalidation for everything built from dev.to data, called by the
// estudio repo's sync script and `npm run revalidate` (see the README).
// Protected by REVALIDATE_SECRET, sent only as `Authorization: Bearer` — never
// in the URL, where it would end up in access logs. Without the env var the
// endpoint is disabled (always 401).

function secretMatches(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null

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
