import type { Metadata } from "next"

import {
  type Locale,
  localePath,
  openGraphLocales,
  pageAlternates
} from "./i18n.ts"
import { type PageMetadataOptions, pageMetadata } from "./metadata.ts"

// pageMetadata() for a page that exists in both languages: canonical URL and
// og:url in the page's locale, hreflang links to both versions, and the
// locale's og:locale.
export function localizedMetadata(
  locale: Locale,
  path: string,
  options: Omit<PageMetadataOptions, "path" | "alternates">
): Metadata {
  return pageMetadata({
    ...options,
    path: localePath(locale, path),
    alternates: pageAlternates(locale, path),
    openGraph: { locale: openGraphLocales[locale], ...options.openGraph }
  })
}
