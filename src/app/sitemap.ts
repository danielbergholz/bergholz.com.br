import type { MetadataRoute } from "next"

import { getPublishedArticles } from "@/data-access/blog"
import { blogArticlePath } from "@/lib/blog"
import { localePath, locales, siteLanguage, siteUrl } from "@/lib/i18n"
import { siteRoutes } from "@/lib/routes"

const baseUrl = siteUrl

export const revalidate = 3600 // 1 hour — picks up new posts with the pages

// Generated from the route registry in src/lib/routes.ts — one entry per
// locale per route, each carrying the full hreflang alternate set — plus one
// entry per blog post under the locale matching its language (posts exist in
// a single language, so they carry no alternates).
// routes.test.ts guarantees the registry matches the pages on disk.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()

  const pages = siteRoutes.flatMap((route) => {
    const languages = {
      "pt-BR": `${baseUrl}${localePath("pt", route.path)}`,
      en: `${baseUrl}${localePath("en", route.path)}`,
      "x-default": `${baseUrl}${localePath("pt", route.path)}`
    }

    return locales.map((locale) => ({
      url: `${baseUrl}${localePath(locale, route.path)}`,
      lastModified: currentDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages }
    }))
  })

  const articles = await getPublishedArticles()
  const posts = articles.flatMap((article) => {
    const locale = siteLanguage(article.language)
    if (!locale) return []
    return [
      {
        url: `${baseUrl}${blogArticlePath(locale, article.slug)}`,
        lastModified: new Date(article.edited_at ?? article.published_at),
        changeFrequency: "monthly" as const,
        priority: 0.7
      }
    ]
  })

  return [...pages, ...posts]
}
