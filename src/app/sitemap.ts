import type { MetadataRoute } from "next"

import { getPublishedArticles } from "@/data-access/blog"
import { blogArticlePath } from "@/lib/blog"
import { localePath, locales, siteLanguage } from "@/lib/i18n"
import { siteRoutes } from "@/lib/routes"
import { site } from "@/lib/site"

// Generated from the route registry in src/lib/routes.ts — one entry per
// locale per route, each carrying the full hreflang alternate set — plus one
// entry per blog post under the locale matching its language (posts exist in
// a single language, so they carry no alternates). Pages have no lastModified
// (it would just be the build date); posts use their dev.to edit date.
// routes.test.ts guarantees the registry matches the pages on disk.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = siteRoutes.flatMap((route) => {
    const languages = {
      "pt-BR": `${site.url}${localePath("pt", route.path)}`,
      en: `${site.url}${localePath("en", route.path)}`,
      "x-default": `${site.url}${localePath("pt", route.path)}`
    }

    return locales.map((locale) => ({
      url: `${site.url}${localePath(locale, route.path)}`,
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
        url: `${site.url}${blogArticlePath(locale, article.slug)}`,
        lastModified: new Date(article.edited_at ?? article.published_at),
        changeFrequency: "monthly" as const,
        priority: 0.7
      }
    ]
  })

  return [...pages, ...posts]
}
