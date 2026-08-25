import type { MetadataRoute } from "next"

import { localePath, locales } from "@/lib/i18n"
import { siteRoutes } from "@/lib/routes"

const baseUrl = "https://bergholz.com.br"

// Generated from the route registry in src/lib/routes.ts — one entry per
// locale per route, each carrying the full hreflang alternate set.
// routes.test.ts guarantees the registry matches the pages on disk.
export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()

  return siteRoutes.flatMap((route) => {
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
}
