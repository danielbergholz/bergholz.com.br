import type { Metadata } from "next"
import { headers } from "next/headers"

import { NotFoundContent } from "@/components/not-found-content"
import { SiteDocument } from "@/components/site-document"
import { boundaryStrings } from "@/dictionaries/boundary"
import { defaultLocale, hasLocale } from "@/lib/i18n"

// The site's 404 page, for every URL that matches no route (unknown paths, and
// unknown blog posts, which the proxy rewrites to /<locale>/404). A
// [lang]/not-found.tsx can't serve these: with the root layout under [lang],
// Next would fall back to a client-rendered error page. This file sits outside
// every layout (experimental.globalNotFound), so it renders the full document
// itself, in the locale the proxy passes as the x-locale request header —
// which is also why it renders per request.
export const instant = false

async function requestLocale() {
  const value = (await headers()).get("x-locale") ?? ""
  return hasLocale(value) ? value : defaultLocale
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: boundaryStrings[await requestLocale()].notFoundTitle }
}

export default async function GlobalNotFound() {
  const locale = await requestLocale()

  return (
    <SiteDocument locale={locale}>
      <NotFoundContent locale={locale} />
    </SiteDocument>
  )
}
