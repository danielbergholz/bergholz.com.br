import type { Metadata } from "next"

import { ContentFeed } from "@/components/content-feed"
import { MembershipCTA } from "@/components/membership-cta"
import { getContentFeed } from "@/data-access/content"
import { getDictionary } from "@/dictionaries"
import { getCurrentYear } from "@/lib/current-year"
import { getLocale } from "@/lib/locale"
import { localizedMetadata } from "@/lib/localized-metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return localizedMetadata(locale, "/videos", {
    ...dict.meta.videos
  })
}

export default async function Videos() {
  const lang = await getLocale()
  const dict = await getDictionary(lang)

  const [items, currentYear] = await Promise.all([
    getContentFeed(),
    getCurrentYear()
  ])

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
        currentYear={currentYear}
        t={dict.feed}
        cardLabels={dict.card}
      />

      <div className="mt-10 md:mt-14">
        <MembershipCTA t={dict.membership} />
      </div>
    </main>
  )
}
