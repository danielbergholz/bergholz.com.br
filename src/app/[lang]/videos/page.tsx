import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentFeed } from "@/components/content-feed"
import { MembershipCTA } from "@/components/membership-cta"
import { getDictionary } from "@/dictionaries"
import { getContentFeed } from "@/data-access/content"
import {
  defaultLocale,
  hasLocale,
  localePath,
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
  const t = dict.meta.videos

  return {
    title: t.title,
    description: t.description,
    alternates: pageAlternates(locale, "/videos"),
    openGraph: {
      type: "website",
      siteName: "Daniel Bergholz",
      title: t.title,
      url: localePath(locale, "/videos"),
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

export default async function Videos({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  const items = await getContentFeed()

  return (
    <main id="main" className="my-14 md:my-28 max-w-5xl mx-auto flex flex-col">
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight mb-4">
        {dict.videos.title}
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-60 mb-4 max-w-2xl">
        {dict.videos.intro}
      </p>
      <hr className="w-12 border-t border-current opacity-20 mb-6 md:mb-8" />

      <ContentFeed
        items={items}
        locale={lang}
        t={dict.feed}
        cardLabels={dict.card}
      />

      <div className="mt-10 md:mt-14">
        <MembershipCTA t={dict.membership} />
      </div>
    </main>
  )
}
