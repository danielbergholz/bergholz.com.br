import type { Route } from "next"
import {
  type Locale,
  languageTags,
  localePath,
  siteLanguage,
  siteUrl
} from "./i18n.ts"

import type { Article, PublishedArticle } from "./types.ts"

// Pure helpers for the /blog routes (no I/O, unit-tested in blog.test.ts).

// Site path of a post. Posts live under the locale matching their language,
// so a Portuguese post is /blog/<slug> and an English one /en/blog/<slug>.
export function blogArticlePath(locale: Locale, slug: string): Route {
  return localePath(locale, `/blog/${slug}`)
}

export const blogFeedPath = "/blog/feed"

// slug → locale for every post with a site language. Served at
// /api/blog/posts for the proxy (see blogPostRouting).
export function postLocales(
  articles: PublishedArticle[]
): Record<string, Locale> {
  const posts: Record<string, Locale> = {}
  for (const article of articles) {
    const locale = siteLanguage(article.language)
    if (locale) posts[article.slug] = locale
  }
  return posts
}

// What the proxy should answer for a public post URL (/blog/<slug> or
// /en/blog/<slug>) before the page renders: a 404 for an unknown post, a 308
// to the post's real locale, or undefined to let the page render. This has
// to happen in the proxy: with Cache Components the page streams a static
// shell first, so a notFound()/redirect() in the page can no longer change
// the status code on the first visit to a URL.
export function blogPostRouting(
  pathname: string,
  posts: Record<string, Locale>
): { notFound: Locale } | { redirect: Route } | undefined {
  const match = pathname.match(/^(?:\/(en))?\/blog\/([^/]+)$/)
  if (!match) return undefined
  const [, prefix, slug] = match
  if (`/blog/${slug}` === blogFeedPath) return undefined

  const locale: Locale = prefix === "en" ? "en" : "pt"
  const postLocale = Object.hasOwn(posts, slug) ? posts[slug] : undefined
  if (!postLocale) return { notFound: locale }
  if (postLocale !== locale) {
    return { redirect: blogArticlePath(postLocale, slug) }
  }
  return undefined
}

// Forem caches the public author listing at its CDN for much longer than its
// Cache-Control header suggests. The authenticated published list is private
// and fresh, so use it to spot newly published posts that the public listing
// has not propagated yet. The caller can then recover only those posts from
// their final public slug instead of issuing one request per existing post.
export function articlesMissingFromPublicList(
  articles: Article[],
  publishedArticles: PublishedArticle[]
): Article[] {
  const publishedIds = new Set(publishedArticles.map((article) => article.id))
  return articles.filter((article) => !publishedIds.has(article.id))
}

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
