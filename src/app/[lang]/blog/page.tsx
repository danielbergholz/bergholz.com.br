import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ArticleCard } from "@/components/article-card"
import { CARD_BASE } from "@/components/content-card"
import { BlogLoadingSkeleton } from "@/components/skeletons"
import { getPublishedArticles } from "@/data-access/blog"
import { getArticleVideoThumbnails } from "@/data-access/content"
import { type Dictionary, getDictionary } from "@/dictionaries"
import { articlesForLocale, blogFeedPath } from "@/lib/blog"
import { getCurrentYear } from "@/lib/current-year"
import {
  defaultLocale,
  hasLocale,
  type Locale,
  languageTags,
  localePath,
  locales
} from "@/lib/i18n"
import { localizedMetadata } from "@/lib/localized-metadata"

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  const metadata = localizedMetadata(locale, "/blog", dict.meta.blog)
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { "application/rss+xml": localePath(locale, blogFeedPath) }
    }
  }
}

// The skeleton wraps only the post list (not a route-level loading.tsx), so
// the heading and intro render right away.
export default async function Blog({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const t = dict.blog
  const otherLocale = locales.find((locale) => locale !== lang) ?? lang

  return (
    <main id="main" className="my-14 md:my-28 max-w-5xl mx-auto flex flex-col">
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight mb-4">
        {t.title}
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-60 mb-4 max-w-2xl">
        {t.intro}
      </p>
      <hr className="w-12 border-t border-current opacity-20 mb-6 md:mb-8" />

      <Suspense fallback={<BlogLoadingSkeleton />}>
        <ArticleList lang={lang} dict={dict} />
      </Suspense>

      <Link
        href={localePath(otherLocale, "/blog")}
        lang={languageTags[otherLocale]}
        className={`${CARD_BASE} mt-8 md:mt-10 items-center justify-between gap-4 p-5 md:p-6`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-base md:text-lg font-bold group-hover:opacity-80 transition-opacity">
            {t.otherLocaleLink}
          </span>
          <span className="text-xs md:text-sm opacity-50 leading-relaxed">
            {t.otherLocaleHint}
          </span>
        </div>
        <span
          className="shrink-0 text-xl opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all motion-reduce:transition-none"
          aria-hidden="true"
        >
          &rarr;
        </span>
      </Link>

      <p className="mt-6 text-sm opacity-60">
        <a
          href={localePath(lang, blogFeedPath)}
          className="underline underline-offset-4 hover:opacity-100"
          type="application/rss+xml"
        >
          {t.rss}
        </a>
      </p>
    </main>
  )
}

async function ArticleList({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const [published, videoThumbnails, currentYear] = await Promise.all([
    getPublishedArticles(),
    getArticleVideoThumbnails(),
    getCurrentYear()
  ])
  const articles = articlesForLocale(published, lang)

  if (articles.length === 0) {
    return (
      <p className="opacity-60 text-sm md:text-base" role="status">
        {dict.blog.empty}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          videoThumbnailUrl={videoThumbnails.get(article.id)}
          locale={lang}
          currentYear={currentYear}
          t={dict.card}
          priority={index === 0}
        />
      ))}
    </div>
  )
}
