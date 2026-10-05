import { cacheLife } from "next/cache"
import type { LocalArticle } from "@/lib/blog-content"
import type { Locale } from "@/lib/i18n"
import type {
  Article,
  PublishedArticle,
  PublishedArticleWithBody
} from "@/lib/types"
import articles from "../../content/blog/.generated/articles.json"

const posts = articles as LocalArticle[]

export async function getArticles(): Promise<Article[]> {
  "use cache"
  cacheLife("max")
  return posts
}

export async function getPublishedArticles(): Promise<PublishedArticle[]> {
  "use cache"
  cacheLife("max")
  return posts.map(
    ({ body_html: _html, body_markdown: _markdown, ...post }) => post
  )
}

export async function getArticle(
  slug: string,
  locale: Locale
): Promise<PublishedArticleWithBody | null> {
  "use cache"
  cacheLife("max")
  return (
    posts.find((post) => post.slug === slug && post.language === locale) ?? null
  )
}
