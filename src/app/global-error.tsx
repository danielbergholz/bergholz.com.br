"use client"

import { Instrument_Serif, Poppins } from "next/font/google"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { boundaryStrings } from "@/dictionaries/boundary"
import { defaultLocale, hasLocale, languageTags, localePath } from "@/lib/i18n"

import "./globals.css"

// Global error boundary — the last line of defence. Next.js renders its own
// document here (this replaces the ROOT LAYOUT when it throws), so everything
// has to be provided locally: <html>, <body>, global styles and fonts. Nav,
// Footer and the dictionaries are not available.
const poppins = Poppins({ weight: ["400", "700"], subsets: ["latin"] })
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif"
})

// The locale comes from the pathname because this boundary sits above [lang]
// and so has no params to read. English is the only prefixed locale
// (Portuguese lives at the root — see lib/i18n), so the first path segment is
// the whole lookup. usePathname() yields null when no router is above us, which
// is why this falls back to the default locale rather than assuming a value.
function localeFromPathname(pathname: string | null) {
  const segment = pathname?.split("/")[1] ?? ""
  return hasLocale(segment) ? segment : defaultLocale
}

// `metadata` is not supported in error boundaries, so the title comes from
// React's <title> instead. Both the title and <html lang> have to be owned by
// React: this boundary ships as client-only HTML and React overwrites any
// attribute it renders, so a pre-hydration script cannot hold either of them.
//
// Theme: globals.css follows `prefers-color-scheme` whenever <html> has no
// data-theme attribute, and this boundary never sees the layout's theme script —
// leaving it unset is what keeps the page matching the OS (the documented
// behaviour for this boundary).
export default function GlobalError({
  error,
  retry
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const locale = localeFromPathname(usePathname())
  const t = boundaryStrings[locale]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang={languageTags[locale]} suppressHydrationWarning>
      <head>
        <title>{`${t.errorTitle} | Daniel Bergholz`}</title>
      </head>
      <body
        className={`${poppins.className} ${instrumentSerif.variable} px-6 md:px-10 py-5 md:py-6`}
      >
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
              onClick={retry}
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
      </body>
    </html>
  )
}
