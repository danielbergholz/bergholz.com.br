import type { Locale } from "./i18n.ts"

// Two YouTube channels, one per content language. The `tag` is the short
// channel marker shown in the UI ("EN"/"BR"), matching the language-badge
// convention used on content cards.
export const youtubeChannelByLocale = {
  en: { href: "https://www.youtube.com/@DanielBergholz", tag: "EN" },
  pt: { href: "https://www.youtube.com/@DanielBergholzbr", tag: "BR" }
} as const

export type YouTubeChannel =
  (typeof youtubeChannelByLocale)[keyof typeof youtubeChannelByLocale]

// Both channels, with the one matching the page's language first.
export function youtubeChannels(locale: Locale): YouTubeChannel[] {
  return locale === "pt"
    ? [youtubeChannelByLocale.pt, youtubeChannelByLocale.en]
    : [youtubeChannelByLocale.en, youtubeChannelByLocale.pt]
}

export const instagramUrl = "https://www.instagram.com/bergholz.dev/"
