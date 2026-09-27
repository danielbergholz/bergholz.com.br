import type { Metadata } from "next"
import { site } from "./site.ts"
import type { SiteConfig } from "./site-config.ts"

export type PageMetadataOptions = {
  title: string
  description: string
  // Path of the page, e.g. "/" or "/about"; the canonical URL and og:url.
  path: string
  image?: SiteConfig["ogImage"]
  keywords?: string[]
  // Replaces the default `{ canonical: path }`, e.g. to add hreflang links.
  alternates?: Metadata["alternates"]
  // Extra Open Graph fields: an article's dates, a non-default locale, …
  openGraph?: Record<string, unknown>
  noIndex?: boolean
}

// Metadata for one page. Next replaces `openGraph`, `twitter` and
// `alternates` wholesale in each segment instead of merging them with the root
// layout's, so every page builds them here in full — otherwise it would be
// shared with the home page's title, URL or image.
export function pageMetadata({
  title,
  description,
  path,
  image = site.ogImage,
  keywords,
  alternates = { canonical: path },
  openGraph,
  noIndex = false
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.ogLocale,
      url: path,
      title,
      description,
      images: [image],
      ...openGraph
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitterHandle,
      creator: site.twitterHandle,
      title,
      description,
      images: [image]
    },
    robots: noIndex ? { index: false, follow: true } : undefined
  }
}

// Site-wide fields for the root layout, merged with the home page's
// pageMetadata(). Pages inherit these and don't repeat them.
export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  authors: [site.author],
  creator: site.author.name,
  publisher: site.name,
  appleWebApp: { title: site.name },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
}
