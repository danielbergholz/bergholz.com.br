import type { Metadata } from "next"

import { SiteDocument } from "@/components/site-document"
import { getDictionary } from "@/dictionaries"
import { defaultLocale, hasLocale, locales } from "@/lib/i18n"
import { localizedMetadata } from "@/lib/localized-metadata"
import { rootMetadata } from "@/lib/metadata"

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  return {
    ...rootMetadata,
    ...localizedMetadata(locale, "/", {
      ...dict.meta.home,
      keywords: [
        "Daniel Bergholz",
        "Software Engineer",
        "Content Creator",
        "Solopreneur",
        "SaaS Products",
        "CourseShelf",
        "Programming",
        "Software Development",
        "React.js",
        "Next.js",
        "Elixir",
        "Phoenix",
        "Web Development",
        "JavaScript",
        "TypeScript"
      ]
    })
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  return <SiteDocument locale={locale}>{children}</SiteDocument>
}
