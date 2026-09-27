import assert from "node:assert/strict"
import { test } from "node:test"
import {
  articleImage,
  articlesForLocale,
  articlesMissingFromPublicList,
  blogArticlePath,
  blogPostRouting,
  buildRssFeed,
  postLocales
} from "./blog.ts"
import type { Article, PublishedArticle } from "./types.ts"

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

test("articlesMissingFromPublicList finds posts still missing from Forem's public CDN", () => {
  const known = published({ id: 1, slug: "known", language: "pt" })
  const authenticated = [
    { id: 1, slug: "known" },
    { id: 2, slug: "new-post" }
  ] as Article[]

  assert.deepEqual(
    articlesMissingFromPublicList(authenticated, [known]).map(
      (article) => article.slug
    ),
    ["new-post"]
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

test("postLocales maps each post's slug to its site locale", () => {
  const posts = postLocales([
    published({ id: 1, slug: "ola", language: "pt" }),
    published({ id: 2, slug: "hello", language: "en" }),
    published({ id: 3, slug: "hola", language: "es" })
  ])
  assert.deepEqual(posts, { ola: "pt", hello: "en" })
})

test("blogPostRouting 404s unknown posts and redirects wrong locales", () => {
  const posts = { ola: "pt", hello: "en" } as const

  // Posts under their own locale render normally.
  assert.equal(blogPostRouting("/blog/ola", posts), undefined)
  assert.equal(blogPostRouting("/en/blog/hello", posts), undefined)

  // Unknown slugs 404 in the locale of the URL.
  assert.deepEqual(blogPostRouting("/blog/nope", posts), { notFound: "pt" })
  assert.deepEqual(blogPostRouting("/en/blog/nope", posts), {
    notFound: "en"
  })
  assert.deepEqual(blogPostRouting("/blog/constructor", posts), {
    notFound: "pt"
  })

  // A post under the other locale redirects to its real URL.
  assert.deepEqual(blogPostRouting("/blog/hello", posts), {
    redirect: "/en/blog/hello"
  })
  assert.deepEqual(blogPostRouting("/en/blog/ola", posts), {
    redirect: "/blog/ola"
  })

  // Anything that isn't a single post path is left alone.
  for (const path of ["/blog", "/blog/feed", "/en/blog/feed", "/videos"]) {
    assert.equal(blogPostRouting(path, posts), undefined)
  }
  assert.equal(blogPostRouting("/blog/ola/extra", posts), undefined)
})
