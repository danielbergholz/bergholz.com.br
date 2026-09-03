import assert from "node:assert/strict"
import { test } from "node:test"
import {
  articleImage,
  articlesForLocale,
  blogArticlePath,
  buildRssFeed
} from "./blog.ts"
import type { PublishedArticle } from "./types.ts"

function published(opts: {
  id: number
  slug: string
  language: string
  date?: string
  title?: string
  tags?: string[]
}): PublishedArticle {
  return {
    id: opts.id,
    title: opts.title ?? `Post ${opts.id}`,
    slug: opts.slug,
    description: `desc ${opts.id}`,
    published_at: opts.date ?? "2026-01-01T00:00:00Z",
    edited_at: null,
    url: `https://dev.to/danielbergholz/${opts.slug}`,
    canonical_url: `https://dev.to/danielbergholz/${opts.slug}`,
    cover_image: `cover-${opts.id}`,
    social_image: `social-${opts.id}`,
    reading_time_minutes: 4,
    tag_list: opts.tags ?? [],
    language: opts.language
  }
}

test("blogArticlePath puts posts under the locale prefix", () => {
  assert.equal(blogArticlePath("pt", "meu-post"), "/blog/meu-post")
  assert.equal(blogArticlePath("en", "my-post"), "/en/blog/my-post")
})

test("articlesForLocale filters by language and sorts newest first", () => {
  const older = published({
    id: 1,
    slug: "older",
    language: "en",
    date: "2025-01-01T00:00:00Z"
  })
  const newer = published({
    id: 2,
    slug: "newer",
    language: "en",
    date: "2026-01-01T00:00:00Z"
  })
  const pt = published({ id: 3, slug: "pt-post", language: "pt" })
  const es = published({ id: 4, slug: "es-post", language: "es" })

  assert.deepEqual(
    articlesForLocale([older, pt, newer, es], "en").map((a) => a.slug),
    ["newer", "older"]
  )
  assert.deepEqual(
    articlesForLocale([older, pt, newer, es], "pt").map((a) => a.slug),
    ["pt-post"]
  )
})

test("articleImage prefers the social card, then the cover", () => {
  assert.equal(
    articleImage({ cover_image: "cover", social_image: "social" }),
    "social"
  )
  assert.equal(
    articleImage({ cover_image: "cover", social_image: "" }),
    "cover"
  )
  assert.equal(articleImage({ cover_image: null }), undefined)
})

test("buildRssFeed lists only the locale's posts, escaped, linking the site", () => {
  const en = published({
    id: 1,
    slug: "hello-world",
    language: "en",
    title: "Tom & Jerry <3",
    tags: ["ai", "elixir"]
  })
  const pt = published({ id: 2, slug: "ola", language: "pt" })

  const xml = buildRssFeed({
    locale: "en",
    title: "Blog",
    description: "Posts",
    articles: [pt, en]
  })

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss /)
  assert.match(xml, /<title>Tom &amp; Jerry &lt;3<\/title>/)
  assert.match(
    xml,
    /<link>https:\/\/bergholz\.com\.br\/en\/blog\/hello-world<\/link>/
  )
  assert.match(xml, /<category>elixir<\/category>/)
  assert.match(xml, /<language>en<\/language>/)
  assert.match(
    xml,
    /<atom:link href="https:\/\/bergholz\.com\.br\/en\/blog\/feed" rel="self"/
  )
  assert.match(xml, /<\/rss>\n$/)
  assert.doesNotMatch(xml, /ola/, "Portuguese post is not in the English feed")
  assert.doesNotMatch(xml, /dev\.to/, "items link to the site, not dev.to")
})
