import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  GitHub,
  Instagram,
  LinkedIn,
  Twitter,
  YouTube
} from "@/components/icons"
import { Link } from "@/components/link"
import { getDictionary } from "@/dictionaries"
import { defaultLocale, hasLocale, pageAlternates } from "@/lib/i18n"
import { instagramUrl, youtubeChannels } from "@/lib/socials"

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  return {
    title: dict.meta.links.title,
    description: dict.meta.links.description,
    alternates: pageAlternates(locale, "/links")
  }
}

export default async function Links({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const t = dict.links

  return (
    <main id="main" className="my-14 md:my-28">
      <div className="flex flex-col items-center mb-6 md:mb-8">
        <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight">
          {t.title}
        </h1>
        <hr className="w-12 border-t border-current opacity-20 mt-4" />
      </div>
      <section
        aria-label={t.sectionAria}
        className="flex flex-col items-center gap-3"
      >
        {youtubeChannels(lang).map(({ href, tag }) => (
          <Link key={href} href={href} title={`YouTube · ${tag}`}>
            <YouTube width={28} height={28} />
          </Link>
        ))}

        <Link href={instagramUrl} title="Instagram">
          <Instagram width={26} height={26} />
        </Link>

        <Link href="https://twitter.com/danielbergholz" title="Twitter">
          <Twitter width={25} height={25} />
        </Link>

        <Link
          href="https://www.linkedin.com/in/daniel-gobbi-bergholz/"
          title="LinkedIn"
        >
          <LinkedIn width={28} height={28} />
        </Link>

        <Link href="https://github.com/danielbergholz" title="GitHub">
          <GitHub width={28} height={28} />
        </Link>
      </section>
    </main>
  )
}
