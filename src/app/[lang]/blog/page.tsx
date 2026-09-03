import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ArticleCard } from "@/components/article-card"
import { BlogLoadingSkeleton } from "@/components/skeletons"
import { getPublishedArticles } from "@/data-access/blog"
import { getArticleVideoThumbnails } from "@/data-access/content"
import { type Dictionary, getDictionary } from "@/dictionaries"
import { articlesForLocale, blogFeedPath } from "@/lib/blog"
import {
  type Locale,
  defaultLocale,
  hasLocale,
  localePath,
  locales,
  pageAlternates
} from "@/lib/i18n"

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)
  const t = dict.meta.blog

  return {
    title: t.title,
    description: t.description,
    alternates: {
      ...pageAlternates(locale, "/blog"),
      types: {
        "application/rss+xml": localePath(locale, blogFeedPath)
      }
    },
    openGraph: {
      type: "website",
      siteName: "Daniel Bergholz",
      title: t.title,
      url: localePath(locale, "/blog"),
      description: t.description,
      images: {
        url: "https://bergholz.com.br/og.png",
        width: 1200,
        height: 630
      }
    },
    twitter: {
      site: "@danielbergholz",
      creator: "@danielbergholz",
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: {
        url: "https://bergholz.com.br/og.png",
        width: 1200,
        height: 630
      }
    }
  }
}

export const revalidate = 3600 // 1 hour

// The skeleton lives in an in-page Suspense boundary instead of a route-level
// loading.tsx: a loading boundary here would also wrap /blog/[slug] and flush
// a 200 shell before its notFound() runs, turning real 404s into soft 404s.
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

      <div className="mt-8 md:mt-10 flex flex-col gap-2 text-sm opacity-60">
        <p>
          {t.otherLocaleHint}{" "}
          <Link
            href={localePath(otherLocale, "/blog")}
            className="underline underline-offset-4 hover:opacity-100"
          >
            {t.otherLocaleLink}
          </Link>
        </p>
        <p>
          <a
            href={localePath(lang, blogFeedPath)}
            className="underline underline-offset-4 hover:opacity-100"
            type="application/rss+xml"
          >
            {t.rss}
          </a>
        </p>
      </div>
    </main>
  )
}

async function ArticleList({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const [published, videoThumbnails] = await Promise.all([
    getPublishedArticles(),
    getArticleVideoThumbnails()
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
          t={dict.card}
          priority={index === 0}
        />
      ))}
    </div>
  )
}
