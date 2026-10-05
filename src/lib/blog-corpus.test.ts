import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { test } from "node:test"
import { blogPostRouting, buildRssFeed, postLocales } from "./blog.ts"
import type { LocalArticle } from "./blog-content.ts"

const posts: LocalArticle[] = JSON.parse(
  readFileSync(
    new URL("../../content/blog/.generated/articles.json", import.meta.url),
    "utf8"
  )
)
const migrated: { slug: string; locale: "pt" | "en"; publishedAt: string }[] =
  JSON.parse(
    readFileSync(
      new URL("../../content/blog/migration.json", import.meta.url),
      "utf8"
    )
  )

test("every migrated post preserves its URL, locale, publication date and RSS identity", () => {
  const routing = postLocales(posts)
  for (const old of migrated) {
    const post = posts.find(
      (p) => p.slug === old.slug && p.language === old.locale
    )
    assert.ok(post, `${old.locale}/${old.slug}`)
    assert.equal(post.published_at, new Date(old.publishedAt).toISOString())
    const path = `${old.locale === "en" ? "/en" : ""}/blog/${old.slug}`
    assert.equal(blogPostRouting(path, routing), undefined)
    assert.equal(post.url, `https://bergholz.com.br${path}`)
    assert.match(
      buildRssFeed({
        locale: old.locale,
        title: "Blog",
        description: "Posts",
        articles: posts
      }),
      new RegExp(`<guid isPermaLink="true">${post.url}</guid>`)
    )
    assert.doesNotMatch(post.body_markdown, /\{%/)
    assert.doesNotMatch(
      post.body_html,
      /src="https:\/\/(?:media\d*\.)?dev\.to\//
    )
  }
})

test("all imported image paths resolve to checked-in local assets", () => {
  for (const post of posts) {
    const images = [
      post.cover_image,
      post.social_image,
      ...Array.from(
        post.body_html.matchAll(/src="(\/blog\/[^"#?]+)"/g),
        (m) => m[1]
      )
    ].filter(Boolean)
    for (const image of images)
      assert.ok(
        existsSync(new URL(`../../public${image}`, import.meta.url)),
        image ?? ""
      )
  }
})
