import type { Metadata } from "next"

import { SiteDocument } from "@/components/site-document"
import { getDictionary } from "@/dictionaries"
import { locales } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"
import { localizedMetadata } from "@/lib/localized-metadata"
import { rootMetadata } from "@/lib/metadata"

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
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
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument locale={await getLocale()}>{children}</SiteDocument>
}
