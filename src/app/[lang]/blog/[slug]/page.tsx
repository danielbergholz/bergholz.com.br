import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { cache } from "react"

import { ArticleCover } from "@/components/article-card"
import { ExternalLink } from "@/components/icons"
import { JsonLd } from "@/components/json-ld"
import { getArticle, getPublishedArticles } from "@/data-access/blog"
import { getDictionary } from "@/dictionaries"
import { articleImage, articlesForLocale, blogArticlePath } from "@/lib/blog"
import {
  type Locale,
  hasLocale,
  languageTags,
  localePath,
  openGraphLocales,
  siteLanguage,
  siteUrl
} from "@/lib/i18n"
import type { PublishedArticle, PublishedArticleWithBody } from "@/lib/types"
import { readableDate } from "@/lib/utils"

export const revalidate = 3600 // 1 hour

// Prerender every post under the locale matching its language. Runs once per
// `lang` from the layout's generateStaticParams; the listing fetch is cached
// and shared with every page render below.
export async function generateStaticParams({
  params
}: {
  params: { lang: string }
}) {
  if (!hasLocale(params.lang)) return []
  const articles = await getPublishedArticles()
  return articlesForLocale(articles, params.lang).map(({ slug }) => ({
    slug
  }))
}

// The listing (one cached request, shared by every route) gates the
// per-article request: a slug that isn't published never hits the article
// endpoint, so random URLs cost zero dev.to calls and 404 right here. A post
// requested under the wrong locale prefix redirects to its real URL instead
// of duplicating the page. React `cache` so generateMetadata and the page
// share one parse of the responses.
type ResolvedArticle =
  | { redirectTo: string }
  | { listed: PublishedArticle; article: PublishedArticleWithBody }

const resolveArticle = cache(
  async (lang: Locale, slug: string): Promise<ResolvedArticle> => {
    const listed = (await getPublishedArticles()).find(
      (article) => article.slug === slug
    )
    const locale = listed && siteLanguage(listed.language)
    if (!listed || !locale) notFound()
    if (locale !== lang) return { redirectTo: blogArticlePath(locale, slug) }

    const article = await getArticle(slug)
    if (!article) notFound()
    return { listed, article }
  }
)

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()

  const resolved = await resolveArticle(lang, slug)
  if ("redirectTo" in resolved) return {}

  const { listed, article } = resolved
  const path = blogArticlePath(lang, slug)
  const image = articleImage(article)
  // dev.to renders social cards at 1200×627 and cover banners at 1000×420.
  const imageSize = article.social_image
    ? { width: 1200, height: 627 }
    : { width: 1000, height: 420 }

  return {
    title: `${article.title} | Daniel Bergholz`,
    description: article.description,
    // A post exists in one language only, so there are no hreflang pairs:
    // just the canonical, which is this page (dev.to's canonical_url points
    // here too).
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: "Daniel Bergholz",
      locale: openGraphLocales[lang],
      title: article.title,
      description: article.description,
      url: path,
      publishedTime: article.published_at,
      modifiedTime: article.edited_at ?? undefined,
      authors: [siteUrl],
      tags: listed.tag_list,
      images: image ? [{ url: image, ...imageSize }] : undefined
    },
    twitter: {
      site: "@danielbergholz",
      creator: "@danielbergholz",
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: image ? [image] : undefined
    }
  }
}

export default async function BlogArticle({
  params
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()

  const [resolved, dict] = await Promise.all([
    resolveArticle(lang, slug),
    getDictionary(lang)
  ])
  if ("redirectTo" in resolved) permanentRedirect(resolved.redirectTo)

  const { listed, article } = resolved
  const t = dict.blog
  const url = `${siteUrl}${blogArticlePath(lang, slug)}`

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    image: articleImage(article),
    datePublished: article.published_at,
    dateModified: article.edited_at ?? article.published_at,
    inLanguage: languageTags[lang],
    keywords: listed.tag_list,
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: "Daniel Bergholz",
      url: siteUrl
    }
  }

  return (
    <main id="main" className="my-14 md:my-28 max-w-3xl mx-auto">
      <JsonLd data={blogPostingSchema} />

      <article className="flex flex-col gap-6 md:gap-8">
        <header className="flex flex-col gap-4 md:gap-5">
          <Link
            href={localePath(lang, "/blog")}
            className="w-max text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            &larr; {t.backToBlog}
          </Link>
          <h1 className="font-serif text-3xl md:text-5xl italic tracking-tight leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 text-xs uppercase tracking-widest opacity-60">
            <time dateTime={article.published_at}>
              {readableDate(article.published_at, lang)}
            </time>
            <span>
              · {article.reading_time_minutes} {dict.card.minRead}
            </span>
          </div>
          {article.cover_image && (
            <ArticleCover
              src={article.cover_image}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          )}
        </header>

        {/* dev.to renders and sanitizes the markdown (Rouge-highlighted code,
            YouTube iframes, GIFs from its CDN); we only style it — see
            .article-body in globals.css. */}
        <div
          className="article-body"
          lang={languageTags[lang]}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: body_html is sanitized by dev.to (Forem) before it reaches us
          dangerouslySetInnerHTML={{ __html: article.body_html }}
        />

        <footer className="flex flex-col gap-5 border-t border-current/10 dark:border-current/20 pt-6">
          {listed.tag_list.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={t.tagsAria}>
              {listed.tag_list.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-current/20 px-2 py-1 text-[11px] uppercase tracking-wide opacity-70"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-max items-center gap-1.5 rounded-sm border border-current/15 dark:border-current/25 px-2.5 py-1.5 text-xs uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground transition-colors"
          >
            {t.discussOnDevto}
            <ExternalLink />
          </a>
        </footer>
      </article>
    </main>
  )
}
