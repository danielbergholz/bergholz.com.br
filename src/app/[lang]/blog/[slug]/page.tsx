import type { Metadata, Route } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { cache } from "react"

import { ArticleCover } from "@/components/article-card"
import { JsonLd } from "@/components/json-ld"
import { getArticle, getPublishedArticles } from "@/data-access/blog"
import { getArticleVideoDetails } from "@/data-access/content"
import { getDictionary } from "@/dictionaries"
import { articleImage, articlesForLocale, blogArticlePath } from "@/lib/blog"
import { renderArticleVideo } from "@/lib/blog-video"
import { getCurrentYear } from "@/lib/current-year"
import { isVideoPublished } from "@/lib/feed"
import {
  hasLocale,
  type Locale,
  languageTags,
  localePath,
  openGraphLocales,
  siteLanguage
} from "@/lib/i18n"
import { getLocale } from "@/lib/locale"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"
import type { PublishedArticle, PublishedArticleWithBody } from "@/lib/types"
import { readableDate } from "@/lib/utils"

// Show the complete, locally prerendered article after resolving its slug.
// This route deliberately blocks instead of introducing a streamed skeleton.
export const instant = false

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

// Resolve metadata and body from the same generated local corpus. React cache
// shares the result between generateMetadata and the page.
type ResolvedArticle =
  | { redirectTo: Route }
  | { listed: PublishedArticle; article: PublishedArticleWithBody }

const resolveArticle = cache(
  async (lang: Locale, slug: string): Promise<ResolvedArticle> => {
    const posts = await getPublishedArticles()
    const listed =
      posts.find(
        (article) => article.slug === slug && article.language === lang
      ) ?? posts.find((article) => article.slug === slug)
    const locale = listed && siteLanguage(listed.language)
    if (!listed || !locale) notFound()
    if (locale !== lang) return { redirectTo: blogArticlePath(locale, slug) }

    const article = await getArticle(slug, lang)
    if (!article) notFound()
    return { listed, article }
  }
)

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const [{ slug }, lang] = await Promise.all([params, getLocale()])

  const resolved = await resolveArticle(lang, slug)
  if ("redirectTo" in resolved) return {}

  const { listed, article } = resolved
  const path = blogArticlePath(lang, slug)
  const image = articleImage(article)
  const pendingVideo =
    article.videoId &&
    !isVideoPublished((await getArticleVideoDetails()).get(article.videoId))
  // Imported social cards preserve their original 1200×627 dimensions.
  const imageSize = article.social_image
    ? { width: 1200, height: 627 }
    : { width: 1000, height: 420 }

  // A post exists in one language only, so there are no hreflang pairs: just
  // the canonical, which is this page.
  return pageMetadata({
    title: `${article.title} | ${site.name}`,
    description: article.description,
    path,
    image: image ? { url: image, ...imageSize, alt: article.title } : undefined,
    noIndex: Boolean(pendingVideo),
    openGraph: {
      type: "article",
      title: article.title,
      locale: openGraphLocales[lang],
      publishedTime: article.published_at,
      modifiedTime: article.edited_at ?? undefined,
      authors: [site.url],
      tags: listed.tag_list
    }
  })
}

export default async function BlogArticle({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const [{ slug }, lang] = await Promise.all([params, getLocale()])

  const [resolved, dict, currentYear] = await Promise.all([
    resolveArticle(lang, slug),
    getDictionary(lang),
    getCurrentYear()
  ])
  if ("redirectTo" in resolved) permanentRedirect(resolved.redirectTo)

  const { listed, article } = resolved
  const t = dict.blog
  const url = `${site.url}${blogArticlePath(lang, slug)}`
  const videoDetails = article.videoId
    ? (await getArticleVideoDetails()).get(article.videoId)
    : undefined
  const bodyHtml = renderArticleVideo(
    article.body_html,
    article.videoId,
    videoDetails,
    t
  )

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
      name: site.author.name,
      url: site.url
    }
  }

  return (
    <main id="main" className="my-14 md:my-28 max-w-3xl mx-auto">
      <JsonLd data={blogPostingSchema} />

      <article className="flex flex-col gap-6 md:gap-8">
        <header className="flex flex-col gap-4 md:gap-5">
          <Link
            href={localePath(lang, "/videos")}
            className="w-max text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            &larr; {t.backToVideos}
          </Link>
          <h1 className="font-serif text-3xl md:text-5xl italic tracking-tight leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 text-xs uppercase tracking-widest opacity-60">
            <time dateTime={article.published_at}>
              {readableDate(article.published_at, lang, currentYear)}
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

        <div
          className="article-body"
          lang={languageTags[lang]}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown HTML is sanitized at build time before trusted embed/highlight transforms
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
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
        </footer>
      </article>
    </main>
  )
}
