// Locale core: pure and dependency-free so the proxy, server components,
// client components, and tests can all import it.
export const locales = ["pt", "en"] as const

export type Locale = (typeof locales)[number]

// Portuguese lives unprefixed at the root (bergholz.com.br is a Brazilian
// site first); English lives under /en. The proxy rewrites unprefixed paths
// to /pt internally, so "/pt" never appears in public URLs.
export const defaultLocale: Locale = "pt"

// Public origin, for absolute URLs (metadataBase, sitemap, feeds, JSON-LD).
export const siteUrl = "https://bergholz.com.br"

// BCP 47 tags for <html lang>, hreflang alternates, and Intl APIs.
export const languageTags: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en"
}

// Open Graph's underscore flavour of the same tags.
export const openGraphLocales: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US"
}

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

// Collapse a BCP-47 tag as reported by YouTube ("en", "en-US", "pt-BR") or
// dev.to ("en", "pt") to a site locale; anything else (or unset) is unknown.
export function siteLanguage(tag: string | undefined): Locale | undefined {
  const primary = tag?.split("-")[0].toLowerCase()
  return primary === "en" || primary === "pt" ? primary : undefined
}

// Public URL path for a route in a given locale.
// localePath("pt", "/videos") -> "/videos"
// localePath("en", "/videos") -> "/en/videos"
// localePath("en", "/") -> "/en"
export function localePath(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

// Metadata `alternates` for a page: locale-specific canonical plus hreflang
// pairs. Relative paths are resolved against metadataBase.
export function pageAlternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      "pt-BR": localePath("pt", path),
      en: localePath("en", path),
      "x-default": localePath(defaultLocale, path)
    }
  }
}

// Inverse of localePath: "/en/videos" -> "/videos". Also strips the default
// locale's prefix ("/pt/videos" -> "/videos") — it never appears in public
// URLs, but stripping it keeps callers correct even if they're ever handed
// the internal rewritten path.
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(locale.length + 1)
  }
  return pathname
}
