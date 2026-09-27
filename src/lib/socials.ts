import type { Locale } from "./i18n.ts"

// Two YouTube channels, one per content language. The `tag` is the short
// channel marker shown in the UI ("EN"/"BR"), matching the language-badge
// convention used on content cards.
const youtubeChannelByLocale = {
  en: { href: "https://www.youtube.com/@DanielBergholz", tag: "EN" },
  pt: { href: "https://www.youtube.com/@DanielBergholzbr", tag: "BR" }
} as const

type YouTubeChannel =
  (typeof youtubeChannelByLocale)[keyof typeof youtubeChannelByLocale]

// Both channels, with the one matching the page's language first.
export function youtubeChannels(locale: Locale): YouTubeChannel[] {
  return locale === "pt"
    ? [youtubeChannelByLocale.pt, youtubeChannelByLocale.en]
    : [youtubeChannelByLocale.en, youtubeChannelByLocale.pt]
}

// Every other profile. The single source for these URLs: the home page, /links,
// the footer and site.socialLinks (JSON-LD sameAs) all read them from here.
export const socialUrls = {
  instagram: "https://www.instagram.com/bergholz.dev/",
  x: "https://twitter.com/danielbergholz",
  linkedin: "https://www.linkedin.com/in/daniel-gobbi-bergholz/",
  github: "https://github.com/danielbergholz",
  devto: "https://dev.to/danielbergholz"
} as const
