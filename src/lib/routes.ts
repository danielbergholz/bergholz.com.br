// Single source of truth for the site's public routes. The sitemap is
// generated from this list (once per locale), and routes.test.ts fails if a
// page exists under src/app/[lang]/ that isn't registered here — so the
// sitemap can't silently drift from the filesystem.
export type SiteRoute = {
  path: string
  changeFrequency: "weekly" | "monthly"
  priority: number
}

export const siteRoutes: SiteRoute[] = [
  { path: "/", changeFrequency: "monthly", priority: 1.0 },
  { path: "/videos", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/courses", changeFrequency: "monthly", priority: 0.8 },
  { path: "/products", changeFrequency: "monthly", priority: 0.7 },
  { path: "/work-with-me", changeFrequency: "monthly", priority: 0.7 },
  { path: "/links", changeFrequency: "monthly", priority: 0.5 }
]
