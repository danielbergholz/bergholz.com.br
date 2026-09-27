import Link from "next/link"
import { lang } from "next/root-params"

import { boundaryStrings } from "@/dictionaries/boundary"
import { defaultLocale, hasLocale, localePath } from "@/lib/i18n"

// not-found boundaries receive no params, so the locale comes from the root
// [lang] segment through next/root-params.
export default async function NotFound() {
  const value = await lang()
  const locale = hasLocale(value) ? value : defaultLocale
  const t = boundaryStrings[locale]

  return (
    <main
      id="main"
      className="text-left w-auto md:w-[500px] mx-auto my-48 md:my-56 flex-col gap-3 flex"
    >
      <h1 className="text-2xl md:text-3xl font-bold">{t.notFoundTitle}</h1>
      <h2 className="text-base md:text-xl">{t.notFoundBody}</h2>
      <Link
        href={localePath(locale, "/")}
        className="opacity-60 underline w-max text-base md:text-xl"
        title={t.homeTitle}
      >
        {t.home}
      </Link>
    </main>
  )
}
