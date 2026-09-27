import type { Metadata } from "next"

import {
  GitHub,
  Instagram,
  LinkedIn,
  Twitter,
  YouTube
} from "@/components/icons"
import { Link } from "@/components/link"
import { getDictionary } from "@/dictionaries"
import { getLocale } from "@/lib/locale"
import { localizedMetadata } from "@/lib/localized-metadata"
import { socialUrls, youtubeChannels } from "@/lib/socials"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return localizedMetadata(locale, "/links", {
    ...dict.meta.links
  })
}

export default async function Links() {
  const lang = await getLocale()
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

        <Link href={socialUrls.instagram} title="Instagram">
          <Instagram width={26} height={26} />
        </Link>

        <Link href={socialUrls.x} title="Twitter">
          <Twitter width={25} height={25} />
        </Link>

        <Link href={socialUrls.linkedin} title="LinkedIn">
          <LinkedIn width={28} height={28} />
        </Link>

        <Link href={socialUrls.github} title="GitHub">
          <GitHub width={28} height={28} />
        </Link>
      </section>
    </main>
  )
}
