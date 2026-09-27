"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"

import { boundaryStrings } from "@/dictionaries/boundary"
import { defaultLocale, hasLocale, localePath } from "@/lib/i18n"

export default function ErrorPage({
  error,
  retry
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const params = useParams<{ lang: string }>()
  const locale =
    params?.lang && hasLocale(params.lang) ? params.lang : defaultLocale
  const t = boundaryStrings[locale]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      id="main"
      className="my-14 md:my-28 max-w-2xl mx-auto flex flex-col gap-5 text-left"
    >
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight">
        {t.errorTitle}
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-60">
        {t.errorBody}
      </p>
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex items-center justify-center min-h-11 rounded-sm bg-foreground px-5 py-2.5 text-xs uppercase tracking-widest text-background hover:opacity-80 transition-opacity"
        >
          {t.tryAgain}
        </button>
        <a
          href={localePath(locale, "/")}
          className="inline-flex items-center justify-center min-h-11 rounded-sm border border-current/30 px-5 py-2.5 text-xs uppercase tracking-widest hover:border-current/60 transition-colors"
        >
          {t.goHome}
        </a>
      </div>
    </main>
  )
}
