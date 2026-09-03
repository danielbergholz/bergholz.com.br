import { getPublishedArticles } from "@/data-access/blog"
import { getDictionary } from "@/dictionaries"
import { buildRssFeed } from "@/lib/blog"
import { hasLocale, locales } from "@/lib/i18n"

export const revalidate = 3600 // 1 hour

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

// One RSS feed per locale: /blog/feed (Portuguese) and /en/blog/feed
// (English). Extensionless so the proxy rewrites it like any other page.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  if (!hasLocale(lang)) return new Response("Not found", { status: 404 })

  const [dict, articles] = await Promise.all([
    getDictionary(lang),
    getPublishedArticles()
  ])

  return new Response(
    buildRssFeed({
      locale: lang,
      title: dict.meta.blog.title,
      description: dict.meta.blog.description,
      articles
    }),
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } }
  )
}
