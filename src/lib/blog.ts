import {
  type Locale,
  languageTags,
  localePath,
  siteLanguage,
  siteUrl
} from "./i18n.ts"
import type { PublishedArticle } from "./types.ts"

// Pure helpers for the /blog routes (no I/O, unit-tested in blog.test.ts).

// Site path of a post. Posts live under the locale matching their language,
// so a Portuguese post is /blog/<slug> and an English one /en/blog/<slug>.
export function blogArticlePath(locale: Locale, slug: string): string {
  return localePath(locale, `/blog/${slug}`)
}

export const blogFeedPath = "/blog/feed"

// Posts for one locale, newest first (published_at is ISO-8601 UTC, so the
// strings sort chronologically).
export function articlesForLocale(
  articles: PublishedArticle[],
  locale: Locale
): PublishedArticle[] {
  return articles
    .filter((article) => siteLanguage(article.language) === locale)
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
}

// The image for Open Graph / cards: social_image is the 1200×627 card dev.to
// renders; cover_image is the 1000×420 banner.
export function articleImage(article: {
  cover_image: string | null
  social_image?: string | null
}): string | undefined {
  return article.social_image || article.cover_image || undefined
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type RssFeedInput = {
  locale: Locale
  title: string
  description: string
  articles: PublishedArticle[]
}

// RSS 2.0 for one locale's posts. Items link to the site (the canonical
// home of each post), not to dev.to.
export function buildRssFeed({
  locale,
  title,
  description,
  articles
}: RssFeedInput): string {
  const channelUrl = `${siteUrl}${localePath(locale, "/blog")}`
  const feedUrl = `${siteUrl}${localePath(locale, blogFeedPath)}`
  const posts = articlesForLocale(articles, locale)
  const lastBuildDate = new Date(posts[0]?.published_at ?? 0).toUTCString()

  const items = posts.map((article) => {
    const url = `${siteUrl}${blogArticlePath(locale, article.slug)}`
    const categories = article.tag_list
      .map((tag) => `\n      <category>${escapeXml(tag)}</category>`)
      .join("")
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <description>${escapeXml(article.description)}</description>${categories}
    </item>`
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(channelUrl)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${languageTags[locale]}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    ""
  ].join("\n")
}
